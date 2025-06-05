const { parse } = require('./parse_args');

function _interpretEscapes(s) {
  let out = '';
  let suppressed = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '\\') {
      i++;
      if (i >= s.length) break;
      const nxt = s[i];
      switch (nxt) {
        case 'a': out += '\x07'; break;
        case 'b': out += '\b'; break;
        case 'c': suppressed = true; i = s.length; break;
        case 'e': case 'E': out += '\x1b'; break;
        case 'f': out += '\f'; break;
        case 'n': out += '\n'; break;
        case 'r': out += '\r'; break;
        case 't': out += '\t'; break;
        case 'v': out += '\v'; break;
        case '\\': out += '\\'; break;
        case '0': {
          let oct = '';
          let j = i + 1;
          while (j < s.length && oct.length < 3 && /[0-7]/.test(s[j])) {
            oct += s[j++];
          }
          if (oct) {
            out += String.fromCharCode(parseInt(oct, 8));
            i = j - 1;
          } else {
            out += '\0';
          }
          break;
        }
        case 'x': {
          let hex = '';
          let j = i + 1;
          while (j < s.length && hex.length < 2 && /[0-9A-Fa-f]/.test(s[j])) {
            hex += s[j++];
          }
          if (hex) {
            out += String.fromCharCode(parseInt(hex, 16));
            i = j - 1;
          } else {
            out += 'x';
          }
          break;
        }
        default:
          out += nxt;
      }
    } else {
      out += ch;
    }
  }
  return { str: out, suppressed };
}

function main({ args = [], stdin = '', env = {} }) {
  const eHelp = `enable interpretation of backslash escapes
  \\\\      backslash
  \\a      alert (BEL)
  \\b      backspace
  \\c      produce no further output
  \\e      escape
  \\f      form feed
  \\n      new line
  \\r      carriage return
  \\t      horizontal tab
  \\v      vertical tab
  \\0NNN   byte with octal value NNN (1 to 3 digits)
  \\xHH    byte with hexadecimal value HH (1 to 2 digits)`;
  const optionSpec = [
    { key: 'no_newline', short_tag: 'n', spec: 'flag', help: 'do not output the trailing newline' },
    { key: 'interpret_escapes', short_tag: 'e', spec: 'flag', help: eHelp }
  ];
  const { options, operands } = parse(args, optionSpec);
  const noNl = options.no_newline === true;
  const interp = options.interpret_escapes === true;
  let stdout;
  if (interp) {
    const input = operands.join(' ');
    const { str, suppressed } = _interpretEscapes(input);
    stdout = str;
    if (!suppressed && !noNl) stdout += '\n';
  } else {
    stdout = operands.join(' ') + (noNl ? '' : '\n');
  }
  const stderr = '';
  const newEnv = Object.assign({}, env, { '?': 0 });
  return { stdout, stderr, env: newEnv };
}

module.exports = { main };
