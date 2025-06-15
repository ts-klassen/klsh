// Convert Bash-like text → Pipeline JSON (very small subset)

// ----------------------------------------------------------
// Strict wrapper around the official klsh Jison parser.
// If the klsh bundle failed to load we surface an explicit
// error so the UI can fail loudly instead of producing an
// incorrect AST.
// ----------------------------------------------------------

/* eslint-disable import/no-unresolved, global-require */
const klsh =
  typeof window === 'undefined'
    ? require('../../../dist/klsh.js') // Node (unit tests)
    : window.klsh; // Browser – injected via <script src="../dist/klsh.js">

export default function text2json(str) {
  if (!str || !str.trim()) return [];

  if (!klsh?.parser?.klsh) {
    throw new Error(
      'window.klsh is undefined – ensure ../dist/klsh.js is loaded *before* the web-ui bundle.'
    );
  }

  return klsh.parser.klsh(str);
}
