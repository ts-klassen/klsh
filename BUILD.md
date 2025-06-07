BUILD.md
========

Overview
--------
`build.js` is the project’s bundler for generating both:
 1. `src/index.js` (for Node.js CORE API)
 2. `dist/klsh.js` (a single UMD bundle for browser or Node)

Key Steps
---------
1. Generate `src/index.js`
   - Scans `src/core/*.js` for modules
   - Extracts each `module.exports = { ... }` to find exported keys
   - Emits a simple file requiring each core component’s `main` function

2. Bundle `dist/klsh.js`
   - Starts a UMD IIFE: `var klsh = {};`
   - **Parser embedding:**
     - Scans `src/parser` for any `.jison` grammars
     - Reads helper file `src/parser/main.js` (if present), strips off its `module.exports` line, and inlines its function declarations
     - Automatically wires up each helper export under `klsh.parser.<fnName>`
     - For each grammar file:
       - Uses JISON at build time to generate a standalone parser
       - Strips out the UMD/CommonJS wrapper from that code
       - Inlines the raw parser code into the IIFE
       - Attaches an object to `klsh.parser.<grammarName>` exposing:
         - `main`: the stubbed `main` from helper file (Not implemented)
         - `parse`: the real parser function bound to its parser instance
   - **Core components embedding:**
     - Iterates over `src/core/*.js` again
     - Moves each `main` function into `klsh.<componentName>.main` and any other exports alongside

3. Output
   - Writes `dist/klsh.js` containing:
     ```js
     (function(global) {
       var klsh = {};
       // parser helpers & inlined parsers
       // core components
       module.exports = klsh;
     })(this);
     ```

Additions
---------
- If additional `.jison` grammars are dropped into `src/parser`, they will be auto-discovered and embedded
- If helpers are added to `src/parser/main.js`'s `module.exports`, they will appear as `klsh.parser.<helperName>`

Pre-commit
----------
- Run `node build.js` and verify `npm test` passes

Maintainers: update this doc whenever `build.js` logic changes.