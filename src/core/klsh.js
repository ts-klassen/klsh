// Deep-clone an object, using structuredClone if available, otherwise JSON fallback
function clone(obj) {
  if (typeof structuredClone === 'function') {
    return structuredClone(obj);
  } else {
    return JSON.parse(JSON.stringify(obj));
  }
}

// Execute an array of parsed commands and return accumulated output, error, and environment
function run_commands(commands, parentEnv) {
  let stdout = '';
  let stderr = '';
  let env = clone(parentEnv);
  for (const cmd of commands) {
    const name = literal_to_string(cmd.component, env);
    const args = cmd.params.map(p => literal_to_string(p, env));
    const builtin = klsh[name];
    if (builtin && typeof builtin.main === 'function') {
      const res = builtin.main({ args, stdin: '', env });
      stdout += res.stdout;
      stderr += res.stderr;
      env = clone(res.env);
    } else {
      stderr += `${name}: command not found\n`;
      env['?'] = 127;
      env = clone(env);
    }
  }
  return { stdout, stderr, env };
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
        const sub = run_commands(part.value, env);
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