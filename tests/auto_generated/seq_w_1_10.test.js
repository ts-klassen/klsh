// Auto-generated from seq_w_1_10.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated seq_w_1_10', function() {
  it("bash: seq -w 1 10", async function() {
    const stdin = "";
    const args = ["-w","1","10"];
    const result = await klsh.seq.main({ args, stdin, env: {} });
    expect(result.stdout).to.equal("01\n02\n03\n04\n05\n06\n07\n08\n09\n10\n");
    expect(result.stderr).to.equal("");
    expect(result.env['?']).to.equal(0);
  });
});
