#!/usr/bin/env node
const klsh = require('./dist/klsh.js');

// Collect stdin
let stdin = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { stdin += chunk; });
process.stdin.on('end', () => {
    res = klsh.klsh.main({stdin, env: {'KLSH_VERBOSE_ERROR': '1'}, args: []});
    console.log(res);
});
