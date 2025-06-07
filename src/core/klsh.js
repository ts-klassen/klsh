// Convert a parsed literal (array of parts) into a single string
function literal_to_string(parts) {
  return parts.map(p => p.value).join('');
}

function main({ args = [], stdin = '', env = {} }) {
  let stdout = '';
  let stderr = '';
  let currentEnv = Object.assign({}, env);

  // Parse input into commands
  const commands = klsh.parser.klsh(stdin);

  for (const cmd of commands) {
    // Reconstruct command name and its arguments
    const cmdName = literal_to_string(cmd.component);
    const cmdArgs = cmd.params.map(literal_to_string);

    // Dispatch to built-in if available
    const builtin = klsh[cmdName];
    if (builtin && typeof builtin.main === 'function') {
      const result = builtin.main({ args: cmdArgs, stdin: '', env: currentEnv });
      stdout += result.stdout;
      stderr += result.stderr;
      currentEnv = result.env;
    } else {
      stderr += `${cmdName}: command not found\n`;
      currentEnv = Object.assign({}, currentEnv, { '?': 127 });
    }
  }

  return { stdout, stderr, env: currentEnv };
}

module.exports = { main };