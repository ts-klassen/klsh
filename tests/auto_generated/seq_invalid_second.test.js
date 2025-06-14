// Auto-generated from seq_invalid_second.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated seq_invalid_second', function() {
  it("bash: seq 1 b", async function() {
    const stdin = "";
    const result = await klsh.klsh.main({ stdin: "seq 1 b", input: stdin, env: {} });
    expect(result.stdout).to.equal("");
    expect(result.stderr).to.equal("seq: invalid floating point argument: ‘b’\nTry 'seq --help' for more information.\n");
    expect(result.env['?']).to.equal(1);
  });
});
