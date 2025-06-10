// 'head' command: print the first part of input with GNU-like options
const fs = require('./fs');

async function main({ args = [], stdin = '', env = {} }) {
  // parse options
  let mode = 'lines';
  let countValue;
  let i = 0;
  while (i < args.length) {
    const token = args[i];
    if (token === '--') {
      i++;
      break;
    } else if (token.startsWith('--lines=')) {
      mode = 'lines';
      countValue = token.slice('--lines='.length);
      i++;
    } else if (token === '--lines') {
      mode = 'lines';
      countValue = args[i + 1];
      i += 2;
    } else if (token.startsWith('--bytes=')) {
      mode = 'bytes';
      countValue = token.slice('--bytes='.length);
      i++;
    } else if (token === '--bytes') {
      mode = 'bytes';
      countValue = args[i + 1];
      i += 2;
    } else if (token.startsWith('-') && token.length > 1) {
      const opt = token[1];
      if (opt === 'n') {
        mode = 'lines';
        if (token.length > 2) {
          countValue = token.slice(2);
          i++;
        } else {
          countValue = args[i + 1];
          i += 2;
        }
      } else if (opt === 'c') {
        mode = 'bytes';
        if (token.length > 2) {
          countValue = token.slice(2);
          i++;
        } else {
          countValue = args[i + 1];
          i += 2;
        }
      } else {
        break;
      }
    } else {
      break;
    }
  }
  const operands = args.slice(i);
  // read input
  let input = '';
  if (operands.length > 0) {
    for (const file of operands) {
      try {
        input += await fs.readFile(file);
      } catch (err) {
        const msg = err.code === 'ENOENT'
          ? `head: ${file}: No such file or directory\n`
          : `head: ${file}: ${err.message}\n`;
        return { stdout: '', stderr: msg, env: Object.assign({}, env, { '?': 1 }) };
      }
    }
  } else {
    input = stdin;
  }
  // process content
  let stdout = '';
  if (mode === 'lines') {
    const raw = countValue;
    const sign = raw && (raw[0] === '+' || raw[0] === '-') ? raw[0] : null;
    const num = raw !== undefined ? parseInt(raw.replace(/^[+-]/, ''), 10) : 10;
    const lines = input.split('\n');
    if (input.endsWith('\n')) lines.pop();
    let selected;
    if (raw === undefined) {
      selected = lines.slice(0, 10);
    } else if (sign === '+') {
      selected = lines.slice(num - 1);
    } else if (sign === '-') {
      selected = lines.slice(0, Math.max(0, lines.length - num));
    } else {
      selected = lines.slice(0, num);
    }
    if (selected.length > 0) stdout = selected.join('\n') + '\n';
  } else {
    const raw = countValue;
    const sign = raw && (raw[0] === '+' || raw[0] === '-') ? raw[0] : null;
    const num = raw !== undefined ? parseInt(raw.replace(/^[+-]/, ''), 10) : 0;
    if (raw === undefined) {
      stdout = '';
    } else if (sign === '+') {
      stdout = input.slice(num - 1);
    } else if (sign === '-') {
      stdout = input.slice(0, Math.max(0, input.length - num));
    } else {
      stdout = input.slice(0, num);
    }
  }
  return { stdout, stderr: '', env: Object.assign({}, env, { '?': 0 }) };
}

module.exports = { main };