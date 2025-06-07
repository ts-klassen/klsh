# BUILD.md

## Overview

`build.js` is the project bundler that produces `dist/klsh.js`, a single UMD bundle for browser and Node.js.

## Key Steps

1. **Bundle `dist/klsh.js`**

   - **UMD wrapper**
     Starts a UMD IIFE that initializes `var klsh = {};`.

   - **Parser embedding**
     1. Scan `src/parser` for any `.jison` files.
     2. Read helper file `src/parser/main.js` (if present), strip off its `module.exports` line, and inline its function declarations.
     3. Wire up each helper export under `klsh.parser.<fnName>`.
     4. For each grammar file:
        - Generate a standalone parser via Jison at build time.
        - Strip the UMD/CommonJS wrapper from the generated code.
        - Inline the raw parser code into the IIFE.
        - Attach:
          - `main`: stubbed main from helper file (Not implemented).
          - `parse`: real parser function bound to its parser instance.

   - **Core components embedding**
     1. Scan `src/core/*.js` for modules.
     2. For each module:
        - Parse `module.exports = {...}` to find exported keys.
        - Remove the `module.exports` line.
        - Rename `main` function to the module name.
        - Inline the code and attach each export under `klsh.<componentName>`.

## Output

Writes `dist/klsh.js` containing:
```js
(function(global) {
  var klsh = {};
  // parser helpers & inlined parsers
  // core components
  module.exports = klsh;
})(this);
```

## Additions

- Dropping new `.jison` files into `src/parser` auto-discovers and embeds them.
- Exported functions in `src/parser/main.js` appear as `klsh.parser.<helperName>`.

## Pre-commit

- Run `node build.js` and verify `npm test` passes.

Maintain this document whenever `build.js` logic changes.
