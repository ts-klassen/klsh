// Auto-generated from seq_3_neg1_neg3.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated seq_3_neg1_neg3', function() {
  it("bash: seq 3 -1 -3", async function() {
    const stdin = "";
    const args = ["3","-1","-3"];
    const result = await klsh.seq.main({ args, stdin, env: {} });
    expect(result.stdout).to.equal("3\n2\n1\n0\n-1\n-2\n-3\n");
    expect(result.stderr).to.equal("");
    expect(result.env['?']).to.equal(0);
  });
});
