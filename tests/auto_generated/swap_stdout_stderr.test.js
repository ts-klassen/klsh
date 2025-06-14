// Auto-generated from swap_stdout_stderr.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated swap_stdout_stderr', function() {
  it("bash: klsh", async function() {
    const stdin = "echo data > /tmp/swap_stdout_stderr.txt\ncat /tmp/swap_stdout_stderr.txt /tmp/swap_stdout_stderr_non_existing.txt 3>&1 4>&2 5>&3 6>&4 1>&6 2>&5\n";
    const result = await klsh.klsh.main({ stdin: "klsh", input: stdin, env: {} });
    expect(result.stdout).to.equal("cat: /tmp/swap_stdout_stderr_non_existing.txt: No such file or directory\n");
    expect(result.stderr).to.equal("data\n");
    expect(result.env['?']).to.equal(1);
  });
});
