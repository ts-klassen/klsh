// Auto-generated from echo_hello_world.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated echo_hello_world', function() {
  it("bash: echo hello world", function() {
    const stdin = "";
    const args = ["hello","world"];
    const result = klsh.echo.main({ args, stdin, env: {} });
    expect(result.stdout).to.equal("hello world\n");
    expect(result.stderr).to.equal("");
    expect(result.env['?']).to.equal(0);
  });
});
