// Auto-generated from echo_hello_world.json. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated echo_hello_world', function() {
  it("bash: echo hello world", async function() {
    const stdin = "";
    const result = await klsh.klsh.main({ stdin: "echo hello world", input: stdin, env: {} });
    expect(result.stdout).to.equal("hello world\n");
    expect(result.stderr).to.equal("");
    expect(result.env['?']).to.equal(0);
  });
});
