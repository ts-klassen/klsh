const { expect } = require('chai');
const klsh = require('../dist/klsh.js');

describe('tac', function() {
  it('reverses the order of lines from stdin', function() {
    const text = "first line\nsecond line\nthird line\n"
    const rtext = "third line\nsecond line\nfirst line\n"
    const result = klsh.tac.main({ args: [], stdin: text, env: {} });
    expect(result).to.deep.equal({stdout: rtext, stderr: '', env: {'?': 0}});
  });
});
