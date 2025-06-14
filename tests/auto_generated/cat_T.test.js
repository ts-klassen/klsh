// Auto-generated from cat_T.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated cat_T', function() {
  it("bash: cat -T", async function() {
    const stdin = "col1\tcol2\n";
    const result = await klsh.klsh.main({ stdin: "cat -T", input: stdin, env: {} });
    expect(result.stdout).to.equal("col1^Icol2\n");
    expect(result.stderr).to.equal("");
    expect(result.env['?']).to.equal(0);
  });
});
