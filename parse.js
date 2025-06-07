#!/usr/bin/env node
const fs = require('fs');
const { Parser } = require('jison');

// Determine which grammar to load: <grammarName> or path to .jison
const path = require('path');
const grammarArg = process.argv[2];
if (!grammarArg) {
    console.error('Usage: parse.js <grammar>');
    console.error('  <grammar> can be a .jison file path or a grammar name in src/parser');
    process.exit(1);
}
let grammarPath = grammarArg;
// if no extension and not an existing file, resolve to src/parser/<name>.jison
if (!grammarPath.endsWith('.jison') && !fs.existsSync(grammarPath)) {
    grammarPath = path.join(__dirname, 'src', 'parser', grammarArg + '.jison');
}
if (!fs.existsSync(grammarPath)) {
    console.error('Grammar file not found:', grammarPath);
    process.exit(1);
}
// Read grammar definition
const grammar = fs.readFileSync(grammarPath, 'utf8');
// Create parser
const parser = new Parser(grammar);

// Collect stdin
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
    try {
        const result = parser.parse(input);
        console.log(JSON.stringify(result, null, 4));
    } catch (err) {
        console.error('Parse error:', err.message);
        process.exit(1);
    }
});