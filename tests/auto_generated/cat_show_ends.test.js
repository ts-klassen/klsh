// Auto-generated from cat_show_ends.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated cat_show_ends', function() {
  it("bash: cat --show-ends", async function() {
    const stdin = "foo\nbar\n";
    const result = await klsh.klsh.main({ stdin: "cat --show-ends", input: stdin, env: {} });
    expect(result.stdout).to.equal("foo$\nbar$\n");
    expect(result.stderr).to.equal("");
    expect(result.env['?']).to.equal(0);
  });
});
