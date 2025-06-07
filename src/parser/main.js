// Main stub for parser entrypoint
// Returns a not-implemented response
function main({ args = [], stdin = '', env = {} }) {
  const stderr = 'Not implemented\n';
  const newEnv = Object.assign({}, env, { '?': 1 });
  return { stdout: '', stderr, env: newEnv };
}

module.exports = { main };
