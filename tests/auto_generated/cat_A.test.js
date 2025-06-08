// Auto-generated from cat_A.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated cat_A', function() {
  it("bash: cat -A", function() {
    const stdin = "foo\nbar\n";
    const args = ["-A"];
    const result = klsh.cat.main({ args, stdin, env: {} });
    expect(result.stdout).to.equal("foo$\nbar$\n");
    expect(result.stderr).to.equal("");
    expect(result.env['?']).to.equal(0);
  });
});
