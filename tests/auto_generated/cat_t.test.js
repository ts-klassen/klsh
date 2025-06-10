// Auto-generated from cat_t.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated cat_t', function() {
  it("bash: cat -t", async function() {
    const stdin = "col1\tcol2\n";
    const args = ["-t"];
    const result = await klsh.cat.main({ args, stdin, env: {} });
    expect(result.stdout).to.equal("col1^Icol2\n");
    expect(result.stderr).to.equal("");
    expect(result.env['?']).to.equal(0);
  });
});
