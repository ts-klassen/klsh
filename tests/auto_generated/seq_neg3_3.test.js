// Auto-generated from seq_neg3_3.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated seq_neg3_3', function() {
  it("bash: seq -3 3", async function() {
    const stdin = "";
    const args = ["-3","3"];
    const result = await klsh.seq.main({ args, stdin, env: {} });
    expect(result.stdout).to.equal("-3\n-2\n-1\n0\n1\n2\n3\n");
    expect(result.stderr).to.equal("");
    expect(result.env['?']).to.equal(0);
  });
});
