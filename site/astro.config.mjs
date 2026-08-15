import { defineConfig } from 'astro/config';

/**
 * Dev-only diagnostic sink.
 *
 * Browser-side failures are invisible from the terminal, so the page posts its
 * errors here and they surface in the dev server output. Remove once the
 * prototype is stable.
 */
function diagnosticsSink() {
  return {
    name: 'universe-diagnostics',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__diag', (req, res) => {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', () => {
          console.log(`\n===== BROWSER DIAG =====\n${body}\n========================\n`);
          res.statusCode = 204;
          res.end();
        });
      });
    },
  };
}

export default defineConfig({
  output: 'static',
  devToolbar: { enabled: false },
  build: { inlineStylesheets: 'auto' },
  vite: { plugins: [diagnosticsSink()] },
});
