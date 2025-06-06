%lex
%%
\s+        /* skip whitespace */
<<EOF>>    return 'EOF';
[^\s]+    return 'WORD';
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