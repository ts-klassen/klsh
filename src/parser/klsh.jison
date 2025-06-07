%lex
%%
<<EOF>>                                          return 'EOF';
(\\[.\s]|[^\\\'\"\s]+|\'([^\']*)\'|\"([^\"\\]|\\.)*\")+    return 'LITERAL';
\s+                                              /* skip whitespace */
/lex

%start input
%token LITERAL EOF

%%

input
    : literal params EOF
        { return { component: $1, params: $2 }; }
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
