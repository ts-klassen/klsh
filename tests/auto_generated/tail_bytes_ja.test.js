// Auto-generated from tail_bytes_ja.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated tail_bytes_ja', function() {
  it("bash: tail --bytes 3", async function() {
    const stdin = "あいうえお\n";
    const result = await klsh.klsh.main({ stdin: "tail --bytes 3", input: stdin, env: {} });
    expect(result.stdout).to.equal("��\n");
    expect(result.stderr).to.equal("");
    expect(result.env['?']).to.equal(0);
  });
});
