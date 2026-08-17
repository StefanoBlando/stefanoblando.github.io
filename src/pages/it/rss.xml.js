import { feed } from '../rss.xml.js';

/** The Italian news feed, over the Italian posts. */
export const GET = (context) =>
  feed(context, {
    collection: 'blogIt',
    lang: 'it',
    title: 'Stefano Blando — Notizie',
    description:
      'Interventi, articoli, premi e workshop da un dottorato in IA alla Scuola Superiore Sant’Anna.',
    path: '/it/blog/',
  });
