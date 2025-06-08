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

## Running the CLI with `npm start`

The `npm start` script builds the project and launches the `klsh` command-line interface. If you have [`rlwrap`](https://github.com/hanshuebner/rlwrap) installed, it will provide readline support (editing and history).

Interactive mode:

```bash
$ npm start
```

Type one or more `klsh` pipeline commands, then press Ctrl-D (EOF) to execute them. Example:

```bash
$ npm start
echo hello world
^D
{ stdout: 'hello world\n', stderr: '', exitCode: 0 }
```

Non-interactive mode (pipe a single command):

```bash
echo 'echo hello world' | npm start
```

Or read commands from a file:

```bash
npm start < commands.txt
```

The CLI outputs a JSON object with the following properties:

- `stdout`: the combined standard output of the pipeline
- `stderr`: the combined standard error of the pipeline
- `exitCode`: the exit code of the pipeline

## Environment Variables

When invoking `main`, you can pass an `env` object to control behavior:

- `KLSH_VERBOSE_ERROR` (any value):
  if present in `env`, full error details (including `String(err)`) will be appended to stderr

All other `env` properties behave like shell variables available for `${VAR}` expansions.
