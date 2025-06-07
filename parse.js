#!/usr/bin/env node
const klsh = require('./dist/klsh.js');

// Determine which grammar to load: <grammarName> or path to .jison
const path = require('path');
const grammarArg = process.argv[2];
if (!grammarArg) {
    console.error('Usage: parse.js <grammar>');
    console.error('  <grammar> can be a .jison file path or a grammar name in src/parser');
    process.exit(1);
}

// Collect stdin
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
    try {
        const result = klsh.parser[grammarArg](input);
        console.log(JSON.stringify(result, null, 4));
    } catch (err) {
        console.error('Parse error:', err.message);
        process.exit(1);
    }
});
