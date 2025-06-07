%lex
%%
<<EOF>>                 return 'EOF';
\\(.|\s)                {yytext = yytext[1]; return 'TEXT'};
\'([^\']*)\'            return 'SQUOTE';
\"([^\"\\]|\\.)*\"      return 'DQUOTE';
[^\\\'\"\s]+            return 'TEXT';
/lex

%start input
%token TEXT SQUOTE DQUOTE EOF

%%

input
    : /* empty */ EOF
        { return []; }
    | parts EOF
        { return $1; }
    ;

parts
    : item
        { $$ = [$1]; }
    | parts item
        { $1.push($2); $$ = $1; }
    ;

item
    : TEXT
        { $$ = { type: 'text', value: klsh.parser.no_quote($1) }; }
    | SQUOTE
        {
            $$ = { type: 'text', value: klsh.parser.single_quote($1) };
        }
    | DQUOTE
        {
            $$ = { type: 'text', value: klsh.parser.double_quote($1) };
        }
    ;

%%
