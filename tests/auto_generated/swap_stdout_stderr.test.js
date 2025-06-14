// Auto-generated from swap_stdout_stderr.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated swap_stdout_stderr', function() {
  it("bash: klsh", async function() {
    const stdin = "echo data > /tmp/swap_stdout_stderr.txt\ncat /tmp/swap_stdout_stderr.txt /tmp/swap_stdout_stderr_non_existing.txt\n";
    const result = await klsh.klsh.main({ stdin: "klsh", input: stdin, env: {} });
    expect(result.stdout).to.equal("data\n");
    expect(result.stderr).to.equal("cat: /tmp/swap_stdout_stderr_non_existing.txt: No such file or directory\n");
    expect(result.env['?']).to.equal(1);
  });
});
