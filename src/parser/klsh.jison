%lex
%%
<<EOF>>                                                    return 'EOF';
(\\[.\s]|[^\\\'\"\s;]+|\'([^\']*)\'|\"([^\"\\]|\\.)*\")+    return 'LITERAL';
[\s;]*[\r\n;][\s;]*                                        return 'EOL'
\s+                                                        /* skip whitespace */
/lex

%start input
%token LITERAL EOF EOL

%%

input
    : commands
        { return $1; }
    ;

commands
    : /* empty */
        { $$ = []; }
    | commands literal params EOL
        { $1.push({ component: $2, params: $3 }); $$ = $1; }
    | commands literal params EOL EOF
        { $1.push({ component: $2, params: $3 }); $$ = $1; }
    | commands literal params EOF
        { $1.push({ component: $2, params: $3 }); $$ = $1; }
    ;

params
    : /* empty */
        { $$ = []; }
    | params literal
        { $1.push($2); $$ = $1; }
    ;

literal
    : LITERAL
        { $$ = klsh.parser.klsh_literal($1) }
    ;

%%
