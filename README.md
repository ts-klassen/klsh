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
  // `klsn.echo` is now available globally
  const result = klsn.echo({ args: ['hello'], stdin: '', env: {} });
  console.log(result.stdout);
</script>
```
