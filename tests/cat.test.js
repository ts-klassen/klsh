const { expect } = require('chai');
const klsh = require('../dist/klsh.js');

describe('cat', function() {
  it('returns the same string from stdin', function() {
    const text = "first line\nsecond line\nthird line\n"
    const result = klsh.cat.main({ args: [], stdin: text, env: {} });
    expect(result).to.deep.equal({stdout: text, stderr: '', env: {'?': 0}});
  });
});
