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

  // New tests for variable expansion patterns ($VAR and ${VAR})

  it('simple variable expansion', function() {
    const input = '$USER';
    const result = klsh.parser.klsh_literal(input);
    expect(result).to.deep.equal([
      { type: 'expansion', value: 'USER' }
    ]);
  });

  it('variable expansion inside double quotes', function() {
    const input = '"Hello, ${USER}!"';
    const result = klsh.parser.klsh_literal(input);
    expect(result).to.deep.equal([
      { type: 'text', value: 'Hello, ' },
      { type: 'expansion', value: 'USER' },
      { type: 'text', value: '!' }
    ]);
  });

  // ------------------------------------------------------------------
  // Substitution tests: $(command)
  // ------------------------------------------------------------------

  it('simple command substitution', function() {
    const input = '$(pwd)';
    const result = klsh.parser.klsh_literal(input);
    expect(result).to.deep.equal([
      {
        type: 'substitution',
        value: [{
          component: [{ type: 'text', value: 'pwd' }],
          params: []
        }]
      }
    ]);
  });

  it('command substitution inside double quotes', function() {
    const input = '"Current: $(pwd)"';
    const result = klsh.parser.klsh_literal(input);
    expect(result).to.deep.equal([
      { type: 'text', value: 'Current: ' },
      {
        type: 'substitution',
        value: [{
          component: [{ type: 'text', value: 'pwd' }],
          params: []
        }]
      }
    ]);
  });

  // ------------------------------------------------------------------
  // Additional substitution patterns introduced in recent grammar change
  // ------------------------------------------------------------------

  it('backtick command substitution', function() {
    const input = '`pwd`';
    const result = klsh.parser.klsh_literal(input);
    expect(result).to.deep.equal([
      {
        type: 'substitution',
        value: [{
          component: [{ type: 'text', value: 'pwd' }],
          params: []
        }]
      }
    ]);
  });

  it('command substitution containing arguments', function() {
    const input = '$(pwd -P)';
    const result = klsh.parser.klsh_literal(input);
    expect(result).to.deep.equal([
      {
        type: 'substitution',
        value: [{
          component: [{ type: 'text', value: 'pwd' }],
          params: [
            [{ type: 'text', value: '-P' }]
          ]
        }]
      }
    ]);
  });
});