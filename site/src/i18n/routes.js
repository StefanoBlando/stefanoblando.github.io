import { LANGS, DEFAULT_LANG, localise } from './ui.js';

/**
 * Both languages of a route, for `getStaticPaths`.
 *
 * The site lives under `src/pages/[...locale]/`, so one page file serves both
 * languages: the default language passes `locale: undefined`, which Astro
 * renders at the path with no prefix, and Italian passes `locale: 'it'`.
 * Without this the whole tree would have to exist twice.
 */
export function localePaths(extra = () => [{}]) {
  return LANGS.flatMap((lang) =>
    extra(lang).map((entry) => ({
      params: { locale: lang === DEFAULT_LANG ? undefined : lang, ...(entry.params ?? {}) },
      props: { lang, ...(entry.props ?? {}) },
    })),
  );
}

/** The `alternates` a page hands to the layout, for `hreflang`. */
export function alternatesFor(path) {
  return LANGS.map((lang) => ({ lang, href: localise(path, lang) }));
}
