const { expect } = require('chai');
const klsh = require('../dist/klsh.js');

describe('klsh error handling', function() {
  it('handles parse errors with exit code 2', function() {
    const input = "echo 'unterminated";
    const result = klsh.klsh.main({ args: [], stdin: input, env: {} });
    expect(result.stdout).to.equal('');
    // Should report a parse/lexical error
    expect(result.stderr).to.match(/error/i);
    expect(result.env['?']).to.equal(2);
  });

  it('includes verbose error when KLSH_VERBOSE_ERROR is set', function() {
    const input = "echo 'unterminated";
    const result = klsh.klsh.main({ args: [], stdin: input, env: { KLSH_VERBOSE_ERROR: true } });
    // Should report a parse/lexical error followed by the full Error string
    expect(result.stderr).to.match(/error[\s\S]*Error:/i);
    expect(result.stderr).to.match(/\nKLSH_VERBOSE_ERROR\n/);
    expect(result.env['?']).to.equal(2);
  });

  it('handles built-in errors with exit code 255', function() {
    const k = require('../dist/klsh.js');
    k.testcmd = { main: () => { throw new Error('BOOM'); } };
    const result = k.klsh.main({ args: [], stdin: 'testcmd', env: {} });
    expect(result.stdout).to.equal('');
    expect(result.stderr).to.match(/BOOM/);
    expect(result.env['?']).to.equal(255);
  });

  it('built-in errors are verbose when KLSH_VERBOSE_ERROR is set', function() {
    const k = require('../dist/klsh.js');
    k.fail = { main: () => { throw new Error('FAILERR'); } };
    const result = k.klsh.main({ args: [], stdin: 'fail', env: { KLSH_VERBOSE_ERROR: true } });
    expect(result.stderr).to.match(/FAILERR[\s\S]*Error:/);
    expect(result.stderr).to.match(/\nKLSH_VERBOSE_ERROR\n/);
    expect(result.env['?']).to.equal(255);
  });
});
