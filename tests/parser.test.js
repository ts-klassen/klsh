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

  it('parse pipe with quoted arguments containing pipe characters', function() {
    const result = klsh.parser.klsh('echo "a|b|c" | grep "|b"');
    expect(result).to.deep.equal([{
        "component": [{"type": "text", "value": "echo"}],
        "params": [
            [{"type": "text", "value": 'a|b|c'}]
        ],
        "pipe": {
            "component": [{"type": "text", "value": "grep"}],
            "params": [
                [{"type": "text", "value": '|b'}]
            ]
        }
    }]);
  });

  it('parse multiple parameters after pipe', function() {
    const result = klsh.parser.klsh('ls -l | sort -r -n');
    expect(result).to.deep.equal([{
        "component": [{"type": "text", "value": "ls"}],
        "params": [
            [{"type": "text", "value": '-l'}]
        ],
        "pipe": {
            "component": [{"type": "text", "value": "sort"}],
            "params": [
                [{"type": "text", "value": '-r'}],
                [{"type": "text", "value": '-n'}]
            ]
        }
    }]);
  });

  it('parse pipes combined with semicolons', function() {
    const result = klsh.parser.klsh('echo foo | cat; echo bar | cat -n');
    expect(result).to.deep.equal([
        {
            "component": [{"type": "text", "value": "echo"}],
            "params": [
                [{"type": "text", "value": 'foo'}]
            ],
            "pipe": {
                "component": [{"type": "text", "value": "cat"}],
                "params": []
            }
        },
        {
            "component": [{"type": "text", "value": "echo"}],
            "params": [
                [{"type": "text", "value": 'bar'}]
            ],
            "pipe": {
                "component": [{"type": "text", "value": "cat"}],
                "params": [
                    [{"type": "text", "value": '-n'}]
                ]
            }
        }
    ]);
  });

  // -----------------------------------------------------------------------
  // Tests for variable expansion nodes (type: 'expansion') within commands
  // -----------------------------------------------------------------------

  it('parse parameter containing variable expansion', function() {
    const result = klsh.parser.klsh('echo $USER');
    expect(result).to.deep.equal([
      {
        "component": [{"type": "text", "value": "echo"}],
        "params": [
          [{"type": "expansion", "value": "USER"}]
        ]
      }
    ]);
  });

  it('parse double-quoted string with expansion', function() {
    const result = klsh.parser.klsh('echo "Hello, ${USER}!"');
    expect(result).to.deep.equal([
      {
        "component": [{"type": "text", "value": "echo"}],
        "params": [
          [
            {"type": "text", "value": "Hello, "},
            {"type": "expansion", "value": "USER"},
            {"type": "text", "value": "!"}
          ]
        ]
      }
    ]);
  });

  // -----------------------------------------------------------------------
  // Tests for command substitution nodes within parsed commands
  // -----------------------------------------------------------------------

  it('parse parameter containing command substitution', function() {
    const result = klsh.parser.klsh('echo $(pwd)');
    expect(result).to.deep.equal([
      {
        "component": [{"type": "text", "value": "echo"}],
        "params": [
          [{
            "type": "substitution",
            "value": [{
              "component": [{"type": "text", "value": "pwd"}],
              "params": []
            }]
          }]
        ]
      }
    ]);
  });

  it('parse double-quoted argument with substitution', function() {
    const result = klsh.parser.klsh('echo "Dir: $(pwd)"');
    expect(result).to.deep.equal([
      {
        "component": [{"type": "text", "value": "echo"}],
        "params": [
          [
            {"type": "text", "value": "Dir: "},
            {
              "type": "substitution",
              "value": [{
                "component": [{"type": "text", "value": "pwd"}],
                "params": []
              }]
            }
          ]
        ]
      }
    ]);
  });

  // -----------------------------------------------------------------------
  // New tests for backtick command substitution and substitutions with
  // arguments, added for the extended lexer patterns.
  // -----------------------------------------------------------------------

  it('parse parameter containing backtick substitution', function() {
    const result = klsh.parser.klsh('echo `pwd`');
    expect(result).to.deep.equal([
      {
        "component": [{ "type": "text", "value": "echo" }],
        "params": [
          [{
            "type": "substitution",
            "value": [{
              "component": [{ "type": "text", "value": "pwd" }],
              "params": []
            }]
          }]
        ]
      }
    ]);
  });

  it('parse parameter containing substitution with arguments', function() {
    const result = klsh.parser.klsh('echo $(pwd -P)');
    expect(result).to.deep.equal([
      {
        "component": [{ "type": "text", "value": "echo" }],
        "params": [
          [{
            "type": "substitution",
            "value": [{
              "component": [{ "type": "text", "value": "pwd" }],
              "params": [
                [{ "type": "text", "value": "-P" }]
              ]
            }]
          }]
        ]
      }
    ]);
  });

  it.skip('parse redirection operators', function() {
    const script = `echo hello > overwrite.txt >> append.txt < input.txt << EOF\nLine 1\nLine 2\nEOF`;

    const result = klsh.parser.klsh(script);

    expect(result).to.deep.equal([
      {
        "component": [{ "type": "text", "value": "echo" }],
        "params": [
          [{ "type": "text", "value": "hello" }]
        ],
        "redirect": [
          { "type": "overwrite", "fd": "1", "value": "overwrite.txt" },
          { "type": "append",    "fd": "1", "value": "append.txt" },
          { "type": "input",     "fd": "0", "value": "input.txt" },
          { "type": "heredoc",   "fd": "0", "value": "Line 1\nLine 2\n" }
        ]
      }
    ]);
  });

  it.skip('parse redirection operators with explicit file descriptors', function() {
    const script = `echo test 2> err.txt 3>> append.txt 4< input.txt 5<< EOF\nX\nEOF`;

    const result = klsh.parser.klsh(script);

    expect(result).to.deep.equal([
      {
        "component": [{ "type": "text", "value": "echo" }],
        "params": [
          [{ "type": "text", "value": "test" }]
        ],
        "redirect": [
          { "type": "overwrite", "fd": "2", "value": "err.txt" },
          { "type": "append",    "fd": "3", "value": "append.txt" },
          { "type": "input",     "fd": "4", "value": "input.txt" },
          { "type": "heredoc",   "fd": "5", "value": "X\n" }
        ]
      }
    ]);
  });

  it('parse redirection operators (no <<)', function() {
    const script = `echo hello > overwrite.txt >> append.txt < input.txt`;

    const result = klsh.parser.klsh(script);

    expect(result).to.deep.equal([
      {
        "component": [{ "type": "text", "value": "echo" }],
        "params": [
          [{ "type": "text", "value": "hello" }]
        ],
        "redirect": [
          { "type": "overwrite", "fd": "1", "value": "overwrite.txt" },
          { "type": "append",    "fd": "1", "value": "append.txt" },
          { "type": "input",     "fd": "0", "value": "input.txt" }
        ]
      }
    ]);
  });

  it('parse redirection operators with explicit file descriptors (no <<)', function() {
    const script = `echo test 2> err.txt 3>> append.txt 4< input.txt`;

    const result = klsh.parser.klsh(script);

    expect(result).to.deep.equal([
      {
        "component": [{ "type": "text", "value": "echo" }],
        "params": [
          [{ "type": "text", "value": "test" }]
        ],
        "redirect": [
          { "type": "overwrite", "fd": "2", "value": "err.txt" },
          { "type": "append",    "fd": "3", "value": "append.txt" },
          { "type": "input",     "fd": "4", "value": "input.txt" }
        ]
      }
    ]);
  });

  it('parse file descriptor duplication redirections', function() {
    const script = `echo dup 2>&3 >&2 3>&1`;

    const result = klsh.parser.klsh(script);

    expect(result).to.deep.equal([
      {
        "component": [{ "type": "text", "value": "echo" }],
        "params": [
          [{ "type": "text", "value": "dup" }]
        ],
        "redirect": [
          { "type": "overwrite", "fd": "2", "value": "&3" },
          { "type": "overwrite", "fd": "1", "value": "&2" },
          { "type": "overwrite", "fd": "3", "value": "&1" }
        ]
      }
    ]);
  });

});
