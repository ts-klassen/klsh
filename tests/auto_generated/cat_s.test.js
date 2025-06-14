// Auto-generated from cat_s.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated cat_s', function() {
  it("bash: cat -s", async function() {
    const stdin = "a\n\n\nb\n";
    const result = await klsh.klsh.main({ stdin: "cat -s", input: stdin, env: {} });
    expect(result.stdout).to.equal("a\n\nb\n");
    expect(result.stderr).to.equal("");
    expect(result.env['?']).to.equal(0);
  });
});
