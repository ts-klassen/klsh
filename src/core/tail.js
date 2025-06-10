// 'tail' command: print the last part of input with GNU-like options
const fs = require('./fs');

async function main({ args = [], stdin = '', env = {} }) {
  // parse options using generic parser
  const parseArgs = require('./parse_args');
  const optionSpec = [
    { key: 'lines', short_tag: 'n', long_tag: 'lines', spec: 'string', help: 'print the last NUM lines' },
    { key: 'bytes', short_tag: 'c', long_tag: 'bytes', spec: 'string', help: 'print the last NUM bytes' }
  ];
  const { options, operands, unknown } = parseArgs.parse(args, optionSpec);
  // handle unrecognized options
  if (unknown && unknown.length > 0) {
    const opt = unknown[0];
    const msg = `tail: unrecognized option '${opt}'\nTry 'tail --help' for more information.\n`;
    return { stdout: '', stderr: msg, env: Object.assign({}, env, { '?': 1 }) };
  }

  // Handle missing arguments for string options (value === undefined)
  function argMissing(flag) {
    return {
      stdout: '',
      stderr: `tail: option '${flag}' requires an argument\nTry 'tail --help' for more information.\n`,
      env: Object.assign({}, env, { '?': 1 })
    };
  }

  if (Object.prototype.hasOwnProperty.call(options, 'bytes') && options.bytes === undefined) {
    return argMissing('--bytes');
  }
  if (Object.prototype.hasOwnProperty.call(options, 'lines') && options.lines === undefined) {
    return argMissing('--lines');
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
          ? `tail: ${file}: No such file or directory\n`
          : `tail: ${file}: ${err.message}\n`;
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
    if (raw === undefined || sign === null) {
      selected = num >= lines.length ? lines : lines.slice(-num);
    } else if (sign === '+') {
      // start with line NUM (1-based)
      selected = num > 0 ? lines.slice(num - 1) : lines;
    } else if (sign === '-') {
      // last NUM lines
      selected = num >= lines.length ? lines : lines.slice(-num);
    }
    if (selected.length > 0) stdout = selected.join('\n') + '\n';
  } else {
    const raw = countValue;
    const sign = raw && (raw[0] === '+' || raw[0] === '-') ? raw[0] : null;
    const num = raw !== undefined ? parseInt(raw.replace(/^[+-]/, ''), 10) : 0;

    const encoder = new TextEncoder();
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const bytes = encoder.encode(input);
    let sliced;
    if (raw === undefined || sign === null) {
      const n = num;
      sliced = n >= bytes.length ? bytes : bytes.slice(bytes.length - n);
    } else if (sign === '+') {
      sliced = bytes.slice(num - 1);
    } else if (sign === '-') {
      const n = num;
      sliced = n >= bytes.length ? bytes : bytes.slice(bytes.length - n);
    }
    stdout = decoder.decode(sliced);
  }
  return { stdout, stderr: '', env: Object.assign({}, env, { '?': 0 }) };
}

module.exports = { main };