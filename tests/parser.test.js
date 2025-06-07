const { expect } = require('chai');
const klsh = require('../dist/klsh.js');

describe('parser', function() {
  it('main is not implemented', function() {
    const result = klsh.parser.main({ args: [], stdin: '', env: {} });
    expect(result).to.deep.equal({stdout: '', stderr: 'Not implemented\n', env: {'?': 1}});
  });
  it('parse no-options simple', function() {
    const result = klsh.parser.klsh('echo hello world');
    expect(result).to.deep.equal({
        "component": "echo",
        "params": ['hello', 'world']
    });
  });
  it('parse with options', function() {
    const result = klsh.parser.klsh('echo -ne hello world --opt test -- -v');
    expect(result).to.deep.equal({
        "component": "echo",
        "params": ['-ne', 'hello', 'world', '--opt', 'test', '--', '-v']
    });
  });
  it('parse with single quote', function() {
    const result = klsh.parser.klsh("echo 'hello world' 'a''b''c'");
    expect(result).to.deep.equal({
        "component": "echo",
        "params": ["'hello world'", "'a''b''c'"]
    });
  });
});
