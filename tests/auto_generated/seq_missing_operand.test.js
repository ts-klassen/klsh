// Auto-generated from seq_missing_operand.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated seq_missing_operand', function() {
  it("bash: seq", async function() {
    const stdin = "";
    const result = await klsh.klsh.main({ stdin: "seq", input: stdin, env: {} });
    expect(result.stdout).to.equal("");
    expect(result.stderr).to.equal("seq: missing operand\nTry 'seq --help' for more information.\n");
    expect(result.env['?']).to.equal(1);
  });
});
