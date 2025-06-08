// 'seq' command: generate numeric sequences
// 'seq' command: generate numeric sequences with support for -f, -s, -w flags
function main({ args = [], stdin = '', env = {} }) {
  // parse flags
  let fmt = null;
  let sep = '\n';
  let equalWidth = false;
  let i = 0;
  function stripQuotes(s) {
    if (s.length > 1) {
      const a = s[0], b = s[s.length - 1];
      if ((a === "'" && b === "'") || (a === '"' && b === '"')) return s.slice(1, -1);
    }
    return s;
  }
  while (i < args.length && args[i].startsWith('-')) {
    const t = args[i];
    if (t === '-f') {
      if (i + 1 >= args.length) break;
      fmt = stripQuotes(args[i + 1]);
      i += 2;
    } else if (t === '-s') {
      if (i + 1 >= args.length) break;
      sep = stripQuotes(args[i + 1]);
      i += 2;
    } else if (t === '-w') {
      equalWidth = true;
      i += 1;
    } else break;
  }
  const operands = args.slice(i);
  // error: missing operand
  if (operands.length === 0) {
    const stderr = "seq: missing operand\nTry 'seq --help' for more information.\n";
    return { stdout: '', stderr, env: Object.assign({}, env, { '?': 1 }) };
  }
  // error: extra operand
  if (operands.length > 3) {
    const bad = operands[3];
    const stderr = `seq: extra operand ‘${bad}’\nTry 'seq --help' for more information.\n`;
    return { stdout: '', stderr, env: Object.assign({}, env, { '?': 1 }) };
  }
  // convert and validate numbers
  const rawNums = operands.map(x => x);
  const nums = [];
  for (let j = 0; j < operands.length; j++) {
    const v = Number(operands[j]);
    if (isNaN(v)) {
      const stderr = `seq: invalid floating point argument: ‘${operands[j]}’\nTry 'seq --help' for more information.\n`;
      return { stdout: '', stderr, env: Object.assign({}, env, { '?': 1 }) };
    }
    nums.push(v);
  }
  // assign first, step, last
  let first, step, last;
  if (nums.length === 1) {
    first = 1;
    step = 1;
    last = nums[0];
  } else if (nums.length === 2) {
    first = nums[0];
    step = 1;
    last = nums[1];
  } else {
    first = nums[0];
    step = nums[1];
    last = nums[2];
  }
  // error: zero increment
  if (step === 0) {
    const stderr = `seq: invalid Zero increment value: ‘${operands[1] || '0'}’\n` +
                   "Try 'seq --help' for more information.\n";
    return { stdout: '', stderr, env: Object.assign({}, env, { '?': 1 }) };
  }
  // generate raw sequence
  const outVals = [];
  if ((step > 0 && first <= last) || (step < 0 && first >= last)) {
    for (let cur = first;
         (step > 0 ? cur <= last : cur >= last);
         cur += step) {
      outVals.push(cur);
    }
  }
  // determine default decimal precision
  let maxDec = 0;
  if (!fmt) {
    rawNums.forEach(s => {
      const parts = s.toString().split('.');
      if (parts[1]) maxDec = Math.max(maxDec, parts[1].length);
    });
  }
  // apply formatting
  let strs = outVals.map(v => {
    let s;
    if (fmt) {
      const m = fmt.match(/^%\.([0-9]+)f$/);
      if (m) {
        s = v.toFixed(parseInt(m[1], 10));
      } else {
        s = v.toString();
      }
    } else if (maxDec > 0) {
      s = v.toFixed(maxDec);
    } else {
      s = v.toString();
    }
    return s;
  });
  // equal-width padding
  if (equalWidth && !fmt) {
    const width = strs.reduce((w, x) => Math.max(w, x.length), 0);
    strs = strs.map(x => x.padStart(width, '0'));
  }
  // no output if sequence is empty
  const newEnv = Object.assign({}, env, { '?': 0 });
  if (strs.length === 0) {
    return { stdout: '', stderr: '', env: newEnv };
  }
  // join with separator and trailing newline
  const out = strs.join(sep) + '\n';
  return { stdout: out, stderr: '', env: newEnv };
}

module.exports = { main };