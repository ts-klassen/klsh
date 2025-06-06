%lex
%%
\s+                 /* skip whitespace */
<<EOF>>             return 'EOF';
\'[^']*\'        { yytext = yytext.slice(1, -1); return 'WORD'; }
[^\s]+            return 'WORD';
/lex

%start input
%token WORD EOF

%%

input
    : WORD params EOF
        { return { component: $1, params: $2 }; }
    ;

params
    : /* empty */
        { $$ = []; }
    | params WORD
        { $1.push($2); $$ = $1; }
    ;

%%