// Parser helpers and wrappers
// Functions declared here are inlined into the bundle before each parser

// Called immediately before any parse
function beforeParse(input) {
  // no-op by default; override in this file to customize
}

// Called immediately after a successful parse
function afterParse(ast) {
  // no-op by default; override in this file to customize
}

// Wrap a Jison parser parse function with hooks
function wrapParse(parseFn, input) {
  beforeParse(input);
  const result = parseFn(input);
  afterParse(result);
  return result;
}

// Example helper: users can add more functions for use inside Jison actions
function escapeLiteral(s) {
  return s.replace(/\\'/g, "'").replace(/\\"/g, '"');
}

module.exports = {
  beforeParse,
  afterParse,
  wrapParse,
  escapeLiteral
};