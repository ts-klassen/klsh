const { expect } = require('chai');
const klsh = require('../dist/klsh.js');

const key = 'this key should stay the same.';

describe('klsh', function() {
  it('call echo', function() {
    const result = klsh.klsh.main({ args: [], stdin: 'echo hello world', env: {key} });
    expect(result).to.deep.equal({stdout: 'hello world\n', stderr: '', env: {'?': 0, key}});
  });
  it('pipe echo tac cat', function() {
    const input = "first line\\nsecond line\\nthird line\\n";
    const output = "third line\nsecond line\nfirst line\n";
    const command = `echo -en '${input}' | tac | cat`;
    const result = klsh.klsh.main({ args: [], stdin: command, env: {key} });
    expect(result).to.deep.equal({stdout: output, stderr: '', env: {'?': 0, key}});
  });
});
