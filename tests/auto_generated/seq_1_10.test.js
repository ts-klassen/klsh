// Auto-generated from seq_1_10.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated seq_1_10', function() {
  it("bash: seq 1 10", async function() {
    const stdin = "\n";
    const args = ["1","10"];
    const result = await klsh.seq.main({ args, stdin, env: {} });
    expect(result.stdout).to.equal("1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n");
    expect(result.stderr).to.equal("");
    expect(result.env['?']).to.equal(0);
  });
});
