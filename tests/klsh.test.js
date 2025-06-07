const { expect } = require('chai');
const klsh = require('../dist/klsh.js');

describe('klsh', function() {
  it('call echo', function() {
    const result = klsh.klsh.main({ args: [], stdin: 'echo hello world', env: {} });
    expect(result).to.deep.equal({stdout: 'hello world\n', stderr: '', env: {'?': 0}});
  });
});
