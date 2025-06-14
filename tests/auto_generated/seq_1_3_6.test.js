// Auto-generated from seq_1_3_6.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated seq_1_3_6', function() {
  it("bash: seq 1 3 6", async function() {
    const stdin = "";
    const result = await klsh.klsh.main({ stdin: "seq 1 3 6", input: stdin, env: {} });
    expect(result.stdout).to.equal("1\n4\n");
    expect(result.stderr).to.equal("");
    expect(result.env['?']).to.equal(0);
  });
});
