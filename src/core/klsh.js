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
    const nameObj = literal_to_string(cmd.component, env);
    const name = nameObj.text;
    stderr += nameObj.stderr;
    const args = [];
    for (const p of cmd.params) {
      const argObj = literal_to_string(p, env);
      stderr += argObj.stderr;
      args.push(argObj.text);
    }
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

// Convert a parsed literal (array of parts) into a string, capturing any substitution stderr
function literal_to_string(parts, env) {
  let text = '';
  let stderr = '';
  for (const part of parts) {
    switch (part.type) {
      case 'text':
        text += part.value;
        break;
      case 'expansion':
        text += env[part.value] !== undefined ? env[part.value] : '';
        break;
      case 'substitution': {
        const sub = run_commands(part.value, env);
        stderr += sub.stderr;
        let val = sub.stdout;
        if (val.endsWith('\n')) val = val.slice(0, -1);
        text += val;
        break;
      }
      default:
        break;
    }
  }
  return { text, stderr };
}

// Shell entrypoint: execute parsed commands from stdin
function main({ args = [], stdin = '', env = {} }) {
  const commands = klsh.parser.klsh(stdin);
  return run_commands(commands, env);
}

module.exports = { main };