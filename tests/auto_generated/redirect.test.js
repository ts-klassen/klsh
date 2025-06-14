// Auto-generated from redirect.json. Do not edit.
const { expect } = require('chai');
const klsh = require('../../dist/klsh.js');

describe('auto-generated redirect', function() {
  it("bash: cat > /tmp/a.txt; echo next line >> /tmp/a.txt; cat < /tmp/a.txt >> $(echo /tmp/a.txt); cat << EOF > /tmp/b.txt; echo '/tmp/a.txt:'; cat /tmp/a.txt; echo '/tmp/b.txt:'; cat /tmp/b.txt; echo $?;\nhello /tmp/b.txt\nnext line of /tmp/b.txt\nEOF\n", async function() {
    const stdin = "stdin\n";
    const args = [">","/tmp/a.txt;","echo","next","line",">>","/tmp/a.txt;","cat","<","/tmp/a.txt",">>","$(echo","/tmp/a.txt);","cat","<<","EOF",">","/tmp/b.txt;","echo","'/tmp/a.txt:';","cat","/tmp/a.txt;","echo","'/tmp/b.txt:';","cat","/tmp/b.txt;","echo","$?;","hello","/tmp/b.txt","next","line","of","/tmp/b.txt","EOF"];
    const result = await klsh.cat.main({ args, stdin, env: {} });
    expect(result.stdout).to.equal("/tmp/a.txt:\nstdin\nnext line\n/tmp/b.txt:\nhello /tmp/b.txt\nnext line of /tmp/b.txt\n0\n");
    expect(result.stderr).to.equal("cat: -: input file is output file\n");
    expect(result.env['?']).to.equal(0);
  });
});
