// Auto-generated from seq_1_0_3.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated seq_1_0_3', function() {
  it("bash: seq 1 0 3", async function() {
    const stdin = "";
    const result = await klsh.klsh.main({ stdin: "seq 1 0 3", input: stdin, env: {} });
    expect(result.stdout).to.equal("");
    expect(result.stderr).to.equal("seq: invalid Zero increment value: ‘0’\nTry 'seq --help' for more information.\n");
    expect(result.env['?']).to.equal(1);
  });
});
