// Execute an array of parsed commands and return accumulated output, error, and environment
function run_commands(commands, env) {
  let stdout = '';
  let stderr = '';
  let currentEnv = Object.assign({}, env);
  for (const cmd of commands) {
    const name = literal_to_string(cmd.component, currentEnv);
    const args = cmd.params.map(p => literal_to_string(p, currentEnv));
    const builtin = klsh[name];
    if (builtin && typeof builtin.main === 'function') {
      const res = builtin.main({ args, stdin: '', env: currentEnv });
      stdout += res.stdout;
      stderr += res.stderr;
      currentEnv = res.env;
    } else {
      stderr += `${name}: command not found\n`;
      currentEnv = Object.assign({}, currentEnv, { '?': 127 });
    }
  }
  return { stdout, stderr, env: currentEnv };
}

// Convert a parsed literal (array of parts) into a single string, handling expansions and substitutions
function literal_to_string(parts, env) {
  let str = '';
  for (const part of parts) {
    switch (part.type) {
      case 'text':
        str += part.value;
        break;
      case 'expansion':
        str += env[part.value] !== undefined ? env[part.value] : '';
        break;
      case 'substitution': {
        const sub = run_commands(part.value, Object.assign({}, env));
        let val = sub.stdout;
        if (val.endsWith('\n')) val = val.slice(0, -1);
        str += val;
        break;
      }
      default:
        break;
    }
  }
  return str;
}

// Shell entrypoint: execute parsed commands from stdin
function main({ args = [], stdin = '', env = {} }) {
  const commands = klsh.parser.klsh(stdin);
  return run_commands(commands, env);
}

module.exports = { main };