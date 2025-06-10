const { expect } = require('chai');
const klsh = require('../dist/klsh.js');

describe('klsh error handling', function() {
  it('handles parse errors with exit code 2', async function() {
    const input = "echo 'unterminated";
    const result = await klsh.klsh.main({ args: [], stdin: input, env: {} });
    expect(result.stdout).to.equal('');
    // Should report a parse/lexical error
    expect(result.stderr).to.match(/error/i);
    expect(result.env['?']).to.equal(2);
  });

  it('includes verbose error when KLSH_VERBOSE_ERROR is set', async function() {
    const input = "echo 'unterminated";
    const result = await klsh.klsh.main({ args: [], stdin: input, env: { KLSH_VERBOSE_ERROR: true } });
    // Should report a parse/lexical error followed by the full Error string
    expect(result.stderr).to.match(/error[\s\S]*Error:/i);
    expect(result.stderr).to.match(/\nKLSH_VERBOSE_ERROR\n/);
    expect(result.env['?']).to.equal(2);
  });

  it('handles built-in errors with exit code 255', async function() {
    const k = require('../dist/klsh.js');
    k.klsh_error_test_cmd = { main: () => { throw new Error('BOOM'); } };
    const result = await k.klsh.main({ args: [], stdin: 'klsh_error_test_cmd', env: {} });
    expect(result.stdout).to.equal('');
    expect(result.stderr).to.match(/BOOM/);
    expect(result.env['?']).to.equal(255);
  });

  it('built-in errors are verbose when KLSH_VERBOSE_ERROR is set', async function() {
    const k = require('../dist/klsh.js');
    k.klsh_error_test_fail = { main: () => { throw new Error('FAILERR'); } };
    const result = await k.klsh.main({ args: [], stdin: 'klsh_error_test_fail', env: { KLSH_VERBOSE_ERROR: true } });
    expect(result.stderr).to.match(/FAILERR[\s\S]*Error:/);
    expect(result.stderr).to.match(/\nKLSH_VERBOSE_ERROR\n/);
    expect(result.env['?']).to.equal(255);
  });
});
