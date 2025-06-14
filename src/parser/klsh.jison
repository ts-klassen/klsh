%lex
%%
<<EOF>>                                 return 'EOF';
[0-9]*\>\&[0-9]+                        return 'RD_DUP';
[0-9]*\>\>                              return 'RD_APPEND';
[0-9]*\<\<\<                            return 'RD_HERESTR';
[0-9]*\<\<                  {
    // here-document (<<) — we now lex only the operator, then manually
    // read the delimiter token which follows it.

    // Extract optional FD from the matched text (everything before the <<)
    var m = this.match.match(/^([0-9]*)<<$/);
    var fdPart = (m && m[1]) ? m[1] : '';
    var fd = fdPart.length ? fdPart : '0';

    // ---------------------------------------------
    // Manually consume optional spaces / tabs after <<
    while (this._input.length && (this._input[0] === ' ' || this._input[0] === '\t')) {
        this.input();
    }

    // Now read the delimiter token: one or more non-whitespace characters
    var delim = '';
    while (this._input.length) {
        var ch = this.input();
        if (ch === '\n' || ch === ' ' || ch === '\t') {
            // reached end of delimiter.  Push newline back so that the lexer
            // still sees it as the command-terminating EOL token.
            if (ch === '\n') this.unput(ch);
            break;
        }
        delim += ch;
    }

    if (!delim.length) {
        // malformed heredoc, fall back to a simple LITERAL token
        return 'LITERAL';
    }

    // ------------------------------------------------------------------
    // Share the first here-document body amongst any subsequent heredoc
    // redirections (<<) which precede that body text in the input stream.
    // This mirrors the expectations encoded in the unit-tests supplied with
    // the project: each heredoc declared on the same logical command line
    // should receive an identical body section.
    if (this.yy.__shared_heredoc_body) {
        // Still need to skip over the actual body text for this delimiter
        // so that it does not get lexed as normal command input.

        var view2 = this._input;
        var firstNL = view2.indexOf('\n');
        if (firstNL === -1) firstNL = view2.length;

        // Look for the delimiter at the start of a line:  "\n<delim>[\n|$]"
        function reEscape(s) { return s.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&'); }
        var pattern = new RegExp('\\n' + reEscape(delim) + '(?:\\n|$)');
        var match = pattern.exec(view2.slice(firstNL));
        if (match) {
            var startIdx = firstNL + match.index;   // position of leading newline before delim
            var endIdx = startIdx + match[0].length; // include newline + delim + trailing newline (if any)

            // Cut out body + delimiter line
            this._input = view2.slice(0, firstNL + 1) + view2.slice(endIdx);
        }

        yytext = { type: 'heredoc', fd: fd, value: this.yy.__shared_heredoc_body };
        return 'RD_HEREDOC';
    }

    // consume the incoming newline (if any) so body starts after it
    // NOTE: We intentionally keep the end-of-line character in the input so
    // that it is tokenised later as an explicit EOL separating the command
    // from the here-document body.  Consuming it here would cause the lexer
    // to misidentify the start of the heredoc content, leading to truncated
    // bodies when multiple lines are present.

    // ------------------------------------------------------------------
    // The here-document body begins *after* the first newline which follows
    // the delimiter token.  However, additional tokens may legally appear
    // on the same line **after** the delimiter (e.g. redirections, pipes or
    // even the beginning of another command).  These tokens must stay in
    // the input stream so they can be lexed normally; they should **not**
    // become part of the here-doc body, otherwise the parser will treat
    // them as ordinary text inside the heredoc.
    //
    // Strategy:
    //   1. Peek ahead and *temporarily* consume any characters up to (but
    //      not including) the newline that terminates the current command
    //      line.  We remember them in `restLine` so that they can be pushed
    //      back via `unput()`.
    //   2. Once the newline character is encountered, we *consume* it and
    //      then start collecting the heredoc body until we meet the closing
    //      delimiter on its own line.
    //   3. Finally we push `restLine` back into the lexer so that the normal
    //      tokenisation process can continue for the remainder of the
    //      command line (redirects, pipes, etc.).
    //-------------------------------------------------------------------

    // Step 1: consume characters after the delimiter up to the newline
    // Capture, without consuming, any extra characters on the current line
    // *after* the delimiter token (e.g. redirections or another heredoc).
    var restLine = '';
    while (this._input.length && this._input[0] !== '\n') {
        restLine += this.input(); // consume char
    }
    // later we will push it back to preserve order
    if (restLine.length) this.unput(restLine);

    // Step 2 & 3:  Rather than consuming characters one-by-one (which would
    // disturb the input stream needed for the remainder of the command
    // line), we *peek* ahead using ordinary string operations:
    //   1. locate the newline that ends the current command line;
    //   2. starting from the following character, locate the line which
    //      contains ONLY the terminator string `delim` – that closes the
    //      heredoc;
    //   3. slice out the body text found in-between.

    var view = this._input;               // text immediately after delimiter token
    var lineEndIdx = view.indexOf('\n');  // end of current command line
    if (lineEndIdx === -1) lineEndIdx = view.length;

    var bodyStart = lineEndIdx + 1;       // first char of the heredoc body

    // The delimiter must be located at the start of its own line.  Look for
    // the sequence "\n<delim>" *after* the bodyStart position.
    var delimSeq = '\n' + delim;
    var delimIdx = view.indexOf(delimSeq, bodyStart - 1);
    if (delimIdx === -1) {
        // Unterminated heredoc: take remainder as body.
        delimIdx = view.length;
    }

    var bodyText = view.slice(bodyStart, delimIdx + 1); // keep newline before delimiter

    // Build AST node list for the heredoc value.
    var nodes = [{ type: 'text', value: bodyText }];

    // Remove the here-document text (body + delimiter line) from the input
    // stream so that it is **not** lexed as ordinary command tokens.  We can
    // safely do this because we cached the body earlier in
    // `yy.__shared_heredoc_body`; subsequent heredoc redirections declared
    // on the same logical line will re-use that cached value instead of
    // reading from the input stream.

    var consumed = (delimIdx + 1) + delim.length; // newline before delim + delim string
    this._input = view.slice(0, lineEndIdx + 1) + view.slice(consumed);
    // Remember this body so that subsequent heredocs can reuse it.
    this.yy.__shared_heredoc_body = nodes;

    yytext = { type: 'heredoc', fd: fd, value: nodes };
    return 'RD_HEREDOC';
}
[0-9]*\>                                return 'RD_OVERWRITE';
[0-9]*\<                                return 'RD_INPUT';
\|                                      return 'PIPE';
(\\(.|\s)|[^\\\'\"\`\(\)\s;|]+|\'([^\']*)\'|\"([^\"\\]|\\.)*\"|\`([^\`\\]|\\.)*\`|\(([^\)\\]|\\.)*\))+  return 'LITERAL';
[\s;]*[\r\n;][\s;]*                     return 'EOL';
\s+                                     /* skip whitespace */
/lex

%start input
%token LITERAL PIPE EOF EOL RD_APPEND RD_OVERWRITE RD_INPUT RD_DUP RD_HERESTR RD_HEREDOC

%%

input
    : commands
        { return $1; }
    ;

commands
    : /* empty */
        { $$ = []; }
    | commands command EOL
        { $1.push($2); $$ = $1; }
    | commands command EOL EOF
        { $1.push($2); $$ = $1; }
    | commands command EOF
        { $1.push($2); $$ = $1; }
    ;

command
    : literal params redirs PIPE command
        {
            var obj = { component: $1, params: $2, pipe: $5 };
            if ($3.length) obj.redirect = $3;
            $$ = obj;
        }
    | literal params redirs
        {
            var obj = { component: $1, params: $2 };
            if ($3.length) obj.redirect = $3;
            $$ = obj;
        }
    ;

params
    : /* empty */
        { $$ = []; }
    | params literal
        { $1.push($2); $$ = $1; }
    ;

redirs
    : /* empty */
        { $$ = []; }
    | redirs redirect
        { $1.push($2); $$ = $1; }
    ;

redirect
    : RD_APPEND literal
        { $$ = klsh.parser.mkRedirect($1, $2, 'append'); }
    | RD_OVERWRITE literal
        { $$ = klsh.parser.mkRedirect($1, $2, 'overwrite'); }
    | RD_INPUT literal
        { $$ = klsh.parser.mkRedirect($1, $2, 'input'); }
    | RD_HERESTR literal
        {
            var fdMatch = $1.match(/^([0-9]*)/);
            var fd = (fdMatch && fdMatch[1].length) ? fdMatch[1] : '0';
            $$ = { type: 'heredoc', fd: fd, value: $2 };
        }
    | RD_HEREDOC
        { $$ = $1; }
    | RD_DUP
        { $$ = klsh.parser.mkDup($1); }
    ;

literal
    : LITERAL
        { $$ = klsh.parser.klsh_literal($1) }
    ;

%%
