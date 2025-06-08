// 'seq' command: generate numeric sequences
function main({ args = [], stdin = '', env = {} }) {
  let first, step, last;
  if (args.length === 1) {
    first = 1;
    step = 1;
    last = Number(args[0]);
  } else if (args.length === 2) {
    first = Number(args[0]);
    step = 1;
    last = Number(args[1]);
  } else if (args.length >= 3) {
    first = Number(args[0]);
    step = Number(args[1]);
    last = Number(args[2]);
  } else {
    const stderr = 'seq: missing operand\n';
    const newEnv = Object.assign({}, env, { '?': 1 });
    return { stdout: '', stderr, env: newEnv };
  }
  if (isNaN(first) || isNaN(step) || isNaN(last)) {
    const stderr = 'seq: invalid floating point argument\n';
    const newEnv = Object.assign({}, env, { '?': 1 });
    return { stdout: '', stderr, env: newEnv };
  }
  let stdout = '';
  // Determine loop condition based on step sign
  if (step === 0) step = 1;
  if ((step > 0 && first <= last) || (step < 0 && first >= last)) {
    let cur = first;
    // produce sequence
    while ((step > 0 && cur <= last) || (step < 0 && cur >= last)) {
      stdout += cur.toString() + '\n';
      cur += step;
    }
  }
  const newEnv = Object.assign({}, env, { '?': 0 });
  return { stdout, stderr: '', env: newEnv };
}

module.exports = { main };