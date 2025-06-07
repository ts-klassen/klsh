# klsh

Minimal text-based pipeline framework for browser environments, inspired by Bash-style pipelines.

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/ts-klassen/klsh.git
cd klsh
npm install
```

## Running Tests

Tests are written with Mocha & Chai. Run:

```bash
npm test
```

## Building for Browser

To bundle all components into a single JavaScript file for browser use, run:

```bash
npm run build
```

This generates `dist/klsh.js`. Include it in your HTML:

```html
<script src="dist/klsh.js"></script>
<script>
  // `klsh.echo.main` is now available globally
  const result = klsh.echo.main({ args: ['hello'], stdin: '', env: {} });
  console.log(result.stdout);
</script>
```

## Debugging with parse.js

For debugging and development, `parse.js` is a simple CLI tool that uses our Jison grammar
to parse a single klsh command and output the resulting JSON structure. It helps you
verify how commands and parameters are interpreted by the parser.

Usage:

```bash
node parse.js klsh <<EOF
echo hello world
EOF
```

Example output:

```json
{
    "component": "echo",
    "params": ["hello", "world"]
}
```

Note: `parse.js` is intended for debugging only and is not part of the runtime pipeline.

## Environment Variables

When invoking `main`, you can pass an `env` object to control behavior:

- `KLSH_VERBOSE_ERROR` (any value):
  if present in `env`, full error details (including `String(err)`) will be appended to stderr

All other `env` properties behave like shell variables available for `${VAR}` expansions.
