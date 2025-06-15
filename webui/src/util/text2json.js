// Convert Bash-like text → Pipeline JSON (very small subset)

let klsh;
if (typeof window === 'undefined') {
  // Node (tests) – safe to require synchronously
  // eslint-disable-next-line import/no-unresolved, global-require
  klsh = require('../../../dist/klsh.js');
} else {
  // Browser – dist/klsh.js is already included via a <script> tag in index.html
  klsh = window.klsh;
}

function buildCommand(parts) {
  return {
    component: [{ type: 'text', value: parts[0] }],
    params: parts.slice(1).map((p) => [{ type: 'text', value: p }]),
    redirect: [],
  };
}

function fallbackParse(str) {
  // Very naive parser that understands linear pipelines separated by '|'
  const segments = str.split('|').map((s) => s.trim()).filter(Boolean);
  if (!segments.length) return [];

  const cmdObjs = segments.map((seg) => buildCommand(seg.split(/\s+/)));

  for (let i = 0; i < cmdObjs.length - 1; i++) {
    cmdObjs[i].pipe = cmdObjs[i + 1];
  }

  return [cmdObjs[0]];
}

export default function text2json(str) {
  if (!str || !str.trim()) return [];
  try {
    if (klsh?.parser?.klsh) return klsh.parser.klsh(str);
  } catch (_) {
    /* ignore */
  }
  return fallbackParse(str);
}
