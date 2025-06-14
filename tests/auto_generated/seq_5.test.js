// Auto-generated from seq_5.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated seq_5', function() {
  it("bash: seq 5", async function() {
    const stdin = "";
    const result = await klsh.klsh.main({ stdin: "seq 5", input: stdin, env: {} });
    expect(result.stdout).to.equal("1\n2\n3\n4\n5\n");
    expect(result.stderr).to.equal("");
    expect(result.env['?']).to.equal(0);
  });
});
