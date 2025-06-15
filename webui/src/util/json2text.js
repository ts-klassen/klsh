let klsh;
if (typeof window === 'undefined') {
  // Node environment (unit tests)
  // eslint-disable-next-line import/no-unresolved, global-require
  klsh = require('../../../dist/klsh.js');
} else {
  klsh = window.klsh;
}

function fallbackBuild(pipeline) {
  if (!pipeline || !pipeline.length) return '';
  let out = '';
  let cur = pipeline[0];
  while (cur) {
    out += cur.component.map((t) => t.value).join('');
    for (const param of cur.params || []) {
      out += ' ' + param.map((t) => t.value).join('');
    }
    if (cur.pipe) out += ' | ';
    cur = cur.pipe;
  }
  return out;
}

export default function json2text(pipeline) {
  try {
    if (klsh?.parser?.build) return klsh.parser.build(pipeline) || '';
  } catch (_) {
    /* ignore */
  }
  return fallbackBuild(pipeline);
}
