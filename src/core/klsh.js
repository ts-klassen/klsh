function main({ args = [], stdin = '', env = {} }) {
  let stdout = '';
  let stderr = '';
  let currentEnv = Object.assign({}, env);

  // Parse input into commands
  const commands = klsh.parser.klsh(stdin);

  for (const cmd of commands) {
    // Reconstruct command name and its arguments
    const cmdName = cmd.component.map(part => part.value).join('');
    const cmdArgs = cmd.params.map(
      paramParts => paramParts.map(p => p.value).join('')
    );

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