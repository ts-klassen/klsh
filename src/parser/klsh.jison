%lex
%%
<<EOF>>                                 return 'EOF';
[0-9]*\>\&[0-9]+                        return 'RD_DUP';
[0-9]*\>\>                              return 'RD_APPEND';
[0-9]*\<\<\<                            return 'RD_HERESTR';
[0-9]*\>                                return 'RD_OVERWRITE';

[0-9]*\<                                return 'RD_INPUT';
\|                                      return 'PIPE';
(\\(.|\s)|[^\\\'\"\`\(\)\s;|]+|\'([^\']*)\'|\"([^\"\\]|\\.)*\"|\`([^\`\\]|\\.)*\`|\(([^\)\\]|\\.)*\))+  return 'LITERAL';
[\s;]*[\r\n;][\s;]*                     return 'EOL';
\s+                                     /* skip whitespace */
/lex

%start input
%token LITERAL PIPE EOF EOL RD_APPEND RD_OVERWRITE RD_INPUT RD_DUP RD_HERESTR

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
    | RD_DUP
        { $$ = klsh.parser.mkDup($1); }
    ;

literal
    : LITERAL
        { $$ = klsh.parser.klsh_literal($1) }
    ;

%%
