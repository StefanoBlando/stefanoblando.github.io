import { getCollection } from 'astro:content';

/**
 * The right collection for a language.
 *
 * The Italian entries are separate collections rather than a `lang` field on
 * one, because Astro's glob loader keys a collection to a file pattern and
 * `index.it.md` is a different pattern. Everything above this line asks for
 * "projects in Italian" and never has to know that.
 */
const NAMES = {
  projects: { en: 'projects', it: 'projectsIt' },
  publications: { en: 'publications', it: 'publicationsIt' },
  blog: { en: 'blog', it: 'blogIt' },
};

export function collectionFor(kind, lang) {
  return getCollection(NAMES[kind][lang]);
}

/**
 * Every language a given entry exists in, as `{ lang, href }`.
 *
 * Used for `hreflang` and for the language switch: a page only offers the
 * other language when the other language actually has that entry, so the
 * switch never lands on a 404.
 */
export async function translationsOf(kind, id, pathFor) {
  const found = [];
  for (const lang of Object.keys(NAMES[kind])) {
    const entries = await collectionFor(kind, lang);
    if (entries.some((entry) => entry.id === id)) found.push({ lang, href: pathFor(lang) });
  }
  return found;
}
