// Auto-generated from cat_e.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated cat_e', function() {
  it("bash: cat -e", async function() {
    const stdin = "foo\nbar\n";
    const args = ["-e"];
    const result = await klsh.cat.main({ args, stdin, env: {} });
    expect(result.stdout).to.equal("foo$\nbar$\n");
    expect(result.stderr).to.equal("");
    expect(result.env['?']).to.equal(0);
  });
});
