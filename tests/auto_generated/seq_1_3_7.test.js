// Auto-generated from seq_1_3_7.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated seq_1_3_7', function() {
  it("bash: seq 1 3 7", function() {
    const stdin = "";
    const args = ["1","3","7"];
    const result = klsh.seq.main({ args, stdin, env: {} });
    expect(result.stdout).to.equal("1\n4\n7\n");
    expect(result.stderr).to.equal("");
    expect(result.env['?']).to.equal(0);
  });
});
