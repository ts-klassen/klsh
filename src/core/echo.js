const { parse } = require('./parse_args');

function main({ args = [], stdin = '', env = {} }) {
  const optionSpec = [
    { key: 'no_newline', short_tag: 'n', spec: 'flag', help: 'do not output the trailing newline' }
  ];
  const { options, operands } = parse(args, optionSpec);
  const noNl = options.no_newline === true;
  const stdout = operands.join(' ') + (noNl ? '' : '\n');
  const stderr = '';
  const newEnv = Object.assign({}, env, { '?': 0 });
  return { stdout, stderr, env: newEnv };
}

module.exports = { main };
