// Auto-generated from seq_s_comma_1_3.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated seq_s_comma_1_3', function() {
  it("bash: seq -s , 1 3", function() {
    const stdin = "";
    const args = ["-s",",","1","3"];
    const result = klsh.seq.main({ args, stdin, env: {} });
    expect(result.stdout).to.equal("1,2,3\n");
    expect(result.stderr).to.equal("");
    expect(result.env['?']).to.equal(0);
  });
});
