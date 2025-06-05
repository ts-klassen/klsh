const { expect } = require('chai');
const klsh = require('../dist/klsh.js');

describe('echo', function() {
  it('returns the same string', function() {
    const result = klsh.echo.main({ args: ['hello', 'world'], stdin: "", env: {} });
    expect(result).to.deep.equal({stdout: "hello world\n", stderr: "", env: {'?': 0}});
  });
});
