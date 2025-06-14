// Auto-generated from cat_b.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated cat_b', function() {
  it("bash: cat -b", async function() {
    const stdin = "line 1\n\nline 3\n";
    const result = await klsh.klsh.main({ stdin: "cat -b", input: stdin, env: {} });
    expect(result.stdout).to.equal("     1\tline 1\n\n     2\tline 3\n");
    expect(result.stderr).to.equal("");
    expect(result.env['?']).to.equal(0);
  });
});
