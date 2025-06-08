// Auto-generated from cat_z.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated cat_z', function() {
  it("bash: cat -z", function() {
    const stdin = "";
    const args = ["-z"];
    const result = klsh.cat.main({ args, stdin, env: {} });
    expect(result.stdout).to.equal("");
    expect(result.stderr).to.equal("cat: invalid option -- 'z'\nTry 'cat --help' for more information.\n");
    expect(result.env['?']).to.equal(1);
  });
});
