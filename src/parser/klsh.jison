%lex
%%
<<EOF>>                                 return 'EOF';
[0-9]*\>\&[0-9]+                        return 'RD_DUP';
[0-9]*\>\>                              return 'RD_APPEND';
[0-9]*\<\<\<                            return 'RD_HERESTR';
[0-9]*\<\<                  {
    /*
     * Here-document (<<) redirection handling.
     *
     * This action consumes the delimiter token, extracts the here-document
     * body (everything up to a line that consists solely of the delimiter),
     * removes that body from the lexer input and returns an RD_HEREDOC token
     * whose value matches the expectations laid out in the unit tests.
     */

    // 1. Determine the file-descriptor specified before the operator (if
    //    any).  E.g. "2<<" ⇒ fd = "2"; otherwise default to stdin ("0").
    var m = yytext.match(/^([0-9]*)<<$/);
    var fd = (m && m[1] && m[1].length) ? m[1] : '0';

    // -------------------------------------------------------------
    // 2. Skip optional horizontal whitespace and read the delimiter token.
    while (this._input.length && (this._input[0] === ' ' || this._input[0] === '\t')) {
        this.input();
    }

    var delim = '';
    while (this._input.length) {
        var ch = this.input();
        if (ch === '\n' || ch === ' ' || ch === '\t') {
            // Push the terminator back so it is lexed normally later.
            this.unput(ch);
            break;
        }
        delim += ch;
    }

    if (!delim.length) {
        // Malformed heredoc – treat operator as a literal so that parsing
        // can continue without throwing.
        return 'LITERAL';
    }

    // -------------------------------------------------------------
    // 3. Preserve the remainder of the current command line (after the
    //    delimiter) by consuming it and immediately pushing it back.  This
    //    ensures subsequent redirections/pipes on the same line are tokenised
    //    in the correct order once we return from this rule.
    var restLine = '';
    while (this._input.length && this._input[0] !== '\n') {
        restLine += this.input();
    }
    if (restLine.length) this.unput(restLine);

    // -------------------------------------------------------------
    // 4. Peek ahead to locate the terminating delimiter line and extract the
    //    here-document body.
    var view = this._input;               // begins right after delimiter token
    var lineEndIdx = view.indexOf('\n');  // end of current command line
    if (lineEndIdx === -1) lineEndIdx = view.length;

    var bodyStart = lineEndIdx + 1;       // first char of body text
    // ------------------------------------------------------------------
    // Search for a line which contains ONLY the delimiter token.  We scan
    // for occurrences of "\n" + delim and then verify that the delimiter is
    // followed immediately by a newline or the end-of-input.  This stricter
    // check prevents false positives where the delimiter is merely a prefix
    // of a longer word (e.g. "EOFx").
    var delimSeq = '\n' + delim;
    var delimIdx = -1;
    var searchPos = bodyStart - 1; // include the leading \n in search

    while (true) {
        var candidate = view.indexOf(delimSeq, searchPos);
        if (candidate === -1) break; // not found

        var afterPos = candidate + delimSeq.length; // position after delim
        if (afterPos === view.length || view[afterPos] === '\n') {
            // Delimiter stands alone -> accept.
            delimIdx = candidate;
            break;
        }

        // Otherwise continue searching past this candidate.
        searchPos = candidate + 1;
    }

    if (delimIdx === -1) {
        // Unterminated heredoc – take remainder as body.
        delimIdx = view.length;
    }

    // Body includes the newline immediately before the delimiter to satisfy
    // the unit-test expectations (body text ends with a trailing \n).
    var bodyText = view.slice(bodyStart, delimIdx + 1);
    // If the body unintentionally starts with a leading newline (which can
    // happen for subsequent heredocs declared on the same logical line),
    // strip it so that the captured text matches bash behaviour and the
    // expectations in the unit tests.
    if (bodyText.startsWith('\n')) {
        bodyText = bodyText.slice(1);
    }

    // -------------------------------------------------------------
    // 5. Remove body + delimiter from the input stream so that it is not
    //    lexed again.  Leave the newline *after* the delimiter intact – this
    //    is required when multiple heredocs occur on the same logical line.
    var consumed = (delimIdx + 1) + delim.length; // \n before delim + delim
    this._input = view.slice(0, lineEndIdx + 1) + view.slice(consumed);

    // -------------------------------------------------------------
    // 6. Build the AST node expected by the grammar and return the token.
    var nodes = [{ type: 'text', value: bodyText }];
    // Provide semantic value for the token.
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
