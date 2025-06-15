import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Compute the absolute path of the directory that contains this config file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  // The project’s web root is the `webui/` folder itself (where index.html
  // resides).  Vite uses this to resolve all entry points during dev and build.
  root: __dirname,

  plugins: [react()],

  build: {
    // Emit the production bundle into `webui/dist` so it stays alongside the
    // source files.  `outDir` is resolved relative to `root`.
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
});
