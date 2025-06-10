// Auto-generated from cat_empty.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated cat_empty', function() {
  it("bash: cat", async function() {
    const stdin = "";
    const args = [];
    const result = await klsh.cat.main({ args, stdin, env: {} });
    expect(result.stdout).to.equal("");
    expect(result.stderr).to.equal("");
    expect(result.env['?']).to.equal(0);
  });
});
