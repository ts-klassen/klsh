// Patch that enhances klsh.parser.klsh_literal to support variable expansion
// and command substitution.  Loaded automatically by build.js after the core
// grammar modules have been attached.

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
      let node = [];
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

    if (ch === "'") {
      let j = i + 1;
      while (j < len && input[j] !== "'") j++;
      flush(buffer, out);
      const txt = j < len ? input.slice(i + 1, j) : input.slice(i + 1);
      out.push({ type: 'text', value: txt });
      i = j < len ? j + 1 : len;
      continue;
    }

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

    if (ch === '$') {
      flush(buffer, out);
      i = handleDollar(input, i);
      continue;
    }

    buffer.str += ch;
    i++;
  }

  flush(buffer, out);
  return out;
}

module.exports = { enhancedKlshLiteral };

// Apply the patch immediately when bundled (build.js executes this file after
// grammars are attached).
if (typeof klsh !== 'undefined' && klsh.parser) {
  klsh.parser.klsh_literal = enhancedKlshLiteral;
}
