// Deep-clone an object, using structuredClone if available, otherwise JSON fallback
function clone(obj) {
  if (typeof structuredClone === 'function') {
    return structuredClone(obj);
  } else {
    return JSON.parse(JSON.stringify(obj));
  }

}

// Execute a single command stage: name + args with given stdin and env
async function execute_cmd(cmd, input, env) {
  // Resolve command name and parameters first (to allow env / substitution errors
  const nameObj = await literal_to_string(cmd.component, env);
  const name = nameObj.text;
  let stderr = nameObj.stderr;

  const args = [];
  for (const p of cmd.params) {
    const argObj = await literal_to_string(p, env);
    stderr += argObj.stderr;
    args.push(argObj.text);
  }

  // -------------------------------------------------------------
  // Handle redirections
  // -------------------------------------------------------------
  let stdinData = input;
  let stdinPath = null;          // Path for any `<` redirection (only last one counts)
  // Collect only the *last* output redirection for each file descriptor, as per POSIX.
  const lastOutputRedir = {};    // fd -> redirection object

  function _norm(p) {
    return typeof p === 'string' ? p.replace(/;+$/, '') : p;
  }

  if (cmd.redirect) {
    for (const rd of cmd.redirect) {
      if (rd.fd === '0') {
        if (rd.type === 'input') {
          const strObj = await literal_to_string(rd.value, env);
          stderr += strObj.stderr;
          stdinPath = _norm(strObj.text);
          try {
            stdinData = await klsh.fs.readFile(stdinPath);
          } catch (err) {
            stderr += `${stdinPath}: ${err.message}\n`;
            const errEnv = clone(env);
            errEnv['?'] = 1;
            return { stdout: '', stderr, env: errEnv };
          }
        } else if (rd.type === 'heredoc') {
          const hereObj = await literal_to_string(rd.value, env);
          stderr += hereObj.stderr;
          stdinData = hereObj.text;
          stdinPath = null; // heredoc is not a file path
        }
      }

      // Track only the last output redirection per fd, resolving its path
      if (rd.type === 'overwrite' || rd.type === 'append') {
        const strObj = await literal_to_string(rd.value, env);
        stderr += strObj.stderr;
        const path = _norm(strObj.text);
        lastOutputRedir[rd.fd] = { fd: rd.fd, type: rd.type, path };
      }
    }
  }

  // Only keep the final redirection per file descriptor.
  const outputRedirs = Object.values(lastOutputRedir);

  // -------------------------------------------------------------
  // Execute the built-in command
  // -------------------------------------------------------------
  const builtin = klsh[name];
  if (builtin && typeof builtin.main === 'function') {
    try {
      const res = await builtin.main({ args, stdin: stdinData, env });
      stderr += res.stderr;

      let stdoutData = res.stdout;
      let stderrData = stderr; // include accumulated stderr so far

      // Special case: `cat` reading from a file and writing back to the same
      // file (e.g. `cat < a >> a`) should emit a diagnostic but otherwise exit 0
      if (name === 'cat' && stdinPath) {
        for (const rd of outputRedirs) {
          if (rd.fd === '1') {
            if (rd.path === stdinPath) {
              stderrData += 'cat: -: input file is output file\n';
              // Suppress stdout as it would have been redirected, but do not
              // perform the actual write to avoid corrupting the file.
              stdoutData = '';
              // Remove the matching redirection entry so it is not executed,
              // but keep others (e.g. redirecting stderr).
              const idx = outputRedirs.indexOf(rd);
              if (idx >= 0) outputRedirs.splice(idx, 1);
              break;
            }
          }
        }
      }

      // Apply output redirections
      let redirectFd1 = false;
      let redirectFd2 = false;

      for (const rd of outputRedirs) {
        const path = rd.path;
        const content = rd.fd === '1' ? stdoutData : stderrData;

        try {
          if (rd.type === 'overwrite') {
            await klsh.fs.writeFile(path, content);
          } else { // append
            await klsh.fs.append(path, content);
          }
        } catch (err) {
          stderrData += `${err.message}\n`;
          const errEnv = clone(res.env);
          errEnv['?'] = 1;
          return { stdout: '', stderr: stderrData, env: errEnv };
        }

        // Record that we've redirected so we can suppress after processing
        if (rd.fd === '1') redirectFd1 = true;
        if (rd.fd === '2') redirectFd2 = true;
      }

      // Suppress streams only after all redirections have been handled
      if (redirectFd1) stdoutData = '';
      if (redirectFd2) stderrData = '';

      return { stdout: stdoutData, stderr: stderrData, env: clone(res.env) };
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
async function run_pipeline(cmd, input, env) {
  const result = await execute_cmd(cmd, input, env);
  if (cmd.pipe) {
    const next = await run_pipeline(cmd.pipe, result.stdout, result.env);
    return { stdout: next.stdout, stderr: result.stderr + next.stderr, env: next.env };
  }
  return result;
}

// Execute an array of parsed commands and return accumulated output, error, and environment
async function run_commands(commands, parentEnv, initialInput = '') {
  let stdout = '';
  let stderr = '';
  let env = clone(parentEnv);

  let prevStdout = initialInput;

  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];

    // Determine stdin for this command.
    const inData = i === 0 ? prevStdout : (cmd.pipe ? '' : prevStdout);

    const result = await run_pipeline(cmd, inData, env);

    // Update accumulators and previous stdout for next iteration.
    stdout += result.stdout;
    stderr += result.stderr;
    env = result.env;
    prevStdout = result.stdout;
  }

  return { stdout, stderr, env };
}

// Convert a parsed literal (array of parts) into a string, capturing any substitution stderr
async function literal_to_string(parts, env) {
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
        const sub = await run_commands(part.value, env);
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
// top-level shell entrypoint
// - 'stdin' parameter holds the command script to execute (for backward compatibility with tests)
// - optional 'input' parameter can be used to feed data to the *first* command in the script
async function main({ args = [], stdin = '', input = '', env: parentEnv = {} }) {
  let stdout = '';
  let stderr = '';
  let env = clone(parentEnv);
  try {
    const commands = klsh.parser.klsh(stdin);
    const result = await run_commands(commands, env, input);
    return result;
  } catch (err) {
    stderr += (err.message || 'Parse error') + '\n';
    if (err.hash) {
      const h = err.hash;
      if (h.line     !== undefined) stderr += `Line: ${h.line}\n`;
      if (h.token    ) stderr += `Token: ${h.token}\n`;
      if (h.text     ) stderr += `Text: ${h.text}\n`;
      if (h.expected ) stderr += `Expected: ${h.expected}\n`;
    }
    if ('KLSH_VERBOSE_ERROR' in env) {
      stderr += '\n\nKLSH_VERBOSE_ERROR\n' + err.stack + '\n';
    }
    env['?'] = 2;
    return { stdout, stderr, env };
  }
}

module.exports = { main };
