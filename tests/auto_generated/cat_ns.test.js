// Auto-generated from cat_ns.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated cat_ns', function() {
  it("bash: cat -ns", function() {
    const stdin = "a\n\nb\n";
    const args = ["-ns"];
    const result = klsh.cat.main({ args, stdin, env: {} });
    expect(result.stdout).to.equal("     1\ta\n     2\t\n     3\tb\n");
    expect(result.stderr).to.equal("");
    expect(result.env['?']).to.equal(0);
  });
});
