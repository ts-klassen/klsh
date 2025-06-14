%lex
%%
<<EOF>>                 return 'EOF';
\$%\$                   {yytext = '$'; return 'TEXT'};
\$%\`                   {yytext = '`'; return 'TEXT'};
\$[a-zA-Z0-9_-]+        {yytext = yytext.slice(1); return 'EXPANSION'};
\$\{[a-zA-Z0-9_-]+\}    {yytext = yytext.slice(2, -1); return 'EXPANSION'};
\$\(([^\)\\]|\\.)*\)    {yytext = yytext.slice(2, -1); return 'SUBSTITUTION'};
\`([^\`\\]|\\.)*\`      {yytext = yytext.slice(1, -1); return 'SUBSTITUTION'};
[^$`]+                  return 'TEXT';
\$                      return 'TEXT';
/lex

%start input
%token TEXT EXPANSION SUBSTITUTION

%%

input
    : /* empty */ EOF
        { return []; }
    | terms EOF
        { return $1; }
    ;

terms
    : term
        { $$ = [$1]; }
    | terms term
        { $1.push($2); $$ = $1; }
    ;

term
    : TEXT
        { $$ = { type: 'text', value: $1 }; }
    | EXPANSION
        { $$ = { type: 'expansion', value: $1 }; }
    | SUBSTITUTION
        { $$ = { type: 'substitution', value: klsh.parser.klsh($1) }; }
    ;

%%
