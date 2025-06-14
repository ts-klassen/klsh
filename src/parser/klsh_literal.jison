%lex
%%
<<EOF>>                 return 'EOF';
\\(.|\s)                {yytext = yytext[1]; return 'TEXT'};
\'([^\']*)\'            return 'SQUOTE';
\"([^\"\\]|\\.)*\"      return 'DQUOTE';
\$\(([^\)\\]|\\.)*\)    return 'TEXT';
\`([^\`\\]|\\.)*\`      return 'TEXT';
[^\\\'\"\s\`\$]+        return 'TEXT';
\$[^\\\'\"\s\`\$]+      return 'TEXT';
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
        { $$ = $1; }
    | parts item
        { $$ = $1.concat($2); }
    ;

item
    : TEXT
        {
            $$ = klsh.parser.klsh_text( klsh.parser.no_quote($1) );
        }
    | SQUOTE
        {
            $$ = [{ type: 'text', value: klsh.parser.single_quote($1) }];
        }
    | DQUOTE
        {
            $$ = klsh.parser.klsh_text( klsh.parser.double_quote($1) );
        }
    ;

%%
