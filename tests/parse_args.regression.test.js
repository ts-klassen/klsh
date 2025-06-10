const { expect } = require('chai');
const klsh = require('../dist/klsh.js');

// Additional regression tests ensuring that string options do not cause the
// parser to skip the token that follows their argument.

describe('parse_args regression – string option consumes next arg only once', function() {
  it('handles separated string option without skipping following operand', function() {
    const spec = [
      { key: 'name', short_tag: 'n', long_tag: 'name', spec: 'string', help: '' }
    ];
    const args = ['-n', 'first', 'second', 'third'];
    const result = klsh.parse_args.parse(args, spec);
    expect(result).to.deep.equal({
      options: { name: 'first' },
      operands: ['second', 'third'],
      unknown: []
    });
  });

  it('handles clustered flags with trailing string option and preserves following operand', function() {
    const spec = [
      { key: 'a_flag', short_tag: 'a', long_tag: 'alpha', spec: 'flag', help: '' },
      { key: 'b_value', short_tag: 'b', long_tag: 'beta', spec: 'string', help: '' }
    ];
    const args = ['-ab', 'value', 'operand'];
    const result = klsh.parse_args.parse(args, spec);
    expect(result).to.deep.equal({
      options: { a_flag: true, b_value: 'value' },
      operands: ['operand'],
      unknown: []
    });
  });
});
