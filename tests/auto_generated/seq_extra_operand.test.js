// Auto-generated from seq_extra_operand.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated seq_extra_operand', function() {
  it("bash: seq 1 2 3 4", async function() {
    const stdin = "";
    const args = ["1","2","3","4"];
    const result = await klsh.seq.main({ args, stdin, env: {} });
    expect(result.stdout).to.equal("");
    expect(result.stderr).to.equal("seq: extra operand ‘4’\nTry 'seq --help' for more information.\n");
    expect(result.env['?']).to.equal(1);
  });
});
