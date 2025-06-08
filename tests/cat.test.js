const { expect } = require('chai');
const klsh = require('../dist/klsh.js');

describe('cat', function() {
  it('returns the same string from stdin', function() {
    const text = "first line\nsecond line\nthird line\n"
    const result = klsh.cat.main({ args: [], stdin: text, env: {} });
    expect(result).to.deep.equal({stdout: text, stderr: '', env: {'?': 0}});
  });

  it('numbers all output lines with -n option', function() {
    const text = "first line\nsecond line\nthird line\n"
    const rtext = "1\tfirst line\n2\tsecond line\n3\tthird line\n"
    const result = klsh.cat.main({ args: ['-n'], stdin: text, env: {} });
    expect(result).to.deep.equal({stdout: rtext, stderr: '', env: {'?': 0}});
  });

  it('numbers all output lines with --number option', function() {
    const text = "alpha\nbeta\n"
    const rtext = "1\talpha\n2\tbeta\n"
    const result = klsh.cat.main({ args: ['--number'], stdin: text, env: {} });
    expect(result).to.deep.equal({stdout: rtext, stderr: '', env: {'?': 0}});
  });
  // Edge case tests for empty and special inputs
  it('handles empty input without -n', function() {
    const result = klsh.cat.main({ args: [], stdin: "", env: {} });
    expect(result).to.deep.equal({ stdout: "", stderr: "", env: {'?': 0} });
  });

  it('handles empty input with -n option', function() {
    const result = klsh.cat.main({ args: ['-n'], stdin: "", env: {} });
    expect(result).to.deep.equal({ stdout: "", stderr: "", env: {'?': 0} });
  });

  it('handles input without trailing newline', function() {
    const input = "a\nb";
    const result = klsh.cat.main({ args: [], stdin: input, env: {} });
    expect(result).to.deep.equal({ stdout: input, stderr: "", env: {'?': 0} });
  });

  it('numbers input without trailing newline with -n', function() {
    const input = "a\nb";
    const rtext = "1\ta\n2\tb";
    const result = klsh.cat.main({ args: ['-n'], stdin: input, env: {} });
    expect(result).to.deep.equal({ stdout: rtext, stderr: "", env: {'?': 0} });
  });

  it('handles single line input without newline', function() {
    const input = "solo";
    const result = klsh.cat.main({ args: [], stdin: input, env: {} });
    expect(result).to.deep.equal({ stdout: input, stderr: "", env: {'?': 0} });
  });

  it('numbers single line input without newline with -n', function() {
    const input = "solo";
    const rtext = "1\tsolo";
    const result = klsh.cat.main({ args: ['-n'], stdin: input, env: {} });
    expect(result).to.deep.equal({ stdout: rtext, stderr: "", env: {'?': 0} });
  });

  it('handles input with only newlines without -n', function() {
    const input = "\n\n";
    const result = klsh.cat.main({ args: [], stdin: input, env: {} });
    expect(result).to.deep.equal({ stdout: input, stderr: "", env: {'?': 0} });
  });

  it('numbers input with only newlines with -n', function() {
    const input = "\n\n";
    const rtext = "1\t\n2\t\n";
    const result = klsh.cat.main({ args: ['-n'], stdin: input, env: {} });
    expect(result).to.deep.equal({ stdout: rtext, stderr: "", env: {'?': 0} });
  });

});
