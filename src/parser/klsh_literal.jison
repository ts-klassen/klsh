%lex
%%
<<EOF>>                 return 'EOF';
\'([^\']*)\'         { yylval = yytext; return 'SQUOTE'; }
\"([^\"\\]|\\.)*\"  { yylval = yytext; return 'DQUOTE'; }
[^\'\"\s]+          { yylval = yytext; return 'TEXT'; }
\s+                    /* skip whitespace */;
.                       { yylval = yytext; return 'TEXT'; }
/lex

%start input
%token TEXT SQUOTE DQUOTE EOF

%%

input
    : /* empty */ EOF             { return []; }
    | parts EOF                   { return $1; }
    ;

parts
    : item                       { $$ = [$1]; }
    | parts item                 { $1.push($2); $$ = $1; }
    ;

item
    : TEXT                       { $$ = { type: 'text', value: $1 }; }
    | SQUOTE                     { var text = $1.slice(1, -1); $$ = { type: 'text', value: text }; }
    | DQUOTE                     { var text = $1.slice(1, -1); $$ = { type: 'text', value: text }; }
    ;

%%