import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import fs from 'node:fs';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Compute absolute paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const klshAbsolute = resolve(__dirname, '../dist/klsh.js');

export default defineConfig({
  root: __dirname,

  plugins: [react()],

  // Allow imports that reach one directory up (../dist/klsh.js)
  server: {
    fs: {
      allow: ['..'],
    },
  },

  /**
   * Dev-server middleware: respond to /dist/klsh.js with the pre-built bundle
   * that lives outside the web root.  This prevents 404s while keeping the
   * relative <script src="../dist/klsh.js"> in index.html working for both
   * development and the static production build.
   */
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/dist/klsh.js') {
        res.setHeader('Content-Type', 'application/javascript');
        fs.createReadStream(klshAbsolute).pipe(res);
        return; // do NOT call next()
      }
      next();
    });
  },

  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
});
