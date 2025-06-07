%lex
%%
<<EOF>>             return 'EOF';
([^\'\"\s]+|\'([^\']*)\'|\"([^\"\\]|\\.)*\")+            return 'LITERAL';
\s+                 /* skip whitespace */
/lex

%start input
%token LITERAL EOF

%%

input
    : LITERAL params EOF
        { return { component: $1, params: $2 }; }
    ;

params
    : /* empty */
        { $$ = []; }
    | params LITERAL
        { $1.push($2); $$ = $1; }
    ;

%%
