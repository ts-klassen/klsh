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
        const result = klsh.parser.build(ast);
        expect(result).to.equal("echo arg1;\n");
    });
    it('example in requeirements', async function() {
        const expected = "cat 'file.txt' 1> 'overwrite.txt' 2>> 'append.txt' 0< 'input.txt' 0<<< 'heredoc line 1\nline 2\nLet'\"'\"'s finish\n' | sort | head -n 10;\ncat '/tmp/swap_stdout_stderr.txt' '/tmp/swap_stdout_stderr_non_existing.txt' 3>&1 4>&2 5>&3 6>&4 1>&6 2>&5;\n";
        const ast = [
            {
                "component": [
                    {
                        "type": "text",
                        "value": "cat"
                    }
                ],
                "params": [
                    [
                        {
                            "type": "text",
                            "value": "file.txt"
                        }
                    ]
                ],
                "pipe": {
                    "component": [
                        {
                            "type": "text",
                            "value": "sort"
                        }
                    ],
                    "params": [],
                    "pipe": {
                        "component": [
                            {
                                "type": "text",
                                "value": "head"
                            }
                        ],
                        "params": [
                            [
                                {
                                    "type": "text",
                                    "value": "-n"
                                }
                            ],
                            [
                                {
                                    "type": "text",
                                    "value": "10"
                                }
                            ]
                        ]
                    }
                },
                "redirect": [
                    {
                        "type": "overwrite",
                        "fd": "1",
                        "value": [
                            {
                                "type": "text",
                                "value": "overwrite.txt"
                            }
                        ]
                    },
                    {
                        "type": "append",
                      "fd": "2",
                        "value": [
                            {
                                "type": "text",
                                "value": "append.txt"
                            }
                        ]
                    },
                    {
                        "type": "input",
                        "fd": "0",
                        "value": [
                            {
                                "type": "text",
                                "value": "input.txt"
                            }
                        ]
                    },
                    {
                        "type": "heredoc",
                        "fd": "0",
                        "value": [
                            {
                                "type": "text",
                                "value": "heredoc line 1\nline 2\nLet"
                            },
                            {
                                "type": "text",
                                "value": "'"
                            },
                            {
                                "type": "text",
                                "value": "s finish\n"
                            }
                 ]
                    }
                ]
            },
            {
                "component": [
                    {
                        "type": "text",
                        "value": "cat"
                    }
                ],
                "params": [
                    [
                        {
                            "type": "text",
                            "value": "/tmp/swap_stdout_stderr.txt"
                        }
                    ],
                    [
                        {
                            "type": "text",
                            "value": "/tmp/swap_stdout_stderr_non_existing.txt"
                        }
                    ]
                ],
                "redirect": [
                    {
                        "type": "overwrite",
                        "fd": "3",
                        "value": "&1"
                    },
                    {
                        "type": "overwrite",
                        "fd": "4",
                        "value": "&2"
                    },
                    {
                        "type": "overwrite",
                        "fd": "5",
                        "value": "&3"
                    },
                    {
                        "type": "overwrite",
                       "fd": "6",
                        "value": "&4"
                    },
                    {
                        "type": "overwrite",
                        "fd": "1",
                        "value": "&6"
                    },
                    {
                        "type": "overwrite",
                        "fd": "2",
                        "value": "&5"
                    }
                ]
            }
        ];
        const result = klsh.parser.build(ast);
        expect(result).to.equal(expected);
    });
});
