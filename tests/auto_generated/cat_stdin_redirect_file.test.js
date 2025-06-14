// Auto-generated from cat_stdin_redirect_file.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated cat_stdin_redirect_file', function() {
  it("bash: klsh", async function() {
    const stdin = "echo file1 > /tmp/cat_stdin_redirect_file_1.txt\necho file2 > /tmp/cat_stdin_redirect_file_2.txt\necho file3 > /tmp/cat_stdin_redirect_file_3.txt\necho case 1\necho stdin1 | cat < /tmp/cat_stdin_redirect_file_1.txt < /tmp/cat_stdin_redirect_file_2.txt <<< heredoc1 <<< heredoc2 /tmp/cat_stdin_redirect_file_3.txt\necho case 2\necho stdin1 | cat < /tmp/cat_stdin_redirect_file_1.txt < /tmp/cat_stdin_redirect_file_2.txt <<< heredoc1 <<< heredoc2\necho case 3\necho stdin1 | cat <<< heredoc1 <<< heredoc2 < /tmp/cat_stdin_redirect_file_1.txt < /tmp/cat_stdin_redirect_file_2.txt\necho case 4\necho stdin1 | cat <<< heredoc1 < /tmp/cat_stdin_redirect_file_1.txt <<< heredoc2 < /tmp/cat_stdin_redirect_file_2.txt\necho case 5\necho stdin1 | cat < /tmp/cat_stdin_redirect_file_1.txt <<< heredoc1 < /tmp/cat_stdin_redirect_file_2.txt <<< heredoc2\necho case 6\necho stdin1 | cat < /tmp/cat_stdin_redirect_file_1.txt < /tmp/cat_stdin_redirect_file_2.txt\necho case 7\necho stdin1 | cat <<< heredoc1 <<< heredoc2\necho case 8\ncat < /tmp/cat_stdin_redirect_file_1.txt < /tmp/cat_stdin_redirect_file_2.txt <<< heredoc1 <<< heredoc2\necho case 9\ncat <<< heredoc1 <<< heredoc2 < /tmp/cat_stdin_redirect_file_1.txt < /tmp/cat_stdin_redirect_file_2.txt\n";
    const result = await klsh.klsh.main({ stdin: "klsh", input: stdin, env: {} });
    expect(result.stdout).to.equal("case 1\nfile3\ncase 2\nheredoc2\ncase 3\nfile2\ncase 4\nfile2\ncase 5\nheredoc2\ncase 6\nfile2\ncase 7\nheredoc2\ncase 8\nheredoc2\ncase 9\nfile2\n");
    expect(result.stderr).to.equal("");
    expect(result.env['?']).to.equal(0);
  });
});
