// Auto-generated from cat_invalid_option.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated cat_invalid_option', function() {
  it("bash: cat --invalid", async function() {
    const stdin = "";
    const result = await klsh.klsh.main({ stdin: "cat --invalid", input: stdin, env: {} });
    expect(result.stdout).to.equal("");
    expect(result.stderr).to.equal("cat: unrecognized option '--invalid'\nTry 'cat --help' for more information.\n");
    expect(result.env['?']).to.equal(1);
  });
});
