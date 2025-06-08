const { expect } = require('chai');
const klsh = require('../dist/klsh.js');

describe('parser', function() {
  it('main is not implemented', function() {
    const result = klsh.parser.main({ args: [], stdin: '', env: {} });
    expect(result).to.deep.equal({stdout: '', stderr: 'Not implemented\n', env: {'?': 1}});
  });
  it('parse no-options simple', function() {
    const result = klsh.parser.klsh('echo hello world');
    expect(result).to.deep.equal([{
        "component": [{"type": "text", "value": "echo"}],
        "params": [
            [{"type": "text", "value": 'hello'}],
            [{"type": "text", "value": 'world'}]
        ]
    }]);
  });
  it('parse with options', function() {
    const result = klsh.parser.klsh('echo -ne hello world --opt test -- -v');
    expect(result).to.deep.equal([{
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
    }]);
  });
  it('parse with single quote', function() {
    const result = klsh.parser.klsh("echo 'hello world' 'a''b''c'");
    expect(result).to.deep.equal([{
        "component": [{"type": "text", "value": "echo"}],
        "params": [
            [{"type": "text", "value": "hello world"}],
            [
                {"type": "text", "value": "a"},
                {"type": "text", "value": "b"},
                {"type": "text", "value": "c"}
            ]
        ]
    }]);
  });
  it('parse with double quote', function() {
    const result = klsh.parser.klsh('echo "hello world" "a""b""c"');
    expect(result).to.deep.equal([{
        "component": [{"type": "text", "value": "echo"}],
        "params": [
            [{"type": "text", "value": "hello world"}],
            [
                {"type": "text", "value": "a"},
                {"type": "text", "value": "b"},
                {"type": "text", "value": "c"}
            ]
        ]
    }]);
  });
  it('parse with quote', function() {
    const result = klsh.parser.klsh(`echo 'It'"'"'s a nice day' "\\"test\\""`);
    expect(result).to.deep.equal([{
        "component": [{"type": "text", "value": "echo"}],
        "params": [
            [
                {"type": "text", "value": "It"},
                {"type": "text", "value": "'"},
                {"type": "text", "value": "s a nice day"}
            ],
            [{"type": "text", "value": '"test"'}]
        ]
    }]);
  });
  it('parse multiple commands separated by semicolons', function() {
    const result = klsh.parser.klsh('echo a; echo b');
    expect(result).to.deep.equal([{
        "component": [{"type": "text", "value": "echo"}],
        "params": [
            [{"type": "text", "value": 'a'}]
        ]
    },{
        "component": [{"type": "text", "value": "echo"}],
        "params": [
            [{"type": "text", "value": 'b'}]
        ]
    }]);
  });
  it('parse multiple commands separated by newline', function() {
    const result = klsh.parser.klsh(`echo a\necho b`);
    expect(result).to.deep.equal([{
        "component": [{"type": "text", "value": "echo"}],
        "params": [
            [{"type": "text", "value": 'a'}]
        ]
    },{
        "component": [{"type": "text", "value": "echo"}],
        "params": [
            [{"type": "text", "value": 'b'}]
        ]
    }]);
  });

  it('ignores trailing separators (semicolon)', function() {
    const result = klsh.parser.klsh('echo a;');
    expect(result).to.deep.equal([{
        "component": [{"type": "text", "value": "echo"}],
        "params": [
            [{"type": "text", "value": 'a'}]
        ]
    }]);
  });

  it('ignores empty commands between separators', function() {
    const result = klsh.parser.klsh('echo a;;echo b');
    expect(result).to.deep.equal([{
        "component": [{"type": "text", "value": "echo"}],
        "params": [
            [{"type": "text", "value": 'a'}]
        ]
    }, {
        "component": [{"type": "text", "value": "echo"}],
        "params": [
            [{"type": "text", "value": 'b'}]
        ]
    }]);
  });

  it('ignores commands with only whitespace', function() {
    const result = klsh.parser.klsh('echo a;   ; echo b');
    expect(result).to.deep.equal([{
        "component": [{"type": "text", "value": "echo"}],
        "params": [
            [{"type": "text", "value": 'a'}]
        ]
    }, {
        "component": [{"type": "text", "value": "echo"}],
        "params": [
            [{"type": "text", "value": 'b'}]
        ]
    }]);
  });

  it('parses mixed separators (semicolon and newline)', function() {
    const result = klsh.parser.klsh(`echo a; echo b\necho c`);
    expect(result).to.deep.equal([{
        "component": [{"type": "text", "value": "echo"}],
        "params": [
            [{"type": "text", "value": 'a'}]
        ]
    }, {
        "component": [{"type": "text", "value": "echo"}],
        "params": [
            [{"type": "text", "value": 'b'}]
        ]
    }, {
        "component": [{"type": "text", "value": "echo"}],
        "params": [
            [{"type": "text", "value": 'c'}]
        ]
    }]);
  });
  it('parse single pipe', function() {
    const result = klsh.parser.klsh('echo hello world | cat -n');
    expect(result).to.deep.equal([{
        "component": [{"type": "text", "value": "echo"}],
        "params": [
            [{"type": "text", "value": 'hello'}],
            [{"type": "text", "value": 'world'}]
        ],
        "pipe": {
            "component": [{"type": "text", "value": "cat"}],
            "params": [
                [{"type": "text", "value": '-n'}]
            ]
        }
    }]);
  });
  it('parse multiple pipe', function() {
    const result = klsh.parser.klsh('echo hello world | cat -n | tac');
    expect(result).to.deep.equal([{
        "component": [{"type": "text", "value": "echo"}],
        "params": [
            [{"type": "text", "value": 'hello'}],
            [{"type": "text", "value": 'world'}]
        ],
        "pipe": {
            "component": [{"type": "text", "value": "cat"}],
            "params": [
                [{"type": "text", "value": '-n'}]
            ],
            "pipe": {
                "component": [{"type": "text", "value": "tac"}],
                "params": []
            }
        }
    }]);
  });
});
