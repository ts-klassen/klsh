// Argument parsing utility
// args: array of strings; optionSpec: array of option definitions
// Returns { options: {}, operands: [], unknown: [] }
// CLI entrypoint: currently not implemented
function main({ args = [], stdin = '', env = {} }) {
  const stderr = 'Not implemented\n';
  const newEnv = Object.assign({}, env, { '?': 1 });
  return { stdout: '', stderr, env: newEnv };
}

// Parse argument arrays according to option specifications
function parse(args, optionSpec) {
  const options = {};
  const operands = [];
  const unknown = [];
  let endOfOptions = false;
  let i = 0;
  while (i < args.length) {
    const token = args[i];
    if (endOfOptions) {
      operands.push(token);
      i++;
      continue;
    }
    if (token === '--') {
      endOfOptions = true;
      i++;
      continue;
    }
    if (token.startsWith('--')) {
      const eqIndex = token.indexOf('=');
      if (eqIndex !== -1) {
        const name = token.slice(2, eqIndex);
        const val = token.slice(eqIndex + 1);
        const spec = optionSpec.find(o => o.long_tag === name && o.spec === 'string');
        if (spec) options[spec.key] = val;
        else unknown.push(token);
        i++;
      } else {
        const name = token.slice(2);
        const spec = optionSpec.find(o => o.long_tag === name);
        if (spec) {
          if (spec.spec === 'flag') {
            options[spec.key] = true;
            i++;
          } else if (spec.spec === 'string') {
            if (i + 1 < args.length) {
              options[spec.key] = args[i + 1];
              i += 2;
            } else {
              options[spec.key] = undefined;
              i++;
            }
          } else i++;
        } else {
          unknown.push(token);
          i++;
        }
      }
    } else if (token.startsWith('-') && token.length > 1) {
      if (token.length === 2) {
        const name = token[1];
        const spec = optionSpec.find(o => o.short_tag === name);
        if (spec) {
          if (spec.spec === 'flag') {
            options[spec.key] = true;
            i++;
          } else if (spec.spec === 'string') {
            if (i + 1 < args.length) {
              options[spec.key] = args[i + 1];
              i += 2;
            } else {
              options[spec.key] = undefined;
              i++;
            }
          } else i++;
        } else {
          unknown.push(token);
          i++;
        }
      } else {
        const chars = token.slice(1).split('');
        const allFlags = chars.every(ch => optionSpec.some(o => o.short_tag === ch && o.spec === 'flag'));
        if (allFlags) {
          chars.forEach(ch => {
            const spec = optionSpec.find(o => o.short_tag === ch && o.spec === 'flag');
            options[spec.key] = true;
          });
        } else unknown.push(token);
        i++;
      }
    } else {
      operands.push(token);
      i++;
    }
  }
  return { options, operands, unknown };
}

module.exports = { main, parse };