// Auto-generated from seq_5_2_11.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated seq_5_2_11', function() {
  it("bash: seq 5 2 11", async function() {
    const stdin = "";
    const result = await klsh.klsh.main({ stdin: "seq 5 2 11", input: stdin, env: {} });
    expect(result.stdout).to.equal("5\n7\n9\n11\n");
    expect(result.stderr).to.equal("");
    expect(result.env['?']).to.equal(0);
  });
});
