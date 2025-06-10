// Auto-generated from seq_5_1_1.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated seq_5_1_1', function() {
  it("bash: seq 5 1 1", async function() {
    const stdin = "";
    const args = ["5","1","1"];
    const result = await klsh.seq.main({ args, stdin, env: {} });
    expect(result.stdout).to.equal("");
    expect(result.stderr).to.equal("");
    expect(result.env['?']).to.equal(0);
  });
});
