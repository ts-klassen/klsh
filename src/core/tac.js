// 'tac' command: reverse lines of stdin
async function main({ args = [], stdin = '', env = {} }) {
  const hasTrailingNewline = stdin.endsWith('\n');
  const lines = stdin.split('\n');
  let contentLines = lines;
  if (hasTrailingNewline && lines.length > 0 && lines[lines.length - 1] === '') {
    contentLines = lines.slice(0, -1);
  }
  const reversed = contentLines.slice().reverse();
  let stdout = reversed.join('\n');
  if (hasTrailingNewline) {
    stdout += '\n';
  }
  const stderr = '';
  const newEnv = Object.assign({}, env, { '?': 0 });
  return { stdout, stderr, env: newEnv };
}

module.exports = { main };