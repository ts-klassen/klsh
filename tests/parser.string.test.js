const { expect } = require('chai');
const klsh = require('../dist/klsh.js');

describe('parser.klsh_literal', function() {
  it('simple literal string', function() {
    const input = 'file.txt';
    const result = klsh.parser.klsh_literal(input);
    expect(result).to.deep.equal([
      { type: 'text', value: 'file.txt' }
    ]);
  });

  it('string with double quotes', function() {
    const input = '"Hello, world"';
    const result = klsh.parser.klsh_literal(input);
    expect(result).to.deep.equal([
      { type: 'text', value: 'Hello, world' }
    ]);
  });

  it('string with single quotes', function() {
    const input = "'Hello, world'";
    const result = klsh.parser.klsh_literal(input);
    expect(result).to.deep.equal([
      { type: 'text', value: 'Hello, world' }
    ]);
  });
});