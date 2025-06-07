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
        "component": [{"type": "text", "value": "echo"}],
        "params": [
            [{"type": "text", "value": 'hello'}],
            [{"type": "text", "value": 'world'}]
        ]
    });
  });
  it('parse with options', function() {
    const result = klsh.parser.klsh('echo -ne hello world --opt test -- -v');
    expect(result).to.deep.equal({
        "component": [{"type": "text", "value": "echo"}],
        "params": [
           [{"type": "text", "value": '-ne'}],
           [{"type": "text", "value": 'hello'}],
           [{"type": "text", "value": 'world'}],
           [{"type": "text", "value": '--opt'}],
           [{"type": "text", "value": 'test'}],
           [{"type": "text", "value": '--'}],
           [{"type": "text", "value": '-v'}]
        ]
    });
  });
  it('parse with single quote', function() {
    const result = klsh.parser.klsh("echo 'hello world' 'a''b''c'");
    expect(result).to.deep.equal({
        "component": [{"type": "text", "value": "echo"}],
        "params": [
            [{"type": "text", "value": "hello world"}],
            [
                {"type": "text", "value": "a"},
                {"type": "text", "value": "b"},
                {"type": "text", "value": "c"}
            ]
        ]
    });
  });
  it('parse with double quote', function() {
    const result = klsh.parser.klsh('echo "hello world" "a""b""c"');
    expect(result).to.deep.equal({
        "component": [{"type": "text", "value": "echo"}],
        "params": [
            [{"type": "text", "value": "hello world"}],
            [
                {"type": "text", "value": "a"},
                {"type": "text", "value": "b"},
                {"type": "text", "value": "c"}
            ]
        ]
    });
  });
  it('parse with quote', function() {
    const result = klsh.parser.klsh(`echo 'It'"'"'s a nice day' "\\"test\\""`);
    expect(result).to.deep.equal({
        "component": [{"type": "text", "value": "echo"}],
        "params": [
            [
                {"type": "text", "value": "It"},
                {"type": "text", "value": "'"},
                {"type": "text", "value": "s a nice day"}
            ],
            [{"type": "text", "value": '"test"'}]
        ]
    });
  });
});
