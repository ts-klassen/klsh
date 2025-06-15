const { expect } = require('chai');
const klsh = require('../dist/klsh.js');

describe('parser build', function() {
  it('echo arg1', async function() {
    const ast = [
        {
            "component": [
                {
                    "type": "text",
                    "value": "echo"
                }
            ],
            "params": [
                [
                    {
                        "type": "text",
                        "value": "arg1"
                    }
                ]
            ]
        }
    ];
    const result = await klsh.parser.build(ast);
    expect(result).to.equal("echo arg1");
  });
});
