const components = {};

if (typeof require === 'function' && typeof require.context === 'function') {
  const context = require.context('./core', false, /\.js$/);
  context.keys().forEach(key => {
    const name = key.replace(/^\.\/(.*)\.js$/, '$1');
    const mod = context(key);
    components[name] = mod.main;
  });
} else {
  const fs = require('fs');
  const path = require('path');
  const coreDir = path.join(__dirname, 'core');
  fs.readdirSync(coreDir).forEach(file => {
    if (file.endsWith('.js')) {
      const name = file.replace(/\.js$/, '');
      const mod = require(path.join(coreDir, file));
      components[name] = mod.main;
    }
  });
}

module.exports = components;