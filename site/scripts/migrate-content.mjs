/**
 * Copies the Hugo content tree into src/content/, normalising Hugo Blox
 * frontmatter into the shape the new site wants.
 *
 * A script rather than sixty hand edits: the transform is reproducible, and a
 * wrong rule is fixed by editing the rule and re-running rather than by
 * editing every file a second time.
 *
 * Nothing is lost by omission. Keys the script does not recognise are carried
 * through untouched; the only keys removed are removed by an explicit rule and
 * reported on stdout. Read that report — it is the check that the rules were
 * right, and it is cheaper than reading sixty files.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load as parseYaml, dump as dumpYaml } from 'js-yaml';

const here = dirname(fileURLToPath(import.meta.url));
const FROM = join(here, '../../content');
const TO = join(here, '../src/content');

const COLLECTIONS = ['publications', 'projects', 'blog', 'events'];

/** The Hugo author-file reference. It means nothing outside Hugo. */
const ME = 'Stefano Blando';

/** url_* fields, and the name each becomes once folded into links[]. */
const URL_FIELDS = {
  url_pdf: 'PDF',
  url_code: 'Code',
  url_dataset: 'Dataset',
  url_slides: 'Slides',
  url_poster: 'Poster',
  url_video: 'Video',
  url_source: 'Source',
  url_project: 'Project',
};

const RENAMES = {
  publication: 'venue',
  publication_short: 'venue_short',
};

const isEmpty = (v) =>
  v === '' || v === null || v === undefined || (Array.isArray(v) && v.length === 0);

const report = {
  repaired: [],
  dropped: [],
  folded: [],
  renamed: [],
  unprefixed: [],
  derefed: [],
  deduped: [],
};

/**
 * Hugo serves the two languages under /en/ and /it/. The new site does not,
 * so a URL carrying the prefix would 404 on the very page it points at.
 */
function unprefix(url, label) {
  if (typeof url !== 'string') return url;
  const out = url.replace(/^\/(en|it)\//, '/');
  if (out !== url) report.unprefixed.push(`${label}: ${url} -> ${out}`);
  return out;
}

/**
 * `{{< relref "/blog/x/index.md" >}}` is a Hugo shortcode. Astro has no such
 * thing and would render it as literal text in the middle of a sentence.
 */
function deref(body, label) {
  return body.replace(/\{\{<\s*relref\s+"([^"]+)"\s*>\}\}/g, (_, target) => {
    const href = target.replace(/\/index(\.[a-z]{2})?\.md$/, '/');
    report.derefed.push(`${label}: ${target} -> ${href}`);
    return href;
  });
}

/**
 * Folding url_* into links[] can restate a link the author already wrote by
 * hand. First occurrence wins: the hand-written name is better than the
 * generated one.
 */
function dedupe(links, label) {
  const seen = new Set();
  return links.filter((link) => {
    if (seen.has(link.url)) {
      report.deduped.push(`${label}: ${link.url}`);
      return false;
    }
    seen.add(link.url);
    return true;
  });
}

function splitFrontmatter(raw, label) {
  // projects/real-estate-ai-agent opens with a blank line before its `---`,
  // which no standard parser accepts. Repair it rather than carry it forward.
  const text = raw.replace(/^\s*\n(?=---)/, '');
  if (text !== raw) report.repaired.push(label);

  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`no frontmatter in ${label}`);
  return { data: parseYaml(match[1]) ?? {}, body: match[2] };
}

function normalise(data, label) {
  const out = {};
  const links = Array.isArray(data.links)
    ? data.links.map((l) => ({ ...l, url: unprefix(l.url, label) }))
    : [];

  for (const [key, value] of Object.entries(data)) {
    if (key === 'links') continue;

    if (isEmpty(value)) {
      report.dropped.push(`${label}: ${key}`);
      continue;
    }

    if (key in URL_FIELDS) {
      links.push({ name: URL_FIELDS[key], url: unprefix(value, label) });
      report.folded.push(`${label}: ${key} -> links[]`);
      continue;
    }

    if (key === 'publication_types') {
      const types = Array.isArray(value) ? value : [value];
      if (types.length !== 1) {
        throw new Error(`${label}: expected one publication_type, got ${types.length}`);
      }
      out.type = types[0];
      report.renamed.push(`${label}: publication_types -> type`);
      continue;
    }

    if (key === 'authors') {
      out.authors = value.map((a) => (a === 'me' ? ME : a));
      continue;
    }

    if (key in RENAMES) {
      out[RENAMES[key]] = value;
      report.renamed.push(`${label}: ${key} -> ${RENAMES[key]}`);
      continue;
    }

    out[key] = value;
  }

  if (links.length > 0) out.links = dedupe(links, label);
  return out;
}

/** Body rewrites: Hugo shortcodes and language-prefixed markdown links. */
function normaliseBody(body, label) {
  return deref(body, label).replace(/\]\(\/(en|it)\//g, (match) => {
    report.unprefixed.push(`${label}: body ${match} -> ](/`);
    return '](/';
  });
}

rmSync(TO, { recursive: true, force: true });

let files = 0;
let assets = 0;
for (const collection of COLLECTIONS) {
  const entries = readdirSync(join(FROM, collection), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  for (const slug of entries) {
    const src = join(FROM, collection, slug);
    const dst = join(TO, collection, slug);
    mkdirSync(dst, { recursive: true });

    for (const file of readdirSync(src)) {
      if (!file.endsWith('.md')) {
        copyFileSync(join(src, file), join(dst, file));
        assets += 1;
        continue;
      }
      const label = `${collection}/${slug}/${file}`;
      const { data, body } = splitFrontmatter(readFileSync(join(src, file), 'utf8'), label);
      const front = dumpYaml(normalise(data, label), { lineWidth: 100, noRefs: true });
      writeFileSync(join(dst, file), `---\n${front}---\n${normaliseBody(body, label)}`);
      files += 1;
    }
  }
}

for (const [kind, items] of Object.entries(report)) {
  if (items.length === 0) continue;
  console.log(`\n${kind} (${items.length}):`);
  for (const item of items) console.log(`  ${item}`);
}
console.log(`\n${files} markdown files and ${assets} assets migrated into src/content/`);
