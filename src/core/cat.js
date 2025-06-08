// 'cat' command: output stdin unchanged
function main({ args = [], stdin = '', env = {} }) {
  const stdout = stdin;
  const stderr = '';
  const newEnv = Object.assign({}, env, { '?': 0 });
  return { stdout, stderr, env: newEnv };
}

module.exports = { main };