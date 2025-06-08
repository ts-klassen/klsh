// Auto-generated from cat_number_nonblank.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated cat_number_nonblank', function() {
  it("bash: cat --number-nonblank", function() {
    const stdin = "line 1\n\nline 3\n";
    const args = ["--number-nonblank"];
    const result = klsh.cat.main({ args, stdin, env: {} });
    expect(result.stdout).to.equal("     1\tline 1\n\n     2\tline 3\n");
    expect(result.stderr).to.equal("");
    expect(result.env['?']).to.equal(0);
  });
});
