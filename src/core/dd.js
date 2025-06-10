// 'dd' command: copy file blocks via our IndexedDB-backed FS or stdin/stdout
const fs = require('./fs');

async function main({ args = [], stdin = '', env = {} }) {
  const opts = {};
  const unknown = [];
  for (const token of args) {
    const idx = token.indexOf('=');
    if (idx > 0) {
      const key = token.slice(0, idx);
      const val = token.slice(idx + 1);
      if (['if', 'of', 'bs', 'count'].includes(key)) {
        opts[key] = val;
      } else {
        unknown.push(token);
      }
    } else {
      unknown.push(token);
    }
  }
  if (unknown.length > 0) {
    const msg = `dd: unrecognized argument '${unknown[0]}'\n`;
    return { stdout: '', stderr: msg, env: Object.assign({}, env, {'?': 1}) };
  }
  const ifile = opts.if;
  const ofile = opts.of;
  const bs = opts.bs !== undefined ? Number(opts.bs) : 512;
  const count = opts.count !== undefined ? Number(opts.count) : Infinity;
  if (isNaN(bs) || bs <= 0) {
    const msg = `dd: invalid block size '${opts.bs}'\n`;
    return { stdout: '', stderr: msg, env: Object.assign({}, env, {'?': 1}) };
  }
  if (opts.count !== undefined && (isNaN(count) || count < 0)) {
    const msg = `dd: invalid count '${opts.count}'\n`;
    return { stdout: '', stderr: msg, env: Object.assign({}, env, {'?': 1}) };
  }
  let data;
  try {
    data = ifile ? await fs.readFile(ifile) : stdin;
  } catch (err) {
    const msg = err.code === 'ENOENT'
      ? `dd: '${ifile}': No such file or directory\n`
      : `dd: ${err.message}\n`;
    return { stdout: '', stderr: msg, env: Object.assign({}, env, {'?': 1}) };
  }
  const blocks = [];
  for (let i = 0; i < data.length && blocks.length < count; i += bs) {
    blocks.push(data.slice(i, i + bs));
  }
  const outData = blocks.join('');
  if (ofile) {
    try {
      await fs.writeFile(ofile, outData);
    } catch (err) {
      const msg = `dd: ${err.message}\n`;
      return { stdout: '', stderr: msg, env: Object.assign({}, env, {'?': 1}) };
    }
    return { stdout: '', stderr: '', env: Object.assign({}, env, {'?': 0}) };
  }
  return { stdout: outData, stderr: '', env: Object.assign({}, env, {'?': 0}) };
}

module.exports = { main };