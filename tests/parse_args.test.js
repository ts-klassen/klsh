const { expect } = require('chai');
const klsh = require('../dist/klsh.js');

describe('parse_args', function() {
  it('main is not implemented', async function() {
    const result = await klsh.parse_args.main({ args: [], stdin: '', env: {} });
    expect(result).to.deep.equal({stdout: '', stderr: 'Not implemented\n', env: {'?': 1}});
  });
  it('parse non option args', function() {
    const result = klsh.parse_args.parse(['hello', 'world'], []);
    expect(result).to.deep.equal({options: {}, operands: ['hello', 'world'], unknown: []});
  });
  it('parse flags', function() {
    const option_spec = [
        {
            key: 'print_version',
            short_tag: 'V',
            long_tag: 'version',
            spec: 'flag',
            help: 'output version information and exit'
        }
    ];
    let result;
    result = klsh.parse_args.parse(['hello', '-V', 'world'], option_spec);
    expect(result).to.deep.equal({options: {print_version: true}, operands: ['hello', 'world'], unknown: []});
    result = klsh.parse_args.parse(['hello', '--version', 'world'], option_spec);
    expect(result).to.deep.equal({options: {print_version: true}, operands: ['hello', 'world'], unknown: []});
    result = klsh.parse_args.parse(['hello', '-v', 'world'], option_spec);
    expect(result).to.deep.equal({options: {}, operands: ['hello', 'world'], unknown: ['-v']});
    result = klsh.parse_args.parse(['hello', '--', 'world', '-v', '--version'], option_spec);
    expect(result).to.deep.equal({options: {}, operands: ['hello', 'world', '-v', '--version'], unknown: []});
  });

  it('parse bundled flags', function() {
    const option_spec = [
        { key: 'a_flag', short_tag: 'a', long_tag: 'alpha', spec: 'flag', help: '' },
        { key: 'b_flag', short_tag: 'b', long_tag: 'beta', spec: 'flag', help: '' },
        { key: 'c_flag', short_tag: 'c', long_tag: 'gamma', spec: 'flag', help: '' }
    ];
    const result = klsh.parse_args.parse(['-abc', 'world'], option_spec);
    expect(result).to.deep.equal({options: {a_flag: true, b_flag: true, c_flag: true}, operands: ['world'], unknown: []});
  });
  it('parse string options', function() {
    const option_spec = [
        {
            key: 'name_s',
            short_tag: 'n',
            long_tag: 'name',
            spec: 'string',
            help: 'A name'
        }
    ];
    let result;
    result = klsh.parse_args.parse(['hello', '-n', 'test', 'world'], option_spec);
    expect(result).to.deep.equal({options: {name_s: 'test'}, operands: ['hello', 'world'], unknown: []});
    result = klsh.parse_args.parse(['hello', '--name', 'test', 'world'], option_spec);
    expect(result).to.deep.equal({options: {name_s: 'test'}, operands: ['hello', 'world'], unknown: []});
    result = klsh.parse_args.parse(['hello', '--Name', 'test', 'world'], option_spec);
    expect(result).to.deep.equal({options: {}, operands: ['hello', 'test', 'world'], unknown: ['--Name']});
    result = klsh.parse_args.parse(['hello', '--', 'world', '--name', '-n', 'test'], option_spec);
    expect(result).to.deep.equal({options: {}, operands: ['hello', 'world', '--name', '-n', 'test'], unknown: []});
    // support --name=test syntax
    result = klsh.parse_args.parse(['hello', '--name=test', 'world'], option_spec);
    expect(result).to.deep.equal({options: {name_s: 'test'}, operands: ['hello', 'world'], unknown: []});
  });
});
