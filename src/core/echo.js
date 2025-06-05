function main({ args = [], stdin = '', env = {} }) {
  const stdout = args.join(' ') + '\n';
  const stderr = '';
  const newEnv = Object.assign({}, env, { '?': 0 });
  return { stdout, stderr, env: newEnv };
}

module.exports = { main };