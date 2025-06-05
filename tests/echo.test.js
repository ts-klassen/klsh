const { expect } = require('chai');
const { echo } = require('../src/index');

describe('echo', function() {
  it('returns the same string', function() {
    const result = echo({args: ['hello', 'world'], stdin: "", env: {}});
    expect(result).to.deep.equal({stdout: "hello world\n", stderr: "", env: {'?': 0}});
  });
});
