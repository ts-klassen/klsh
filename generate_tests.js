#!/usr/bin/env node
// Auto-generate Mocha/Chai tests comparing custom klsh commands to real Bash
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const rootDir = __dirname;
// Ensure dist/klsh.js is built
const distPath = path.join(rootDir, 'dist', 'klsh.js');
if (!fs.existsSync(distPath)) {
  console.log('Building dist/klsh.js...');
  const build = spawnSync('node', ['build.js'], { stdio: 'inherit', cwd: rootDir });
  if (build.status !== 0) {
    console.error('Error: build failed, cannot generate tests.');
    process.exit(build.status || 1);
  }
}
const klsh = require(distPath);

const defsDir = path.join(rootDir, 'test_definitions');
if (!fs.existsSync(defsDir) || !fs.statSync(defsDir).isDirectory()) {
  console.error('Error: test_definitions directory not found');
  process.exit(1);
}
const outDir = path.join(rootDir, 'tests', 'auto_generated');
// Clean or create output directory
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

// Collect definition files
const defs = fs.readdirSync(defsDir).filter(f => f.endsWith('.txt') || f.endsWith('.json'));
if (defs.length === 0) {
  console.log('No test definition files found in', defsDir);
  process.exit(0);
}
let count = 0;
for (const file of defs) {
  const fullPath = path.join(defsDir, file);
  let command;
  let stdin;
  // Load definition
  if (file.endsWith('.txt')) {
    const lines = fs.readFileSync(fullPath, 'utf8').split(/\r?\n/);
    command = (lines[0] || '').trim();
    stdin = lines.slice(1).join('\n');
  } else {
    const obj = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    command = String(obj.command || '');
    stdin = String(obj.stdin || '');
  }
  if (!command) {
    console.warn(`Skipping ${file}: empty command`);
    continue;
  }
  // Run real Bash
  const bash = spawnSync('bash', ['-c', command], { input: stdin, encoding: 'utf8' });
  const expStdout = bash.stdout;
  const expStderr = bash.stderr;
  const expCode = bash.status != null ? bash.status : (bash.error ? 1 : 0);
  // Determine command parts
  const parts = command.split(/\s+/).filter(Boolean);
  const name = parts[0];
  // Prepare test file content
  const testName = path.basename(file, path.extname(file)).replace(/[^a-zA-Z0-9_]/g, '_');
  const outFile = path.join(outDir, testName + '.test.js');
  const content = [];
  content.push(`// Auto-generated from ${file}. Do not edit.`);
  content.push("const { expect } = require('chai');");
  content.push("const klsh = require('../../dist/klsh.js');");
  content.push('');
  content.push(`describe('auto-generated ${testName}', function() {`);
  // Safely quote the test description using JSON.stringify to handle special characters
  content.push(`  it(${JSON.stringify('bash: ' + command)}, function() {`);
  content.push(`    const stdin = ${JSON.stringify(stdin)};`);
  content.push(`    const args = ${JSON.stringify(parts.slice(1))};`);
  content.push('    const result = klsh.' + name + '.main({ args, stdin, env: {} });');
  content.push(`    expect(result.stdout).to.equal(${JSON.stringify(expStdout)});`);
  content.push(`    expect(result.stderr).to.equal(${JSON.stringify(expStderr)});`);
  content.push(`    expect(result.env['?']).to.equal(${expCode});`);
  content.push('  });');
  content.push('});');
  fs.writeFileSync(outFile, content.join('\n') + '\n');
  count++;
}
console.log(`Generated ${count} test(s) in ${outDir}`);
