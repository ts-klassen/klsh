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

function nodesToString(nodes) {
    return nodes.map(function(n) { return n.value; }).join('');
}

function mkRedirect(token, nodes, kind) {
    var m = token.match(/^([0-9]*)(?:>>?|<)$/);
    var fd = (m && m[1]) ? m[1] : (kind === 'input' ? '0' : '1');
    return { type: kind, fd: fd, value: nodesToString(nodes) };
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

module.exports = { main, no_quote, single_quote, double_quote, mkRedirect, mkDup, nodesToString };
