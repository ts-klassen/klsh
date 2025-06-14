// Auto-generated from seq_floats.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated seq_floats', function() {
  it("bash: seq 1.5 1.5 5.5", async function() {
    const stdin = "";
    const result = await klsh.klsh.main({ stdin: "seq 1.5 1.5 5.5", input: stdin, env: {} });
    expect(result.stdout).to.equal("1.5\n3.0\n4.5\n");
    expect(result.stderr).to.equal("");
    expect(result.env['?']).to.equal(0);
  });
});
