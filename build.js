const fs = require('fs');
const path = require('path');

const coreDir = path.join(__dirname, 'src', 'core');
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

const files = fs.readdirSync(coreDir).filter(f => f.endsWith('.js'));

// Read each core module, detect its exports and count requires to order bundling
const modules = files.map(file => {
  const filePath = path.join(coreDir, file);
  const rawContent = fs.readFileSync(filePath, 'utf8');
  const exportMatch = rawContent.match(/module\.exports\s*=\s*\{([^}]*)\}/);
  const exportKeys = exportMatch
    ? exportMatch[1].split(',').map(s => s.trim())
    : [];
  const requireMatches = rawContent.match(/require\(\s*['"]\.\/\w+['"]\s*\)/g) || [];
  const requireCount = requireMatches.length;
  return { file, rawContent, exportKeys, requireCount };
});

// Sort modules so dependencies (with fewer requires) come first
modules.sort((a, b) => a.requireCount - b.requireCount);


// Begin bundle output
// Embed all parsers defined in src/parser
const { Parser: JisonParser } = require('jison');
const parserDir = path.join(__dirname, 'src', 'parser');
const parserFiles = fs.existsSync(parserDir)
  ? fs.readdirSync(parserDir).filter(f => f.endsWith('.jison'))
  : [];
// Start bundle and root object 'klsh'
let output = `(function(global) {
  var klsh = {};
  klsh['parser'] = {};
`;
// Inline parser helper functions from src/parser/main.js
const helperPath = path.join(parserDir, 'main.js');
let helperSrc = '';
let helperExports = [];
if (fs.existsSync(helperPath)) {
  const raw = fs.readFileSync(helperPath, 'utf8');
  const m = raw.match(/module\.exports\s*=\s*\{([^}]*)\}/);
  if (m) helperExports = m[1].split(',').map(s => s.trim()).filter(Boolean);
  helperSrc = raw.replace(/module\.exports\s*=\s*\{[^}]*\};?/, '');
}
if (helperSrc) {
  const indentedHelper = helperSrc
    .split('\n')
    .map(line => '  ' + line)
    .join('\n');
  output += `${indentedHelper}
${helperExports.map(fn => `  klsh.parser['${fn}'] = ${fn};`).join('\n')}
`;
}
// For each grammar, generate a standalone parser and attach to components.parser
parserFiles.forEach(file => {
  const name = path.basename(file, '.jison');
  const grammar = fs.readFileSync(path.join(parserDir, file), 'utf8');
  const fullCode = new JisonParser(grammar).generate();
  // strip CommonJS exports wrapper if any
  let code = fullCode;
  const idx = fullCode.indexOf('if (typeof require');
  if (idx > 0) code = fullCode.slice(0, idx);
  // embed parser implementation
  const indentedCode = code
    .split('\n')
    .map(line => '  ' + line)
    .join('\n');
  output += `  // parser: ${name}
${indentedCode}
  klsh.parser['${name}'] = {
    main: main,
    parse: parser.parse.bind(parser)
  };
`;
});

modules.forEach(({ file, rawContent, exportKeys }) => {
  const name = path.basename(file, '.js');
  // Remove module.exports assignment
  let content = rawContent.replace(/module\.exports\s*=\s*\{[^}]*\};?/, '');
  // Rename main to module name
  content = content.replace(/function\s+main/, `function ${name}`);
  // Replace requires to other core modules with component references
  content = content.replace(/require\(\s*['"]\.\/([\w-]+)['"]\s*\)/g, "klsh['$1']");
  // Wrap module code and assign exports
  const indentedContent = content
    .split('\n')
    .map(line => '    ' + line)
    .join('\n');
  output += `  // component: ${name}
  (function() {
${indentedContent}
    klsh['${name}'] = { ${exportKeys.map(key => `${key}: ${key === 'main' ? name : key}`).join(', ')} };
  })();
`;
});

output += `
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = klsh;
  } else {
    global.klsh = klsh;
  }
})(typeof window !== 'undefined' ? window : this);
`;

fs.writeFileSync(path.join(distDir, 'klsh.js'), output);
console.log('Built dist/klsh.js');