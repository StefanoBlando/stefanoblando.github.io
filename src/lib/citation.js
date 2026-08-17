/**
 * BibTeX for a publication.
 *
 * Four of the six publications ship a hand-written `cite.bib` in their bundle
 * and nothing on the site ever offered it. Those are used verbatim — they are
 * the author's own record of how the work should be cited, and regenerating
 * them from frontmatter would quietly overrule it.
 *
 * The two that live on arXiv have no `.bib`, so an entry is built from what
 * the frontmatter already states. Nothing is invented: every field below is a
 * field that exists on the entry.
 */

/** Words too small to identify a paper by. */
const STOPWORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'by', 'for', 'from', 'in', 'of', 'on', 'or',
  'the', 'to', 'with', 'towards', 'toward',
]);

/**
 * The arXiv identifier, wherever the entry happens to carry it — it appears
 * as `arXiv:2607.17948` in a venue on one publication and as a link on
 * another. Two steps rather than one pattern: establish that arXiv is
 * mentioned at all, then take the identifier. A single expression had to
 * absorb every way a URL can sit between the word and the number, and missed.
 */
export function arxivId(data) {
  const haystack = [data.venue ?? '', ...(data.links ?? []).map((link) => link.url ?? '')].join(' ');
  if (!/arxiv/i.test(haystack)) return null;
  const match = haystack.match(/(\d{4}\.\d{4,5}(?:v\d+)?)/);
  return match ? match[1] : null;
}

/** `blando2026agentic` — surname, year, and the first word that means anything. */
export function citeKey(data) {
  const surname = (data.authors?.[0] ?? 'anon').trim().split(/\s+/).pop().toLowerCase();
  const year = data.date.getFullYear();
  const word =
    data.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .find((w) => w.length > 2 && !STOPWORDS.has(w)) ?? 'untitled';

  return `${surname.replace(/[^a-z]/g, '')}${year}${word}`;
}

/** "Blando, Stefano and Fagiolo, Giorgio" — BibTeX's own name order. */
function bibAuthors(authors = []) {
  return authors
    .map((name) => {
      const parts = name.trim().split(/\s+/);
      if (parts.length < 2) return name.trim();
      const surname = parts.pop();
      return `${surname}, ${parts.join(' ')}`;
    })
    .join(' and ');
}

/**
 * An entry for a preprint. `@misc` with `eprint` is the form arXiv itself
 * recommends, and the one that resolves in every reference manager.
 */
export function generateBibtex(data) {
  const id = arxivId(data);
  const fields = [
    ['title', data.title],
    ['author', bibAuthors(data.authors)],
    ['year', String(data.date.getFullYear())],
  ];

  if (id) {
    fields.push(['eprint', id], ['archivePrefix', 'arXiv'], ['primaryClass', 'econ.GN']);
  }
  if (data.venue) fields.push(['note', data.venue]);

  const body = fields.map(([key, value]) => `  ${key} = {${value}}`).join(',\n');
  return `@misc{${citeKey(data)},\n${body}\n}`;
}

/**
 * The citation to show: the bundled file when there is one, a generated entry
 * when the work is on arXiv, and nothing at all otherwise — an entry for a
 * paper that is neither published nor preprinted would be a citation to
 * something a reader cannot reach.
 */
export function citationFor(data, bundled) {
  if (bundled) return { bibtex: bundled.trim(), source: 'file' };
  if (arxivId(data)) return { bibtex: generateBibtex(data), source: 'generated' };
  return null;
}
