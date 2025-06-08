// Auto-generated from cat_n_blank.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated cat_n_blank', function() {
  it("bash: cat -n", function() {
    const stdin = "line 1\n\nline 3\n";
    const args = ["-n"];
    const result = klsh.cat.main({ args, stdin, env: {} });
    expect(result.stdout).to.equal("     1\tline 1\n     2\t\n     3\tline 3\n");
    expect(result.stderr).to.equal("");
    expect(result.env['?']).to.equal(0);
  });
});
