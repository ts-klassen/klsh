// Auto-generated from cat_u.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated cat_u', function() {
  it("bash: cat -u", async function() {
    const stdin = "foo\nbar\n";
    const args = ["-u"];
    const result = await klsh.cat.main({ args, stdin, env: {} });
    expect(result.stdout).to.equal("foo\nbar\n");
    expect(result.stderr).to.equal("");
    expect(result.env['?']).to.equal(0);
  });
});
