// Auto-generated from seq_f_2_decimals.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated seq_f_2_decimals', function() {
  it("bash: seq -f '%.2f' 1 2", async function() {
    const stdin = "";
    const args = ["-f","'%.2f'","1","2"];
    const result = await klsh.seq.main({ args, stdin, env: {} });
    expect(result.stdout).to.equal("1.00\n2.00\n");
    expect(result.stderr).to.equal("");
    expect(result.env['?']).to.equal(0);
  });
});
