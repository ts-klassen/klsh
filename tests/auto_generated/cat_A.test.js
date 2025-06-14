// Auto-generated from cat_A.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated cat_A', function() {
  it("bash: cat -A", async function() {
    const stdin = "foo\nbar\n";
    const result = await klsh.klsh.main({ stdin: "cat -A", input: stdin, env: {} });
    expect(result.stdout).to.equal("foo$\nbar$\n");
    expect(result.stderr).to.equal("");
    expect(result.env['?']).to.equal(0);
  });
});
