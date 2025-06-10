// 'head' command: print the first part of input with GNU-like options
const fs = require('./fs');

async function main({ args = [], stdin = '', env = {} }) {
  // parse options using generic parser
  const parseArgs = require('./parse_args');
  const optionSpec = [
    { key: 'lines', short_tag: 'n', long_tag: 'lines', spec: 'string', help: 'print the first NUM lines' },
    { key: 'bytes', short_tag: 'c', long_tag: 'bytes', spec: 'string', help: 'print the first NUM bytes' }
  ];
  const { options, operands, unknown } = parseArgs.parse(args, optionSpec);
  // handle unrecognized options
  if (unknown && unknown.length > 0) {
    const opt = unknown[0];
    const msg = `head: unrecognized option '${opt}'\nTry 'head --help' for more information.\n`;
    return { stdout: '', stderr: msg, env: Object.assign({}, env, { '?': 1 }) };
  }
  // determine mode and count
  let mode = 'lines';
  let countValue;
  if (options.bytes !== undefined) {
    mode = 'bytes';
    countValue = options.bytes;
  } else if (options.lines !== undefined) {
    mode = 'lines';
    countValue = options.lines;
  }
  // set up operands as files
  const files = operands;
  // read input
  let input = '';
  if (files.length > 0) {
    for (const file of files) {
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