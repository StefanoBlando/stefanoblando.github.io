import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

/**
 * The news feed. The Hugo site published one at `index.xml` and this replaced
 * it with nothing, which quietly unsubscribes anyone already following.
 *
 * English at `/rss.xml`, Italian at `/it/rss.xml` — see `it/rss.xml.js`.
 */
export async function feed(context, { collection, lang, title, description, path }) {
  const posts = (await getCollection(collection)).sort((a, b) => b.data.date - a.data.date);

  return rss({
    title,
    description,
    site: context.site,
    trailingSlash: true,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.summary,
      pubDate: post.data.date,
      link: `${path}${post.id}/`,
      categories: post.data.tags,
    })),
    customData: `<language>${lang === 'it' ? 'it-IT' : 'en-gb'}</language>`,
  });
}

export const GET = (context) =>
  feed(context, {
    collection: 'blog',
    lang: 'en',
    title: 'Stefano Blando — News',
    description:
      'Talks, papers, awards and workshops from a PhD in AI at Scuola Superiore Sant’Anna.',
    path: '/blog/',
  });
