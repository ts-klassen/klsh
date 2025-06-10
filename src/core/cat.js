// 'cat' command: output stdin with GNU-like options
function main({ args = [], stdin = '', env = {} }) {
  // parse supported options
  const optionSpec = [
    { key: 'number', short_tag: 'n', long_tag: 'number', spec: 'flag', help: 'number all output lines' },
    { key: 'number_nonblank', short_tag: 'b', long_tag: 'number-nonblank', spec: 'flag', help: 'number nonempty output lines' },
    { key: 'squeeze_blank', short_tag: 's', long_tag: 'squeeze-blank', spec: 'flag', help: 'suppress repeated empty output lines' },
    { key: 'show_nonprinting', short_tag: 'v', long_tag: 'show-nonprinting', spec: 'flag', help: 'use ^ and M- notation, except for LFD and TAB' },
    { key: 'show_ends', short_tag: 'E', long_tag: 'show-ends', spec: 'flag', help: 'display $ at end of each line' },
    { key: 'show_tabs', short_tag: 'T', long_tag: 'show-tabs', spec: 'flag', help: 'display TAB characters as ^I' },
    { key: 'show_all', short_tag: 'A', long_tag: 'show-all', spec: 'flag', help: 'equivalent to -vET' },
    { key: 'opt_e', short_tag: 'e', long_tag: '', spec: 'flag', help: 'equivalent to -vE' },
    { key: 'opt_t', short_tag: 't', long_tag: '', spec: 'flag', help: 'equivalent to -vT' }
  ];
  const { options, unknown } = klsh.parse_args.parse(args, optionSpec);
  // handle unrecognized options
  if (unknown && unknown.length > 0) {
    const opt = unknown[0];
    let msg;
    if (opt.startsWith('--')) {
      msg = `cat: unrecognized option '${opt}'\nTry 'cat --help' for more information.\n`;
    } else if (opt.startsWith('-') && opt.length === 2) {
      const ch = opt[1];
      msg = `cat: invalid option -- '${ch}'\nTry 'cat --help' for more information.\n`;
    } else {
      msg = `cat: unrecognized argument '${opt}'\nTry 'cat --help' for more information.\n`;
    }
    return { stdout: '', stderr: msg, env: Object.assign({}, env, { '?': 1 }) };
  }
  // derive flags, with -b overriding -n
  let numberAll = options.number === true;
  const numberNonblank = options.number_nonblank === true;
  if (numberNonblank) numberAll = false;
  const squeezeBlank = options.squeeze_blank === true;
  let showNonprinting = options.show_nonprinting === true;
  let showEnds = options.show_ends === true;
  let showTabs = options.show_tabs === true;
  if (options.opt_e === true) { showNonprinting = true; showEnds = true; }
  if (options.opt_t === true) { showNonprinting = true; showTabs = true; }
  if (options.show_all === true) { showNonprinting = true; showEnds = true; showTabs = true; }
  // split input into segments including line endings
  const segments = stdin === '' ? [] : stdin.match(/[^\n]*\n|[^\n]+$/g) || [];
  // process blank squeezing
  const processed = [];
  let prevBlank = false;
  for (const seg of segments) {
    const hasLf = seg.endsWith('\n');
    const content = hasLf ? seg.slice(0, -1) : seg;
    const isBlank = content === '';
    if (squeezeBlank && isBlank && prevBlank) continue;
    processed.push({ content, hasLf });
    prevBlank = isBlank;
  }
  // build output
  // determine minimum field width for line numbers (at least 6, expand if needed)
  const defaultNumWidth = 6;
  let numWidth = defaultNumWidth;
  if (numberAll) {
    const totalLines = processed.length;
    numWidth = Math.max(numWidth, String(totalLines).length-1);
  }
  if (numberNonblank) {
    const totalNonblank = processed.filter(item => item.content !== '').length;
    numWidth = Math.max(numWidth, String(totalNonblank).length);
  }
  let lineNum = 1;
  const out = [];
  for (const { content, hasLf } of processed) {
    let s = content;
    if (showTabs) s = s.replace(/\t/g, '^I');
    if (showNonprinting) {
      s = s.split('').map(c => {
        const code = c.charCodeAt(0);
        if (code >= 0 && code < 32 && c !== '\t') return '^' + String.fromCharCode(code + 64);
        if (code === 127) return '^?';
        return c;
      }).join('');
    }
    if (showEnds) s += '$';
    let prefix = '';
    if ((numberNonblank && content !== '') || numberAll) {
      prefix = String(lineNum).padStart(numWidth, ' ') + '\t';
      lineNum++;
    }
    out.push(prefix + s + (hasLf ? '\n' : ''));
  }
  return { stdout: out.join(''), stderr: '', env: Object.assign({}, env, { '?': 0 }) };
}

module.exports = { main };
