// Thin Jison wrapper that delegates the *actual* work to a small hand-coded
// JS function embedded at the bottom of this file.  This lets us keep all the
// parser entry-points inside `src/parser/*.jison` (so no runtime patches are
// required) without re-implementing a full shell lexer in BNF.

// The grammar itself is trivial – the lexer emits at most a single `RAW` token
// that contains the complete literal, and the parser simply invokes
// `enhancedKlshLiteral` (the exact same implementation previously living in
// `src/patches/klsh_literal_patch.js`).

%lex
%%
<<EOF>>                 return 'EOF';
[^]+                    { this.yylval = yytext; return 'RAW'; }
/lex

%start input
%token RAW EOF

%%

input
    : RAW EOF           { return enhancedKlshLiteral($1); }
    | EOF               { return []; }
    ;

%%

// ---------------------------------------------------------------------------
// Original hand-written implementation (with only cosmetic tweaks).
// ---------------------------------------------------------------------------

function flush(buf, out) {
  if (buf.str.length > 0) {
    out.push({ type: 'text', value: buf.str });
    buf.str = '';
  }
}

function enhancedKlshLiteral(input) {
  const out = [];
  const len = input.length;
  let i = 0;
  const buffer = { str: '' };

  const isVarChar = c => /[A-Za-z0-9_]/.test(c);

  const handleDollar = (str, idx) => {
    const next = str[idx + 1];

    // $(command)
    if (next === '(') {
      let depth = 1;
      let j = idx + 2;
      while (j < str.length && depth > 0) {
        if (str[j] === '(') depth++;
        else if (str[j] === ')') depth--;
        j++;
      }
      const inner = str.slice(idx + 2, j - 1);
      let node;
      try {
        node = klsh.parser.klsh(inner);
      } catch (_) {
        out.push({ type: 'text', value: str.slice(idx, j) });
        return j;
      }
      out.push({ type: 'substitution', value: node });
      return j;
    }

    // ${VAR}
    if (next === '{') {
      let j = idx + 2;
      while (j < str.length && str[j] !== '}') j++;
      const name = str.slice(idx + 2, j);
      out.push({ type: 'expansion', value: name });
      return j + 1;
    }

    // $VAR
    if (isVarChar(next)) {
      let j = idx + 1;
      while (j < str.length && isVarChar(str[j])) j++;
      const name = str.slice(idx + 1, j);
      out.push({ type: 'expansion', value: name });
      return j;
    }

    // literal '$'
    out.push({ type: 'text', value: '$' });
    return idx + 1;
  };

  while (i < len) {
    const ch = input[i];

    // ------------------ single-quoted ------------------
    if (ch === "'") {
      let j = i + 1;
      while (j < len && input[j] !== "'") j++;
      flush(buffer, out);
      const txt = j < len ? input.slice(i + 1, j) : input.slice(i + 1);
      out.push({ type: 'text', value: txt });
      i = j < len ? j + 1 : len;
      continue;
    }

    // ------------------ double-quoted ------------------
    if (ch === '"') {
      flush(buffer, out);
      let j = i + 1;
      while (j < len && input[j] !== '"') {
        const c = input[j];
        if (c === '\\') {
          if (j + 1 < len) {
            buffer.str += input[j + 1];
            j += 2;
          } else {
            buffer.str += '\\';
            j += 1;
          }
          continue;
        }
        if (c === '$') {
          flush(buffer, out);
          j = handleDollar(input, j);
          continue;
        }
        buffer.str += c;
        j++;
      }
      flush(buffer, out);
      i = j < len ? j + 1 : len;
      continue;
    }

    // ------------------ backslash escape (outside quotes) ------------------
    if (ch === '\\') {
      if (i + 1 < len) {
        buffer.str += input[i + 1];
        i += 2;
      } else {
        buffer.str += '\\';
        i++;
      }
      continue;
    }

    // ------------------ variable / substitution outside quotes ------------
    if (ch === '$') {
      flush(buffer, out);
      i = handleDollar(input, i);
      continue;
    }

    // ------------------ regular character ------------------
    buffer.str += ch;
    i++;
  }

  flush(buffer, out);
  return out;
}
