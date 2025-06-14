// Auto-generated from head_bytes_ja.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated head_bytes_ja', function() {
  it("bash: head --bytes 3", async function() {
    const stdin = "あいうえお\n";
    const result = await klsh.klsh.main({ stdin: "head --bytes 3", input: stdin, env: {} });
    expect(result.stdout).to.equal("あ");
    expect(result.stderr).to.equal("");
    expect(result.env['?']).to.equal(0);
  });
});
