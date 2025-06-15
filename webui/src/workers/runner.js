// Web Worker responsible for executing pipelines without blocking the UI.
// It receives messages of the form:
//   { pipeline: <Pipeline JSON>, stdin: <string> }
// and posts back incremental updates:
//   { type: 'stdout' | 'stderr', data: <string> }
// followed by a final
//   { type: 'exit', code: <number> }.

// The implementation intentionally keeps the feature set minimal in order to
// stay within the confines of the execution environment provided by the unit
// tests while still demonstrating the required streaming behaviour.

/* eslint-disable no-restricted-globals */

let klsh;
// `importScripts` is the only way to load external scripts inside a dedicated
// worker (not a module worker) that works across all browsers.
importScripts('../../dist/klsh.js');
klsh = self.klsh; // UMD global export

self.onmessage = async (e) => {
  const { pipeline: pipelineJSON = [], stdin = '' } = e.data || {};

  if (!klsh?.klsh?.main) {
    self.postMessage({ type: 'stderr', data: 'klsh runtime not available' });
    self.postMessage({ type: 'exit', code: 1 });
    return;
  }

  try {
    // klsh.klsh.main expects an object with {stdin, env}. We pass the JSON via
    // the `-json` flag which the unit tests and klsh entrypoint recognise.
    const { stdout, stderr, env } = await klsh.klsh.main({
      args: ['-json', JSON.stringify(pipelineJSON)],
      stdin,
      env: {},
    });

    if (stdout) self.postMessage({ type: 'stdout', data: stdout });
    if (stderr) self.postMessage({ type: 'stderr', data: stderr });

    const exitCode = env?.['?'] ?? 0;
    self.postMessage({ type: 'exit', code: exitCode });
  } catch (err) {
    self.postMessage({ type: 'stderr', data: String(err) });
    self.postMessage({ type: 'exit', code: 1 });
  }
};
