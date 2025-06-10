// Auto-generated from seq_invalid_first.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated seq_invalid_first', function() {
  it("bash: seq a", async function() {
    const stdin = "";
    const args = ["a"];
    const result = await klsh.seq.main({ args, stdin, env: {} });
    expect(result.stdout).to.equal("");
    expect(result.stderr).to.equal("seq: invalid floating point argument: ‘a’\nTry 'seq --help' for more information.\n");
    expect(result.env['?']).to.equal(1);
  });
});
