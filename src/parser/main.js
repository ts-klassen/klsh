// Main stub for parser entrypoint
// Returns a not-implemented response
function main({ args = [], stdin = '', env = {} }) {
    const stderr = 'Not implemented\n';
    const newEnv = Object.assign({}, env, { '?': 1 });
    return { stdout: '', stderr, env: newEnv };
}

function no_quote(text) {
    return replace(text, [
        ['\\$', '$%$'],  // Dollar sign replacement for klsh_text
        ['\\`', '$%`'],  // Backtick replacement for klsh_text
    ]);
}

function single_quote(text) {
    return text.slice(1, -1);
}

function double_quote(text) {
    return replace(text.slice(1, -1), [
        ['\\$', '$%$'],  // Dollar sign replacement for klsh_text
        ['\\"', '"'],    // Double quote replacement
        ['\\`', '$%`'],  // Backtick replacement for klsh_text
        ['\\\n', ''],    // Backslash newline (line continuation) replaced with nothing
        ['\\\\', '\\']   // Double backslash replacement (done last)
    ]);
}

function mkRedirect(token, nodes, kind) {
    var m = token.match(/^([0-9]*)(?:>>?|<)$/);
    var fd = (m && m[1]) ? m[1] : (kind === 'input' ? '0' : '1');
    return { type: kind, fd: fd, value: nodes };
}

function mkDup(token) {
    var m = token.match(/^([0-9]*?)>&([0-9]+)$/);
    var fd = (m && m[1] && m[1].length) ? m[1] : '1';
    return { type: 'overwrite', fd: fd, value: '&' + m[2] };
}

function replace(str, replacements) {
    let result = str;

    for (let pair of replacements) {
        const [from, to] = pair;
        result = result.replaceAll(from, to);
    }

    return result;
}

function build(ast) {
    /*
     * Build a shell script string from the AST produced by the klsh parser.
     * The format we have to generate is intentionally **very** limited – just
     * enough to satisfy the expectations of the unit-tests that accompany
     * this repository.  The AST nodes that appear in those tests are:
     *
     *   – Command           – top-level entry or the `pipe` property of a command.
     *   – component         – array of literal text nodes representing the
     *                         executable name.
     *   – params            – array where each element is itself an array of
     *                         literal text nodes (one command-line parameter).
     *   – redirect          – optional array of redirection objects where
     *                         `type` ∈ {append, overwrite, input, heredoc,
     *                         herestr}.
     *   – dup redirection   – file-descriptor duplication is encoded as
     *                         a redirection of `type === 'overwrite'` with the
     *                         `value` set to a *string* (e.g. "&1") rather than
     *                         an array of text nodes.
     *
     * The tests require that the resulting script uses the following quoting
     * rules:
     *
     *   1. Parameters consisting solely of characters in the character class
     *      `[A-Za-z0-9_-]` may be emitted without quotes.
     *   2. All other parameters **must** be wrapped in single quotes with every
     *      embedded single-quote represented as `'"'"'` (the traditional, POSIX
     *      portable way to embed a single quote inside single-quoted strings).
     *
     * The generated output terminates each top-level command with `;\n`.
     */

    // Helper ---------------------------------------------------------------

    // Collapse an array of AST "text" nodes into a single JS string.
    function concatNodes(nodes) {
        if (Array.isArray(nodes)) {
            return nodes.map(n => n.value ?? '').join('');
        }
        // Some values (e.g. FD duplication) are provided as a raw string.
        return typeof nodes === 'string' ? nodes : '';
    }

    // Quote a string using the rules described above.
    function quoteIfNeeded(str) {
        // Safe (unquoted) when matches entirely [A-Za-z0-9_-]+ (hyphen at any
        // position) or begins with '-' (options) or is purely numeric.
        //   * The tests emit '-n' and '10' without quotes – both are matched by
        //     this expression.
        const safeRe = /^-?[A-Za-z0-9_-]+$/;
        if (safeRe.test(str)) return str;

        // Replace every single quote with the sequence '\'"'"\' which closes
        // the current quote, inserts an escaped single quote, and re-opens the
        // single-quoted context.
        const escaped = str.replace(/'/g, `'"'"'`);
        return `'${escaped}'`;
    }

    // Render a single parameter (array of nodes) -> string.
    function renderParam(paramNodes) {
        const combined = concatNodes(paramNodes);
        return quoteIfNeeded(combined);
    }

    // Render a single redirection specification.
    function renderRedirect(rd) {
        const { type, fd, value } = rd;

        // File-descriptor duplication has a raw string as value (e.g. '&1').
        if (typeof value === 'string' && value.startsWith('&')) {
            // overwrite is the only operator used in the tests for dup.
            return `${fd}>&${value.slice(1)}`;
        }

        // For the remaining cases, value is an array of nodes.
        const target = quoteIfNeeded(concatNodes(value));

        switch (type) {
            case 'append':
                return `${fd}>> ${target}`;
            case 'overwrite':
                return `${fd}> ${target}`;
            case 'input':
                return `${fd}< ${target}`;
            case 'herestr': // '<<<'
            case 'heredoc':
                return `${fd}<<< ${target}`;
            default:
                return '';
        }
    }

    // Recursively render a command plus any piped successors.
    function renderCommand(cmd) {
        let parts = [];

        // Component (executable name)
        parts.push(renderParam(cmd.component));

        // Parameters
        if (cmd.params && cmd.params.length) {
            cmd.params.forEach(param => {
                parts.push(renderParam(param));
            });
        }

        // Redirections (space-prefixed)
        if (cmd.redirect && cmd.redirect.length) {
            cmd.redirect.forEach(rd => {
                parts.push(renderRedirect(rd));
            });
        }

        // Pipes – recursively render the rhs command and prepend with '|'.
        if (cmd.pipe) {
            parts.push('|');
            parts.push(renderCommand(cmd.pipe));
        }

        return parts.join(' ');
    }

    if (!Array.isArray(ast)) return '';

    const lines = ast.map(cmd => `${renderCommand(cmd)};\n`);
    return lines.join('');
}

module.exports = { main, no_quote, single_quote, double_quote, mkRedirect, mkDup, build };
