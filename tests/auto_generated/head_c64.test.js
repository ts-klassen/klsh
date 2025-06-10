// Auto-generated from head_c64.txt. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated head_c64', function() {
  it("bash: head -c 64", async function() {
    const stdin = "Usage: head [OPTION]... [FILE]...\nPrint the first 10 lines of each FILE to standard output.\nWith more than one FILE, precede each with a header giving the file name.\n\nWith no FILE, or when FILE is -, read standard input.\n\nMandatory arguments to long options are mandatory for short options too.\n  -c, --bytes=[-]NUM       print the first NUM bytes of each file;\n                             with the leading '-', print all but the last\n                             NUM bytes of each file\n  -n, --lines=[-]NUM       print the first NUM lines instead of the first 10;\n                             with the leading '-', print all but the last\n                             NUM lines of each file\n  -q, --quiet, --silent    never print headers giving file names\n  -v, --verbose            always print headers giving file names\n  -z, --zero-terminated    line delimiter is NUL, not newline\n      --help     display this help and exit\n      --version  output version information and exit\n\nNUM may have a multiplier suffix:\nb 512, kB 1000, K 1024, MB 1000*1000, M 1024*1024,\nGB 1000*1000*1000, G 1024*1024*1024, and so on for T, P, E, Z, Y.\nBinary prefixes can be used, too: KiB=K, MiB=M, and so on.\n\nGNU coreutils online help: <https://www.gnu.org/software/coreutils/>\nFull documentation <https://www.gnu.org/software/coreutils/head>\nor available locally via: info '(coreutils) head invocation'\n";
    const args = ["-c","64"];
    const result = await klsh.head.main({ args, stdin, env: {} });
    expect(result.stdout).to.equal("Usage: head [OPTION]... [FILE]...\nPrint the first 10 lines of ea");
    expect(result.stderr).to.equal("");
    expect(result.env['?']).to.equal(0);
  });
});
