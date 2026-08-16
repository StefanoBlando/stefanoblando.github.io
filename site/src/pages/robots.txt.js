/**
 * Generated rather than kept in `public/` so the sitemap it advertises is the
 * one this build actually published, at whatever origin it was built for.
 */
export function GET({ site }) {
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${new URL('sitemap-index.xml', site)}`,
    '',
  ].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
