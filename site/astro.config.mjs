import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

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
  /*
   * Where the site will be served from. Every absolute URL the build emits —
   * canonical, Open Graph, sitemap, RSS — is resolved against this, so a wrong
   * value here is a wrong value in the metadata of all 37 pages.
   *
   * The default is where the site lives today. Netlify builds Hugo with `-b
   * $URL`; the same override works here through SITE_URL, so a deploy preview
   * does not advertise the production URL as its canonical.
   */
  site: process.env.SITE_URL ?? 'https://stefano-blando.github.io',
  output: 'static',
  devToolbar: { enabled: false },
  build: { inlineStylesheets: 'auto' },
  integrations: [sitemap()],
  vite: { plugins: [diagnosticsSink()] },
});
