// Auto-generated from cat_number.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated cat_number', function() {
  it("bash: cat --number", async function() {
    const stdin = "line 1\nline 2\nline 3\n";
    const result = await klsh.klsh.main({ stdin: "cat --number", input: stdin, env: {} });
    expect(result.stdout).to.equal("     1\tline 1\n     2\tline 2\n     3\tline 3\n");
    expect(result.stderr).to.equal("");
    expect(result.env['?']).to.equal(0);
  });
});
