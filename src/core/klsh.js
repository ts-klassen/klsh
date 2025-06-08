// Deep-clone an object, using structuredClone if available, otherwise JSON fallback
function clone(obj) {
  if (typeof structuredClone === 'function') {
    return structuredClone(obj);
  } else {
    return JSON.parse(JSON.stringify(obj));
  }
}

// Execute a single command stage: name + args with given stdin and env
function execute_cmd(cmd, input, env) {
  const nameObj = literal_to_string(cmd.component, env);
  const name = nameObj.text;
  let stderr = nameObj.stderr;
  const args = [];
  for (const p of cmd.params) {
    const argObj = literal_to_string(p, env);
    stderr += argObj.stderr;
    args.push(argObj.text);
  }
  const builtin = klsh[name];
  if (builtin && typeof builtin.main === 'function') {
    try {
      const res = builtin.main({ args, stdin: input, env });
      stderr += res.stderr;
      return { stdout: res.stdout, stderr, env: clone(res.env) };
    } catch (err) {
      stderr += (err.message || 'Error') + '\n';
      if ('KLSH_VERBOSE_ERROR' in env) {
        stderr += '\n\nKLSH_VERBOSE_ERROR\n' + err.stack + '\n';
      }
      const errEnv = clone(env);
      errEnv['?'] = 255;
      return { stdout: '', stderr, env: errEnv };
    }
  } else {
    stderr += `${name}: command not found\n`;
    const nfEnv = clone(env);
    nfEnv['?'] = 127;
    return { stdout: '', stderr, env: nfEnv };
  }
}

// Execute piped commands recursively
function run_pipeline(cmd, input, env) {
  const result = execute_cmd(cmd, input, env);
  if (cmd.pipe) {
    const next = run_pipeline(cmd.pipe, result.stdout, result.env);
    return { stdout: next.stdout, stderr: result.stderr + next.stderr, env: next.env };
  }
  return result;
}

// Execute an array of parsed commands and return accumulated output, error, and environment
function run_commands(commands, parentEnv) {
  let stdout = '';
  let stderr = '';
  let env = clone(parentEnv);
  for (const cmd of commands) {
    const result = run_pipeline(cmd, '', env);
    stdout += result.stdout;
    stderr += result.stderr;
    env = result.env;
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
function main({ args = [], stdin = '', env: parentEnv = {} }) {
  let stdout = '';
  let stderr = '';
  // Clone initial environment
  let env = clone(parentEnv);
  try {
    const commands = klsh.parser.klsh(stdin);
    return run_commands(commands, env);
  } catch (err) {
    // Syntax error: report and set exit status 2
    stderr += (err.message || 'Parse error') + '\n';
    // Append detailed parseError info if available
    if (err.hash) {
      const h = err.hash;
      if (h.line     !== undefined) stderr += `Line: ${h.line}\n`;
      if (h.token    ) stderr += `Token: ${h.token}\n`;
      if (h.text     ) stderr += `Text: ${h.text}\n`;
      if (h.expected ) stderr += `Expected: ${h.expected}\n`;
    }
    // Include verbose error if requested
    if ('KLSH_VERBOSE_ERROR' in env) {
      stderr += '\n\nKLSH_VERBOSE_ERROR\n' + err.stack + '\n';
    }
    env['?'] = 2;
    return { stdout, stderr, env };
  }
}

module.exports = { main };
