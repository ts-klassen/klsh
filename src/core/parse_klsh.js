// Core component for parsing commands using prebuilt Jison parser
// 'main' returns a stub; 'parse' invokes the embedded parser
function main({ args = [], stdin = '', env = {} }) {
  const stderr = 'Not implemented\n';
  const newEnv = Object.assign({}, env, { '?': 1 });
  return { stdout: '', stderr, env: newEnv };
}

function parse(cmdLine) {
  // Use the Jison-generated parser for 'klsh'
  return components['parser']['klsh'](cmdLine);
}

module.exports = { main, parse };