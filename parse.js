#!/usr/bin/env node
const fs = require('fs');
const { Parser } = require('jison');

// Read grammar definition
const grammar = fs.readFileSync(__dirname + '/klsh.jison', 'utf8');
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