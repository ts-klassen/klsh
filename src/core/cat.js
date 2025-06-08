// 'cat' command: output stdin unchanged
function main({ args = [], stdin = '', env = {} }) {
  // parse options: support -n, --number to number all output lines
  const { parse } = require('./parse_args');
  const optionSpec = [
    { key: 'number', short_tag: 'n', long_tag: 'number', spec: 'flag', help: 'number all output lines' }
  ];
  const { options } = parse(args, optionSpec);
  let stdout;
  if (options.number) {
    const hasNl = stdin.endsWith('\n');
    const lines = stdin.split('\n');
    const content = hasNl && lines[lines.length - 1] === ''
      ? lines.slice(0, -1)
      : lines;
    const numbered = content.map((line, idx) => `${idx + 1}\t${line}`);
    stdout = numbered.join('\n') + (hasNl ? '\n' : '');
  } else {
    stdout = stdin;
  }
  const stderr = '';
  const newEnv = Object.assign({}, env, { '?': 0 });
  return { stdout, stderr, env: newEnv };
}

module.exports = { main };