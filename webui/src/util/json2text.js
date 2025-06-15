// Strict builder wrapper – no fallback.
/* eslint-disable import/no-unresolved, global-require */
const klsh =
  typeof window === 'undefined'
    ? require('../../../dist/klsh.js')
    : window.klsh;

export default function json2text(pipeline) {
  if (!klsh?.parser?.build) {
    throw new Error(
      'klsh.parser.build is undefined – ensure dist/klsh.js is loaded before using json2text.'
    );
  }
  return klsh.parser.build(pipeline) || '';
}
