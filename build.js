const fs = require('fs');
const path = require('path');

const coreDir = path.join(__dirname, 'src', 'core');
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

const files = fs.readdirSync(coreDir).filter(f => f.endsWith('.js'));

let output = `(function(global) {
  var components = {};
`;

files.forEach(file => {
  const name = path.basename(file, '.js');
  let content = fs.readFileSync(path.join(coreDir, file), 'utf8');
  content = content.replace(/module\.exports\s*=\s*\{[^}]*\};?/g, '');
  content = content.replace(/function\s+main/, `function ${name}`);
  output += `
  // component: ${name}
  (function() {
${content.split('\n').map(line => '    ' + line).join('\n')}
    components['${name}'] = { main: ${name} };
  })();
`;
});

output += `
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = components;
  } else {
    global.klsh = components;
  }
})(typeof window !== 'undefined' ? window : this);
`;

fs.writeFileSync(path.join(distDir, 'klsh.js'), output);
console.log('Built dist/klsh.js');