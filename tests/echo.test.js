const { expect } = require('chai');
const klsh = require('../dist/klsh.js');

describe('echo', function() {
  it('returns the same string', async function() {
    const result = await klsh.echo.main({ args: ['hello', 'world'], stdin: '', env: {} });
    expect(result).to.deep.equal({stdout: 'hello world\n', stderr: '', env: {'?': 0}});
  });
  it('no new line', async function() {
    const result = await klsh.echo.main({ args: ['-n', 'hello', 'world'], stdin: '', env: {} });
    expect(result).to.deep.equal({stdout: 'hello world', stderr: '', env: {'?': 0}});
  });
  it('interprets backslash escapes with -e', async function() {
    const result = await klsh.echo.main({ args: ['-e', 'foo\\nbar'], stdin: '', env: {} });
    expect(result).to.deep.equal({stdout: 'foo\nbar\n', stderr: '', env: {'?': 0}});
  });
  // Detailed -e escape sequence tests
  it('interprets backslash (\\) escape', async function() {
    const result = await klsh.echo.main({ args: ['-e', '\\\\'], stdin: '', env: {} });
    expect(result).to.deep.equal({stdout: '\\\n', stderr: '', env: {'?': 0}});
  });
  it('interprets \\a as alert (BEL)', async function() {
    const result = await klsh.echo.main({ args: ['-e', '\\a'], stdin: '', env: {} });
    expect(result).to.deep.equal({stdout: '\x07\n', stderr: '', env: {'?': 0}});
  });
  it('interprets \\b as backspace', async function() {
    const result = await klsh.echo.main({ args: ['-e', '\\b'], stdin: '', env: {} });
    expect(result).to.deep.equal({stdout: '\b\n', stderr: '', env: {'?': 0}});
  });
  it('interprets \\c to suppress further output', async function() {
    const result = await klsh.echo.main({ args: ['-e', 'foo\\cbar'], stdin: '', env: {} });
    expect(result).to.deep.equal({stdout: 'foo', stderr: '', env: {'?': 0}});
  });
  it('interprets \\e as escape', async function() {
    const result = await klsh.echo.main({ args: ['-e', '\\e'], stdin: '', env: {} });
    expect(result).to.deep.equal({stdout: '\x1b\n', stderr: '', env: {'?': 0}});
  });
  it('interprets \\f as form feed', async function() {
    const result = await klsh.echo.main({ args: ['-e', '\\f'], stdin: '', env: {} });
    expect(result).to.deep.equal({stdout: '\f\n', stderr: '', env: {'?': 0}});
  });
  it('interprets \\n as new line', async function() {
    const result = await klsh.echo.main({ args: ['-e', '\\n'], stdin: '', env: {} });
    expect(result).to.deep.equal({stdout: '\n\n', stderr: '', env: {'?': 0}});
  });
  it('interprets \\r as carriage return', async function() {
    const result = await klsh.echo.main({ args: ['-e', '\\r'], stdin: '', env: {} });
    expect(result).to.deep.equal({stdout: '\r\n', stderr: '', env: {'?': 0}});
  });
  it('interprets \\t as horizontal tab', async function() {
    const result = await klsh.echo.main({ args: ['-e', '\\t'], stdin: '', env: {} });
    expect(result).to.deep.equal({stdout: '\t\n', stderr: '', env: {'?': 0}});
  });
  it('interprets \\v as vertical tab', async function() {
    const result = await klsh.echo.main({ args: ['-e', '\\v'], stdin: '', env: {} });
    expect(result).to.deep.equal({stdout: '\v\n', stderr: '', env: {'?': 0}});
  });
  it('interprets \\0NNN as octal', async function() {
    const result = await klsh.echo.main({ args: ['-e', '\\040'], stdin: '', env: {} });
    expect(result).to.deep.equal({stdout: ' \n', stderr: '', env: {'?': 0}});
  });
  it('interprets \\xHH as hexadecimal', async function() {
    const result = await klsh.echo.main({ args: ['-e', '\\x41'], stdin: '', env: {} });
    expect(result).to.deep.equal({stdout: 'A\n', stderr: '', env: {'?': 0}});
  });
});
