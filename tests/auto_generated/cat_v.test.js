// Auto-generated from cat_v.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated cat_v', function() {
  it("bash: cat -v", async function() {
    const stdin = "foo\nbar\n";
    const result = await klsh.klsh.main({ stdin: "cat -v", input: stdin, env: {} });
    expect(result.stdout).to.equal("foo\nbar\n");
    expect(result.stderr).to.equal("");
    expect(result.env['?']).to.equal(0);
  });
});
