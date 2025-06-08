const { expect } = require('chai');
const klsh = require('../dist/klsh.js');

describe('cat', function() {
  it('returns the same string from stdin', function() {
    const text = "first line\nsecond line\nthird line\n"
    const result = klsh.cat.main({ args: [], stdin: text, env: {} });
    expect(result).to.deep.equal({stdout: text, stderr: '', env: {'?': 0}});
  });

  it('numbers all output lines with -n option', function() {
    const text = "first line\nsecond line\nthird line\n"
    const rtext = "1\tfirst line\n2\tsecond line\n3\tthird line\n"
    const result = klsh.cat.main({ args: ['-n'], stdin: text, env: {} });
    expect(result).to.deep.equal({stdout: rtext, stderr: '', env: {'?': 0}});
  });

  it('numbers all output lines with --number option', function() {
    const text = "alpha\nbeta\n"
    const rtext = "1\talpha\n2\tbeta\n"
    const result = klsh.cat.main({ args: ['--number'], stdin: text, env: {} });
    expect(result).to.deep.equal({stdout: rtext, stderr: '', env: {'?': 0}});
  });

});
