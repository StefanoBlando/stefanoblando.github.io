# Homepage Sections and Index Pages Implementation Plan

> **Superseded.** The homepage design in this document was replaced on 2026-08-16.
> See `docs/superpowers/specs/2026-08-16-what-was-built.md` for the site as it
> stands. Kept for the decisions and measurements it records.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Astro homepage on the eleven-band structure of the Hugo landing page, add the five missing index pages, and replace the binary shape switch with a scroll-driven blend.

**Architecture:** Astro content collections read the existing Hugo Markdown tree in place through `glob()` loaders, so Hugo keeps building in parallel. The engine gains a `setBlend(from, to, t)` that interpolates between two precomputed layouts, driven by a plateau curve computed in the already-pure `sections.js`. Index pages ship no 3D JavaScript and get a CSS-only backdrop.

**Tech Stack:** Astro 5.14 (static output), Three.js 0.181, Zod schemas via `astro:content`, scoped `d3-*` packages, `node --test`.

**Spec:** `docs/superpowers/specs/2026-08-15-homepage-sections-and-index-pages-design.md`

**Two stages.** Stage A (Tasks 1–8, including 4b) ends with a complete, working homepage. Stage B (Tasks 9–13) adds the index pages and the seven-item nav. Stage A is shippable on its own.

**Amended 2026-08-15, mid-execution.** Tasks 1 and 2 ran as written. The content pipeline was then changed at the user's direction: the Hugo tree is copied into `site/src/content/` and normalised rather than read in place, and Hugo is set aside. Tasks 3 and 4 were rewritten and Task 4b added; Tasks 5–13 are unaffected. See spec §7.

---

## File Structure

**Created:**

| Path | Responsibility |
|---|---|
| `site/src/content.config.ts` | Collection definitions and Zod schemas for publications, projects, blog |
| `site/src/data/people.js` | The 15 co-authors, lifted out of the Hugo template; also the source of the `path` band counts |
| `site/src/layouts/Base.astro` | `<html>`/`<head>`/masthead shell shared by every page |
| `site/src/components/Masthead.astro` | The seven-item nav |
| `site/src/styles/static-backdrop.css` | CSS-only gradient and grain for pages with no engine |
| `site/src/pages/projects/index.astro` | 13 projects |
| `site/src/pages/publications/index.astro` | 6 publications |
| `site/src/pages/blog/index.astro` | 8 posts |
| `site/src/pages/experience/index.astro` | Education and experience from `me.yaml` |
| `site/src/pages/network/index.astro` | The co-author D3 visualization |
| `site/src/components/CoauthorNetwork.astro` | Markup, CSS and D3 for the graph |
| `site/tests/blend.test.mjs` | The plateau curve |
| `site/tests/shapes.test.mjs` | Every `data-shape` resolves to a layout and a tint |

**Modified:**

| Path | Change |
|---|---|
| `content/publications/*/index.md` | Add `pillar:`; one directory renamed |
| `site/scripts/build-universe.mjs` | Drop the hardcoded publication→pillar map; read `pillar:`; emit `experience` |
| `site/src/engine/sections.js` | Add `pickActiveBlend`; keep `pickActiveShape` for `weight` |
| `site/src/engine/swarm.js` | `setShape` → `setBlend`; morph damping rate |
| `site/src/engine/structure.js` | Three new layout generators |
| `site/src/engine/palette.js` | Three new tints on `tonal-night` |
| `site/src/engine/index.js` | Blend wiring, tint interpolation, breath fix |
| `site/src/pages/index.astro` | Eleven bands |
| `site/src/styles/scene.css` | Per-band heights, hero, cards, timeline |
| `site/package.json` | `d3-*` dependencies |

---

# Stage A — Content collections, engine pacing, homepage

## Task 1: Rename the publication directory with spaces

`content/publications/network crash prediction/` breaks any loader that turns a directory name into an id. Hugo tolerated it; a collection will not.

**Files:**
- Rename: `content/publications/network crash prediction/` → `content/publications/network-crash-prediction/`

- [ ] **Step 1: Confirm the current public URL before touching anything**

```bash
cd /home/stefano/Scrivania/WEBSITE
grep -rn "network.crash.prediction" --include="*.md" --include="*.mjs" --include="*.yaml" . \
  | grep -v node_modules | grep -v "^./public/"
```

Expected: references in `site/scripts/build-universe.mjs` (the hardcoded pillar map) and possibly cross-links in other content files. Note every hit — each one has to keep working.

- [ ] **Step 2: Rename with git so history follows**

```bash
cd /home/stefano/Scrivania/WEBSITE
git mv "content/publications/network crash prediction" content/publications/network-crash-prediction
```

- [ ] **Step 3: Update the reference in the universe build**

In `site/scripts/build-universe.mjs`, the `PUBLICATION_PILLARS` map keys on directory names. Change the key `'network crash prediction'` to `'network-crash-prediction'`. (This map is deleted entirely in Task 3; it is fixed here so the build stays green in between.)

- [ ] **Step 4: Verify the universe still builds with all six publications**

```bash
cd /home/stefano/Scrivania/WEBSITE/site && npm run universe
```

Expected: no `! publication "..." not found` warnings. The script warns rather than throwing, so a silent slug break would otherwise pass unnoticed.

- [ ] **Step 5: Verify the derived href is unchanged**

```bash
cd /home/stefano/Scrivania/WEBSITE/site
node -e "const u=require('./src/data/universe.json'); console.log(u.nodes.filter(n=>n.id.includes('crash')).map(n=>n.href))"
```

Expected: `[ '/publications/network-crash-prediction/' ]` — identical to the URL the Hugo site serves today.

- [ ] **Step 6: Commit**

```bash
cd /home/stefano/Scrivania/WEBSITE
git add -A content/publications site/scripts/build-universe.mjs site/src/data/universe.json
git commit -m "refactor(content): slugify the network crash prediction directory

Spaces in a directory name survive Hugo but become the entry id under an
Astro collection loader. The public URL is unchanged."
```

---

## Task 2: Add the `pillar` field to publications

**Files:**
- Modify: `content/publications/*/index.md` (6 files)

The mapping currently lives in code (`site/scripts/build-universe.mjs:27`) with the comment *"Curated, pending the `pillar:` frontmatter field."* Read that map and move it into the content.

- [ ] **Step 1: Read the existing mapping**

```bash
cd /home/stefano/Scrivania/WEBSITE && sed -n '25,36p' site/scripts/build-universe.mjs
```

Write down each `directory → pillar-slug` pair. Use exactly these values; do not re-derive them.

- [ ] **Step 2: Add `pillar:` to each publication's frontmatter**

For each of the six directories, add a single line to the frontmatter, immediately after `featured:`. Example for `content/publications/island-model-smc/index.md`:

```yaml
featured: true

pillar: statistical-verification
```

The valid slugs are the four cluster ids in `site/src/data/universe.json` (`clusters[].id`). Verify:

```bash
cd /home/stefano/Scrivania/WEBSITE/site
node -e "console.log(require('./src/data/universe.json').clusters.map(c=>c.id))"
```

- [ ] **Step 3: Verify all six carry the field and every value is a real cluster**

```bash
cd /home/stefano/Scrivania/WEBSITE
grep -c "^pillar:" content/publications/*/index.md
grep -h "^pillar:" content/publications/*/index.md | sort -u
```

Expected: six files each reporting `1`, and only cluster ids in the second list.

- [ ] **Step 4: Commit**

```bash
git add content/publications
git commit -m "feat(content): declare the research pillar on each publication

Moves the curated publication-to-pillar map out of build-universe.mjs and
into the content it describes."
```

---

## Task 3: Migrate the content into the Astro repo

The Hugo tree is copied into `site/src/content/` and normalised on the way, by a script so the transform is reproducible and a mistake is fixed by editing a rule rather than by re-editing 62 files.

**Files:**
- Create: `site/scripts/migrate-content.mjs`
- Create: `site/src/content/{publications,projects,blog,events}/<slug>/index.md` (+ `index.it.md`, + co-located assets)
- Create: `site/src/data/pillars.yaml`

- [ ] **Step 1: Write the migration script**

`site/scripts/migrate-content.mjs`:

```js
/**
 * Copies the Hugo content tree into src/content/, normalising Hugo Blox
 * frontmatter into the shape the new site wants.
 *
 * A script rather than 62 hand edits: the transform is reproducible, and a
 * wrong rule is fixed by editing the rule and re-running rather than by
 * editing every file again.
 *
 * Nothing is lost by omission. Keys the script does not recognise are carried
 * through untouched; the only keys removed are removed by an explicit rule and
 * reported on stdout.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const here = dirname(fileURLToPath(import.meta.url));
const FROM = join(here, '../../content');
const TO = join(here, '../src/content');

const COLLECTIONS = ['publications', 'projects', 'blog', 'events'];

/** The Hugo author-file reference. It means nothing outside Hugo. */
const ME = 'Stefano Blando';

/** url_* fields, and the name each becomes when folded into links[]. */
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

const report = { dropped: [], folded: [], renamed: [], repaired: [] };

function splitFrontmatter(raw, label) {
  // real-estate-ai-agent opens with a blank line before its `---`, which no
  // standard parser accepts. Repair it here rather than carrying it forward.
  const text = raw.replace(/^\s*\n/, '');
  if (text !== raw) report.repaired.push(label);

  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`no frontmatter in ${label}`);
  return { data: yaml.load(match[1]) ?? {}, body: match[2] };
}

function normalise(data, label) {
  const out = {};
  const links = Array.isArray(data.links) ? [...data.links] : [];

  for (const [key, value] of Object.entries(data)) {
    if (key === 'links') continue;

    if (isEmpty(value)) {
      report.dropped.push(`${label}: ${key}`);
      continue;
    }

    if (key in URL_FIELDS) {
      links.push({ name: URL_FIELDS[key], url: value });
      report.folded.push(`${label}: ${key} -> links[]`);
      continue;
    }

    if (key === 'publication_types') {
      const types = Array.isArray(value) ? value : [value];
      if (types.length !== 1) throw new Error(`${label}: expected one publication_type, got ${types.length}`);
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

  if (links.length > 0) out.links = links;
  return out;
}

rmSync(TO, { recursive: true, force: true });

let files = 0;
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
        continue;
      }
      const label = `${collection}/${slug}/${file}`;
      const { data, body } = splitFrontmatter(readFileSync(join(src, file), 'utf8'), label);
      const front = yaml.dump(normalise(data, label), { lineWidth: 100, noRefs: true });
      writeFileSync(join(dst, file), `---\n${front}---\n${body}`);
      files += 1;
    }
  }
}

for (const [kind, items] of Object.entries(report)) {
  if (items.length === 0) continue;
  console.log(`\n${kind} (${items.length}):`);
  for (const item of items) console.log(`  ${item}`);
}
console.log(`\n${files} markdown files migrated into src/content/`);
```

- [ ] **Step 2: Add js-yaml as a real dependency**

It is currently present only transitively.

```bash
cd /home/stefano/Scrivania/WEBSITE/site && npm install --save-dev js-yaml
```

- [ ] **Step 3: Run the migration and read the report**

```bash
cd /home/stefano/Scrivania/WEBSITE/site && node scripts/migrate-content.mjs
```

Expected: 56 markdown files (28 English + 28 Italian); `repaired` lists `projects/real-estate-ai-agent/index.md`; `dropped` lists only the always-empty fields measured in the spec §7 — `doi`, `url_pdf`, `url_dataset`, `url_poster`, `url_slides`, `url_source`, `url_video`. **Read the dropped list.** Anything on it that is not an empty Hugo Blox placeholder is a bug in a rule, not an acceptable loss.

- [ ] **Step 4: Verify nothing was lost**

```bash
cd /home/stefano/Scrivania/WEBSITE
echo "source:"; find content -name "*.md" ! -name "_index*" | wc -l
echo "copy:  "; find site/src/content -name "*.md" | wc -l
echo "assets source:"; find content -type f ! -name "*.md" | wc -l
echo "assets copy:  "; find site/src/content -type f ! -name "*.md" | wc -l
```

Expected: the two markdown counts match, and the two asset counts match at 25.

- [ ] **Step 5: Read one migrated file end to end**

```bash
cd /home/stefano/Scrivania/WEBSITE && sed -n '1,40p' site/src/content/publications/island-model-smc/index.md
```

Expected: `venue`, `venue_short`, `type`, `authors` with `Stefano Blando` in place of `me`, `links` carrying the `Code` entry folded from `url_code`, and no empty fields. Compare against the original by eye — this is the one file read in full, and it is what catches a rule that is subtly wrong.

- [ ] **Step 6: Extract the pillars**

`site/src/data/pillars.yaml`, holding the four pillars from the `research-pillars` block of `content/_index.md`: `id`, `title`, `description`, `detailed_text`, `topics`, `projects`. Copy the text verbatim — this is a transcription, not a rewrite.

```bash
cd /home/stefano/Scrivania/WEBSITE && sed -n '27,65p' content/_index.md
```

Verify the result parses and carries everything:

```bash
cd /home/stefano/Scrivania/WEBSITE/site
node -e "
const y=require('js-yaml'), fs=require('fs');
const p=y.load(fs.readFileSync('src/data/pillars.yaml','utf8'));
console.log(p.length, 'pillars');
for (const x of p) console.log(' ', x.id, '| topics', x.topics.length, '| projects', x.projects.length, '| detail', x.detailed_text.length, 'chars');
"
```

Expected: 4 pillars, each with topics, projects and several hundred characters of `detailed_text`.

- [ ] **Step 7: Commit**

```bash
cd /home/stefano/Scrivania/WEBSITE
git add site/scripts/migrate-content.mjs site/src/content site/src/data/pillars.yaml site/package.json site/package-lock.json
git commit -m "feat(content): copy the Hugo tree into the Astro repo, normalised

A script rather than 62 hand edits, so the transform is reproducible and a
wrong rule is fixed by re-running. url_* fields fold into links[], Hugo Blox
names give way to plain ones, empty placeholders are dropped by measurement,
and anything unrecognised is carried through untouched. Also repairs the
leading blank line that left real-estate-ai-agent without frontmatter.

From here the Hugo tree is legacy."
```

---

## Task 4: Collections over the migrated content

**Files:**
- Create: `site/src/content.config.ts`

- [ ] **Step 1: Write the collection config**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * The content now lives here. Page bundles rather than flat files because 25
 * assets are co-located with their entries.
 *
 * `generateId` matters: without it the id of `island-model-smc/index.md` keeps
 * its `/index` suffix and every generated href gains a path segment that does
 * not exist.
 */
const bundleId = ({ entry }) => entry.replace(/\/index\.md$/, '');

const link = z.object({
  name: z.string().optional(),
  url: z.string(),
  icon: z.string().optional(),
});

const publications = defineCollection({
  loader: glob({ base: './src/content/publications', pattern: '*/index.md', generateId: bundleId }),
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()),
    date: z.coerce.date(),
    publishDate: z.coerce.date().optional(),
    type: z.string(),
    venue: z.string(),
    venue_short: z.string().optional(),
    abstract: z.string(),
    summary: z.string(),
    tags: z.array(z.string()),
    featured: z.boolean().default(false),
    pillar: z.enum(['multi-agent', 'statistical-verification', 'robust-quant', 'text-analytics']),
    projects: z.array(z.string()).optional(),
    links: z.array(link).default([]),
    image: z.record(z.any()).optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '*/index.md', generateId: bundleId }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()),
    links: z.array(link).default([]),
    image: z.record(z.any()).optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '*/index.md', generateId: bundleId }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    authors: z.array(z.string()),
    tags: z.array(z.string()),
    image: z.record(z.any()).optional(),
  }),
});

export const collections = { publications, projects, blog };
```

The schemas are strict on purpose: `type`, `venue`, `abstract` and `pillar` are required, and `pillar` is an enum rather than a string, so a typo fails the build instead of producing an empty cluster.

- [ ] **Step 2: Prove the collections load**

Create `site/src/pages/__collections-smoke.astro`:

```astro
---
import { getCollection } from 'astro:content';

const publications = await getCollection('publications');
const projects = await getCollection('projects');
const blog = await getCollection('blog');
---
<pre>{JSON.stringify({
  publications: publications.length,
  projects: projects.length,
  blog: blog.length,
  ids: projects.map((p) => p.id).slice(0, 3),
  featured: publications.filter((p) => p.data.featured).map((p) => p.id),
}, null, 2)}</pre>
```

- [ ] **Step 3: Build and read the counts**

```bash
cd /home/stefano/Scrivania/WEBSITE/site && npm run build && cat dist/__collections-smoke/index.html
```

Expected: `publications: 6`, `projects: 13`, `blog: 7`, four featured ids, and `ids` showing bare slugs with no `/index` suffix. A Zod failure names the file and field — fix the schema or the migration rule, whichever is actually wrong, and re-run Task 3 if it is the rule.

- [ ] **Step 4: Delete the smoke page**

```bash
cd /home/stefano/Scrivania/WEBSITE/site && rm src/pages/__collections-smoke.astro
```

- [ ] **Step 5: Commit**

```bash
cd /home/stefano/Scrivania/WEBSITE
git add site/src/content.config.ts
git commit -m "feat(site): typed collections over the migrated content

Strict schemas: pillar is an enum, so a typo fails the build rather than
emptying a cluster."
```

---

## Task 4b: Repoint build-universe at the migrated content

Two sources of truth is the failure mode this task exists to prevent: if the pages read the Astro copy while the universe reads the Hugo tree, they diverge at the first edit.

**Files:**
- Modify: `site/scripts/build-universe.mjs`

- [ ] **Step 1: Read what the script does today**

```bash
cd /home/stefano/Scrivania/WEBSITE/site && sed -n '1,40p' scripts/build-universe.mjs && sed -n '96,150p' scripts/build-universe.mjs
```

Note `CONTENT`, `AUTHOR`, `readPillars()`, `readItem()` and `PUBLICATION_PILLARS`.

- [ ] **Step 2: Point `CONTENT` at the migrated tree and parse frontmatter properly**

The hand-rolled `frontmatter`/`scalar`/`list` helpers exist because the script had no parser. It now has one:

```js
import yaml from 'js-yaml';

const CONTENT = join(here, '../src/content');

function readItem(section, dir) {
  const file = join(CONTENT, section, dir, 'index.md');
  if (!existsSync(file)) return null;
  const raw = readFileSync(file, 'utf8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error(`no frontmatter in ${section}/${dir}`);
  const fm = yaml.load(match[1]);
  return {
    title: fm.title,
    summary: fm.summary ?? fm.abstract,
    tags: fm.tags ?? [],
    pillar: fm.pillar,
  };
}
```

Delete the `frontmatter`, `scalar` and `list` helpers once nothing calls them.

- [ ] **Step 3: Replace `readPillars()` with a read of `pillars.yaml`**

```js
const PILLARS = join(here, '../src/data/pillars.yaml');

/** The four research pillars. Data, not a landing page parsed with regexes. */
function readPillars() {
  return yaml.load(readFileSync(PILLARS, 'utf8'));
}
```

Delete `PILLAR_SLUGS` if the yaml already carries `id` on each pillar, and delete the old regex body entirely.

- [ ] **Step 4: Replace the hardcoded pillar map with a frontmatter scan**

Delete `PUBLICATION_PILLARS`. Replace the loop that iterates it with:

```js
const publicationDirs = readdirSync(join(CONTENT, 'publications'), { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

for (const dir of publicationDirs) {
  const item = readItem('publications', dir);
  if (!item) throw new Error(`publication "${dir}" could not be read`);
  if (!CLUSTER_ORDER.includes(item.pillar)) {
    throw new Error(`publication "${dir}" has unknown pillar "${item.pillar}"`);
  }
  nodes.push({
    id: `publication/${dir}`,
    cluster: item.pillar,
    kind: 'publication',
    title: item.title,
    summary: item.summary,
    tags: item.tags,
    href: `/publications/${dir}/`,
  });
}
```

`slugify()` is no longer needed: the migrated directory names are already slugs. Delete it once nothing calls it.

- [ ] **Step 5: Carry `detailed_text` onto the clusters**

In the `CLUSTER_ORDER.map(...)` block where `title`, `description` and `topics` are copied from the pillar, add `detailed_text: pillar.detailed_text`.

- [ ] **Step 6: Add the experience reader**

`data/authors/me.yaml` stays where it is — it is author data, not page content, and nothing else reads it. Add beside `readEducation`:

```js
/**
 * Work history, normalised to the same from/to shape as education so one
 * timeline component renders both. The YAML calls them `role` and `org`.
 */
function readExperience() {
  const raw = readFileSync(AUTHOR, 'utf8');
  const block = raw.match(/^ {2}experience:\n([\s\S]*?)(?=^ {2}[a-z_]+:)/m);
  if (!block) return [];

  return block[1]
    .split(/^ {4}- /m)
    .slice(1)
    .map((entry) => {
      const field = (key) => (entry.match(new RegExp(`^ *${key}: *(.+)$`, 'm')) || [, ''])[1].trim();
      const unquote = (s) => s.replace(/^["']|["']$/g, '');
      const start = unquote(field('start'));
      const end = unquote(field('end'));
      return {
        role: unquote(field('role')),
        org: unquote(field('org')),
        from: start.slice(0, 4),
        to: end ? end.slice(0, 4) : 'present',
      };
    })
    .filter((e) => e.role && e.org);
}
```

Call it beside `const education = readEducation();` and add `experience` to the written object and the closing log line.

- [ ] **Step 7: Run it and compare against the previous universe**

```bash
cd /home/stefano/Scrivania/WEBSITE/site
cp src/data/universe.json /tmp/universe-before.json
npm run universe
node -e "
const a=require('/tmp/universe-before.json'), b=require('./src/data/universe.json');
const key=(u)=>u.nodes.map(n=>n.id+' '+n.cluster+' '+n.href).sort();
const A=key(a), B=key(b);
console.log('nodes before', A.length, 'after', B.length);
for (const x of B) if (!A.includes(x)) console.log('  + ' + x);
for (const x of A) if (!B.includes(x)) console.log('  - ' + x);
console.log('experience', (b.experience||[]).length, 'education', b.education.length);
console.log('detailed_text', b.clusters.map(c=>(c.detailed_text||'').length).join(', '));
"
```

Expected: 16 nodes before and after, **no `+` or `-` lines** — the repoint must not change a single node — plus a non-zero experience count and four non-zero `detailed_text` lengths.

- [ ] **Step 8: Prove the build still fails loudly on a bad pillar**

```bash
cd /home/stefano/Scrivania/WEBSITE/site
sed -i.bak 's/^pillar: .*/pillar: nonsense/' src/content/publications/island-model-smc/index.md
npm run universe; echo "exit=$?"
mv src/content/publications/island-model-smc/index.md.bak src/content/publications/island-model-smc/index.md
npm run universe
```

Expected: non-zero exit with `unknown pillar "nonsense"`, then a clean build after the restore.

- [ ] **Step 9: Commit**

```bash
cd /home/stefano/Scrivania/WEBSITE
git add site/scripts/build-universe.mjs site/src/data/universe.json
git commit -m "refactor(universe): read the migrated content and pillars.yaml

Repointed at src/content so the universe and the pages cannot diverge. The
hand-rolled frontmatter helpers and the indentation-keyed regexes that pulled
the pillars out of a Hugo landing page are gone, replaced by js-yaml and a
data file. Fails loudly on an unknown pillar."
```

---

## Task 5: The plateau blend curve

**Files:**
- Modify: `site/src/engine/sections.js`
- Create: `site/tests/blend.test.mjs`

- [ ] **Step 1: Write the failing tests**

Create `site/tests/blend.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { pickActiveBlend } from '../src/engine/sections.js';

// The viewport centre is fixed at 500; section centres move instead.
const VIEWPORT = 1000;

test('t is pinned to 0 while the first section holds the centre', () => {
  // centres 400 and 1400: the centre line sits 10% along the span.
  const { from, to, t } = pickActiveBlend(
    [{ shape: 1, center: 400 }, { shape: 2, center: 1400 }],
    VIEWPORT,
  );
  assert.equal(from, 1);
  assert.equal(to, 2);
  assert.equal(t, 0);
});

test('t is pinned to 1 once the next section has taken over', () => {
  // centres -400 and 600: the centre line sits 90% along the span.
  const { from, to, t } = pickActiveBlend(
    [{ shape: 1, center: -400 }, { shape: 2, center: 600 }],
    VIEWPORT,
  );
  assert.equal(from, 1);
  assert.equal(to, 2);
  assert.equal(t, 1);
});

test('t is one half exactly midway between two section centres', () => {
  const { t } = pickActiveBlend(
    [{ shape: 1, center: 0 }, { shape: 2, center: 1000 }],
    VIEWPORT,
  );
  assert.equal(t, 0.5);
});

test('t never decreases as the document scrolls', () => {
  let previous = -1;
  for (let offset = 0; offset <= 1000; offset += 25) {
    // Sliding both centres up by `offset` is the same as scrolling down.
    const { t } = pickActiveBlend(
      [{ shape: 1, center: 500 - offset }, { shape: 2, center: 1500 - offset }],
      VIEWPORT,
    );
    assert.ok(t >= previous, `t went backwards at offset ${offset}: ${t} < ${previous}`);
    previous = t;
  }
  assert.equal(previous, 1);
});

test('consecutive bands sharing a shape report from === to', () => {
  const { from, to } = pickActiveBlend(
    [{ shape: 5, center: 200 }, { shape: 5, center: 1200 }],
    VIEWPORT,
  );
  assert.equal(from, 5);
  assert.equal(to, 5);
});

test('above the first centre the first shape is simply held', () => {
  const { from, to, t } = pickActiveBlend(
    [{ shape: 3, center: 900 }, { shape: 4, center: 1900 }],
    VIEWPORT,
  );
  assert.equal(from, 3);
  assert.equal(to, 3);
  assert.equal(t, 0);
});

test('below the last centre the last shape is simply held', () => {
  const { from, to, t } = pickActiveBlend(
    [{ shape: 3, center: -900 }, { shape: 4, center: -100 }],
    VIEWPORT,
  );
  assert.equal(from, 4);
  assert.equal(to, 4);
  assert.equal(t, 0);
});

test('two sections sharing a centre do not divide by zero', () => {
  const result = pickActiveBlend(
    [{ shape: 1, center: 500 }, { shape: 2, center: 500 }],
    VIEWPORT,
  );
  assert.ok(Number.isFinite(result.t));
  assert.equal(result.t, 0);
});

test('a zero-height viewport does not divide by zero', () => {
  const result = pickActiveBlend([{ shape: 2, center: 0 }], 0);
  assert.deepEqual(result, { from: 0, to: 0, t: 0, weight: 0 });
});

test('a single section is held with no partner to blend toward', () => {
  const { from, to, t } = pickActiveBlend([{ shape: 2, center: 500 }], VIEWPORT);
  assert.equal(from, 2);
  assert.equal(to, 2);
  assert.equal(t, 0);
});
```

- [ ] **Step 2: Run the tests and watch them fail**

```bash
cd /home/stefano/Scrivania/WEBSITE/site && node --test tests/blend.test.mjs
```

Expected: every test fails with `pickActiveBlend is not a function`.

- [ ] **Step 3: Implement `pickActiveBlend`**

Append to `site/src/engine/sections.js`, leaving `pickActiveShape` and `readSections` untouched — `weight` still drives the camera distance at `index.js:215` and keeps its current meaning:

```js
/**
 * How far the document sits between two topologies.
 *
 * A fraction of the gap at each end is held flat, so while a band is centred
 * the constellation is a resolved, motionless structure and can be read as one.
 * Between the plateaus the blend tracks the scroll exactly: scrolling fast
 * passes through the intermediate states instead of chasing a target it never
 * reaches, which is what the earlier snap-and-damp could not do.
 */
const PLATEAU = 0.3;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smoothstep = (t) => t * t * (3 - 2 * t);

/**
 * @param sections  [{ shape, center }] in document order, `center` in viewport pixels
 * @param viewport  viewport length along the scroll axis, in pixels
 * @returns { from, to, t, weight }
 */
export function pickActiveBlend(sections, viewport) {
  const { weight } = pickActiveShape(sections, viewport);
  if (viewport <= 0 || sections.length === 0) return { from: 0, to: 0, t: 0, weight: 0 };

  const mid = viewport / 2;
  const first = sections[0];
  if (sections.length === 1) return { from: first.shape, to: first.shape, t: 0, weight };

  // The last pair whose opening centre is at or above the centre line, so `a`
  // and `a + 1` bracket it. Capped at the final pair.
  let a = 0;
  for (let i = 0; i < sections.length - 1; i += 1) {
    if (sections[i].center <= mid) a = i;
  }

  const A = sections[a];
  const B = sections[a + 1];

  // Outside the span of the centres there is no pair to bracket with: hold the
  // nearest end rather than extrapolating.
  if (mid <= A.center) return { from: A.shape, to: A.shape, t: 0, weight };
  if (mid >= B.center) return { from: B.shape, to: B.shape, t: 0, weight };

  const span = B.center - A.center;
  if (span <= 0) return { from: A.shape, to: A.shape, t: 0, weight };

  const u = (mid - A.center) / span;
  const t = smoothstep(clamp01((u - PLATEAU) / (1 - 2 * PLATEAU)));
  return { from: A.shape, to: B.shape, t, weight };
}
```

- [ ] **Step 4: Run the tests and watch them pass**

```bash
cd /home/stefano/Scrivania/WEBSITE/site && node --test tests/blend.test.mjs tests/sections.test.mjs
```

Expected: all pass, including the pre-existing `sections.test.mjs` — `pickActiveShape` must not have changed behaviour.

- [ ] **Step 5: Commit**

```bash
cd /home/stefano/Scrivania/WEBSITE
git add site/src/engine/sections.js site/tests/blend.test.mjs
git commit -m "feat(engine): blend topologies on scroll position with held plateaus

The trigger was positional and binary while the morph was temporal, so a fast
scroll crossed topologies it never reached. The blend is now a function of
where the document sits, held flat while a band is centred."
```

---

## Task 6: Three new layouts and their tints

**Files:**
- Modify: `site/src/engine/structure.js`
- Modify: `site/src/engine/palette.js`
- Create: `site/tests/shapes.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `site/tests/shapes.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildStructure } from '../src/engine/structure.js';
import { PRESETS, ACTIVE } from '../src/engine/palette.js';

const universe = JSON.parse(readFileSync(new URL('../src/data/universe.json', import.meta.url)));

test('there are eight layouts, one per band group', () => {
  const { layouts } = buildStructure(universe, 350);
  assert.equal(layouts.length, 8);
});

test('every layout is fully populated and finite', () => {
  const { layouts } = buildStructure(universe, 350);
  for (const [index, layout] of layouts.entries()) {
    assert.equal(layout.length, 350 * 3, `layout ${index} has the wrong length`);
    for (let i = 0; i < layout.length; i += 1) {
      assert.ok(Number.isFinite(layout[i]), `layout ${index} has a non-finite value at ${i}`);
    }
  }
});

test('no layout collapses to a point', () => {
  // A generator that silently produces one repeated coordinate would morph the
  // whole constellation into a dot, which is easy to miss in a dark scene.
  const { layouts } = buildStructure(universe, 350);
  for (const [index, layout] of layouts.entries()) {
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < layout.length; i += 1) {
      if (layout[i] < min) min = layout[i];
      if (layout[i] > max) max = layout[i];
    }
    assert.ok(max - min > 0.5, `layout ${index} spans only ${max - min}`);
  }
});

test('no band asks for a layout that does not exist', () => {
  // The homepage is the only consumer, and a data-shape typo there would fail
  // silently: setBlend clamps, so band 9 would quietly render band 7.
  const page = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
  const literals = [...page.matchAll(/data-shape="(\d+)"/g)].map((m) => Number(m[1]));
  const { layouts } = buildStructure(universe, 350);
  for (const shape of literals) {
    assert.ok(shape < layouts.length, `index.astro asks for shape ${shape}, only ${layouts.length} exist`);
  }
  // The pillar bands use data-shape={cluster.index}, which is not a literal.
  const clusterShapes = universe.clusters.map((c) => c.index);
  for (const shape of clusterShapes) {
    assert.ok(shape < layouts.length, `cluster shape ${shape} has no layout`);
  }
});

test('the active preset carries a tint for every layout', () => {
  const { layouts } = buildStructure(universe, 350);
  const tints = PRESETS[ACTIVE].tints;
  assert.ok(tints, `preset ${ACTIVE} defines no tints`);
  assert.equal(tints.length, layouts.length);
  for (const [index, tint] of tints.entries()) {
    for (const key of ['primary', 'accent', 'smoke', 'scrim']) {
      assert.ok(tint[key], `tint ${index} is missing ${key}`);
    }
    assert.match(tint.scrim, /^\d+, \d+, \d+$/, `tint ${index} has a malformed scrim`);
  }
});
```

- [ ] **Step 2: Run it and watch it fail**

```bash
cd /home/stefano/Scrivania/WEBSITE/site && node --test tests/shapes.test.mjs
```

Expected: failures reporting 5 layouts where 8 are wanted, and a tint length mismatch.

- [ ] **Step 3: Add the three generators**

In `site/src/engine/structure.js`, insert before `const GENERATORS`:

```js
/** A dense core with a thin shell: the shape of work held up as strongest. */
function corePeriphery(count, rand) {
  const points = [];
  for (let i = 0; i < count; i += 1) {
    // A third of the cloud forms the core; the rest is a diffuse halo.
    if (i % 3 === 0) {
      const radius = Math.cbrt(rand()) * 0.62;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      points.push([
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
      ]);
      continue;
    }
    const radius = 1.35 + Math.cbrt(rand()) * 0.85;
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    points.push([
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta) * 0.8,
      radius * Math.cos(phi),
    ]);
  }
  return points;
}

/** A branching growth process: one trajectory that keeps splitting. */
function branchingGrowth(count, rand) {
  // Frontier of active tips, each carrying a position and a direction.
  let frontier = [{ p: [0, -1.7, 0], d: [0, 1, 0] }];
  const points = [];

  while (points.length < count) {
    const next = [];
    for (const tip of frontier) {
      if (points.length >= count) break;
      const step = 0.26 + rand() * 0.12;
      const p = [
        tip.p[0] + tip.d[0] * step + gaussian(rand) * 0.06,
        tip.p[1] + tip.d[1] * step + gaussian(rand) * 0.06,
        tip.p[2] + tip.d[2] * step + gaussian(rand) * 0.06,
      ];
      points.push([p[0] * 0.9, p[1] * 0.85, p[2] * 0.9]);

      // Split, continue, or die back — the frontier has to stay bounded or the
      // structure explodes past the frame.
      const children = rand() < 0.32 ? 2 : 1;
      for (let c = 0; c < children && next.length < 26; c += 1) {
        const spread = children === 2 ? 0.55 : 0.16;
        const d = [
          tip.d[0] + gaussian(rand) * spread,
          tip.d[1] + gaussian(rand) * spread * 0.4 + 0.12,
          tip.d[2] + gaussian(rand) * spread,
        ];
        const len = Math.hypot(d[0], d[1], d[2]) || 1;
        next.push({ p, d: [d[0] / len, d[1] / len, d[2] / len] });
      }
    }
    // A frontier that dies out entirely would loop forever.
    frontier = next.length > 0 ? next : [{ p: [0, -1.7, 0], d: [0, 1, 0] }];
  }
  return points;
}

/** A percolation front: a connected cluster spreading outward from a seed. */
function percolationFront(count, rand) {
  const points = [];
  for (let i = 0; i < count; i += 1) {
    // Radius grows with index, so later particles sit further out: the cluster
    // reads as something that arrived rather than as a static shell.
    const progress = i / count;
    const radius = 0.35 + progress * 1.55 + gaussian(rand) * 0.12;
    // Anisotropic angular spread keeps the front ragged instead of spherical.
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    const ragged = 1 + Math.sin(theta * 5 + phi * 3) * 0.22;
    points.push([
      radius * ragged * Math.sin(phi) * Math.cos(theta),
      radius * ragged * Math.sin(phi) * Math.sin(theta) * 0.75,
      radius * ragged * Math.cos(phi),
    ]);
  }
  return points;
}
```

Then extend the generator list:

```js
const GENERATORS = [
  randomNetwork,
  scaleFree,
  trajectories,
  twoCommunities,
  smallWorld,
  corePeriphery,
  branchingGrowth,
  percolationFront,
];
```

- [ ] **Step 4: Add three tints to the active preset**

In `site/src/engine/palette.js`, extend the `tints` array of `tonal-night` (line 68) from five entries to eight, keeping the one-hue-family discipline the surrounding comment describes:

```js
      { primary: '#56a99b', accent: '#8fd8c6', smoke: '#204f49', scrim: '4, 15, 16' },
      { primary: '#7b8fd0', accent: '#a9b8f2', smoke: '#2b3560', scrim: '8, 10, 26' },
      { primary: '#4c93b0', accent: '#86c6dc', smoke: '#1f4351', scrim: '4, 12, 18' },
      { primary: '#8a86c4', accent: '#b3aeea', smoke: '#332f52', scrim: '9, 8, 21' },
```

Leave `reference-scene` at five: it is a comparison preset, and the read at `index.js:182` already tolerates a missing index.

- [ ] **Step 5: Run the tests and watch them pass**

```bash
cd /home/stefano/Scrivania/WEBSITE/site && node --test tests/shapes.test.mjs
```

Expected: all four pass. If `branchingGrowth` hangs, the frontier died and the restart guard is missing — the `next.length > 0` fallback is what prevents it.

- [ ] **Step 6: Commit**

```bash
cd /home/stefano/Scrivania/WEBSITE
git add site/src/engine/structure.js site/src/engine/palette.js site/tests/shapes.test.mjs
git commit -m "feat(engine): core-periphery, branching growth and percolation layouts

Eleven bands need eight topologies. The three new layouts stay complex-system
structures rather than geometric solids, and each is assigned where it means
something: a dense core for selected work, a branching process for the
academic path, a spreading front for news and contact."
```

---

## Task 7: Wire the blend into the engine

**Files:**
- Modify: `site/src/engine/swarm.js`
- Modify: `site/src/engine/index.js`

- [ ] **Step 1: Replace `setShape` with `setBlend`**

In `site/src/engine/swarm.js`, replace the method at lines 242–248:

```js
  /**
   * Positions the cloud between two layouts. `t` is where the document sits
   * between them, so the morph is driven by scroll rather than by a timer.
   */
  setBlend(from, to, t) {
    const last = this.layouts.length - 1;
    const A = this.layouts[Math.max(0, Math.min(last, from))];
    const B = this.layouts[Math.max(0, Math.min(last, to))];

    // Consecutive bands sharing a shape land here, and the topology holds
    // perfectly still for the length of both.
    if (A === B) {
      this.target.set(A);
      return;
    }
    for (let i = 0; i < this.target.length; i += 1) {
      this.target[i] = A[i] + (B[i] - A[i]) * t;
    }
  }
```

Delete `this.shapeIndex = 0;` at line 158 — nothing else reads it. Confirm before deleting:

```bash
cd /home/stefano/Scrivania/WEBSITE/site && grep -rn "shapeIndex\|setShape" src/
```

- [ ] **Step 2: Retune the morph damping**

In `site/src/engine/swarm.js`, the morph at line 300 damps at `1.6` — about two seconds to settle. Against a target that now follows the scroll it would lag permanently. Add a named constant near the top of the file:

```js
/**
 * The morph damping only removes jitter now. The target itself is driven by
 * scroll position, so a slow rate here would reintroduce exactly the lag the
 * blend was written to remove.
 */
const MORPH_RATE = 8;
```

and use it:

```js
      this.current[i] = damp(this.current[i], this.target[i] * this.breath, MORPH_RATE, dt);
```

- [ ] **Step 3: Switch the engine to the blend and interpolate the tint**

In `site/src/engine/index.js`, change the import:

```js
import { pickActiveBlend, readSections } from './sections.js';
```

Add three scratch colours in `init()`, next to the other `THREE` scratch objects:

```js
    this.tintA = new THREE.Color();
    this.tintB = new THREE.Color();
```

Replace `readShape()` (lines 170–190) with:

```js
  readShape() {
    const elements = document.querySelectorAll(this.sectionSelector);
    const { from, to, t, weight } = pickActiveBlend(readSections(elements), window.innerHeight);

    // Total progress through the document, which drives the camera orbit.
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    this.scroll = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;

    this.targetWeight = weight;
    this.swarm.setBlend(from, to, t);
    this.applyTint(from, to, t);

    if (from !== this.shape) {
      this.shape = from;
      this.onShape({ type: 'shape', shape: from });
    }
  }

  /**
   * Colour rides the same blend as the topology. Snapping it on a section
   * change while the shape interpolates reads as a cut in a scene that is
   * otherwise continuous.
   */
  applyTint(from, to, t) {
    const tints = palette.tints;
    if (!tints) return;

    const A = tints[from] ?? tints[tints.length - 1];
    const B = tints[to] ?? tints[tints.length - 1];
    if (!A || !B) return;

    const mix = (key) =>
      `#${this.tintA.set(A[key]).lerp(this.tintB.set(B[key]), t).getHexString()}`;

    const primary = mix('primary');
    const accent = mix('accent');
    const smoke = mix('smoke');

    this.swarm.setTint(primary, accent);
    this.ambient.setTint(smoke, accent, primary);
    this.washTarget = smoke;

    // The scrim is an "r, g, b" string consumed by updateScrim, not a hex.
    const a = A.scrim.split(',').map(Number);
    const b = B.scrim.split(',').map(Number);
    this.scrimTarget = a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(', ');
  }
```

- [ ] **Step 4: Fix the breath, which counts in screens**

At line 205 the radial breathing is driven by `window.scrollY / window.innerHeight` — a count of screens. At 1280vh instead of 800 it oscillates proportionally more often and reads as a tremor. Replace with the normalised progress:

```js
    // Normalised, not in screens: tying this to scrollY/innerHeight made the
    // breath rate a function of how tall the page happens to be.
    this.swarm.setBreath(1 + Math.sin(this.scroll * Math.PI * 2) * 0.22);
```

- [ ] **Step 5: Verify nothing still calls the removed method**

```bash
cd /home/stefano/Scrivania/WEBSITE/site && grep -rn "setShape\|shapeIndex" src/ ; echo "exit=$?"
```

Expected: no matches (`exit=1`).

- [ ] **Step 6: Run the full suite and build**

```bash
cd /home/stefano/Scrivania/WEBSITE/site && npm test && npm run build
```

Expected: all tests pass, build succeeds.

- [ ] **Step 7: Look at it**

```bash
cd /home/stefano/Scrivania/WEBSITE/site && npm run dev
```

Open `http://localhost:4321` and scroll slowly, then quickly. Expected: the topology holds still while a band is centred, and tracks the scroll between bands. If it feels sluggish, `MORPH_RATE` is too low; if it looks jittery, too high. This number is set by eye — that is what it is for.

- [ ] **Step 8: Commit**

```bash
cd /home/stefano/Scrivania/WEBSITE
git add site/src/engine
git commit -m "feat(engine): drive topology and colour from scroll position

setBlend replaces setShape, the morph damping drops to a jitter filter, the
tint interpolates on the same curve, and the radial breath is re-anchored to
normalised progress so it no longer speeds up on a taller page."
```

---

## Task 8: The eleven bands

**Files:**
- Modify: `site/src/pages/index.astro`
- Modify: `site/src/styles/scene.css`

- [ ] **Step 1: Read the Hugo copy so nothing is paraphrased**

```bash
cd /home/stefano/Scrivania/WEBSITE && sed -n '1,125p' content/_index.md
```

The eyebrow, headline, summary, CTA labels, block eyebrows, titles and framing text all come from here verbatim. `detailed_text` for each pillar is the long paragraph the current Astro page drops.

- [ ] **Step 2: Add `detailed_text` to the universe clusters**

`site/src/data/universe.json` carries `title`, `description` and `topics` per cluster but not `detailed_text`. In `site/scripts/build-universe.mjs`, `readPillars()` extracts `description` with a single-line regex at line 112. `detailed_text` is a one-line scalar in the same block, so the same approach works — add beside it:

```js
    const detailedText = (chunk.match(/^ {10}detailed_text: (.*)$/m) || [, ''])[1].trim();
```

and add `detailed_text: detailedText` to the returned pillar object. Then carry it onto the cluster: in the `CLUSTER_ORDER.map(...)` block (line 229) where `title`, `description` and `topics` are copied from `pillar`, add `detailed_text: pillar.detailed_text`. Then:

```bash
cd /home/stefano/Scrivania/WEBSITE/site && npm run universe
node -e "require('./src/data/universe.json').clusters.forEach(c=>console.log(c.id, (c.detailed_text||'').length))"
```

Expected: four clusters each reporting several hundred characters.

- [ ] **Step 3: Write the bands**

Rewrite `site/src/pages/index.astro`'s `<main>` with the eleven bands below, keeping the existing canvas, wash, scrim and `<script>` exactly as they are. Shapes are the mapping from the spec §4.

```astro
---
import { getCollection } from 'astro:content';
import universe from '../data/universe.json';
import { PEOPLE, INSTITUTION_COUNT } from '../data/people.js';
import '../styles/palette.css';
import '../styles/scene.css';

const { clusters, nodes, education, experience } = universe;
const worksOf = (id, kind) => nodes.filter((n) => n.cluster === id && n.kind === kind);

const FEATURED_PROJECTS = ['risk-sentinel', 'island-model-smc', 'multi-agent-orchestration'];

const allProjects = await getCollection('projects');
const allPublications = await getCollection('publications');
const allPosts = await getCollection('blog');

const featuredProjects = FEATURED_PROJECTS
  .map((slug) => allProjects.find((p) => p.id === slug))
  .filter(Boolean);

const featuredPublications = allPublications
  .filter((p) => p.data.featured)
  .sort((a, b) => b.data.date - a.data.date);

const latestPosts = allPosts
  .sort((a, b) => b.data.date - a.data.date)
  .slice(0, 3);
---
```

Bands 01 and 02:

```astro
      <section class="band band-hero" data-shape="0">
        <div class="band-inner">
          <p class="eyebrow"><span class="pip"></span>Stefano Blando | AI Researcher and PhD Candidate</p>
          <h1>Understanding complex systems through <em>adaptive intelligence</em></h1>
          <p class="lede">
            My research lies at the intersection of artificial intelligence, agent-based
            modeling, and economics. I develop adaptive simulations, statistical verification
            methods, and practical tools for studying complex economic systems.
          </p>
          <div class="hero-actions">
            <a class="cta cta-primary" href="#research">Explore my work</a>
            <a class="cta cta-secondary" href="/uploads/resume.pdf">Download CV</a>
          </div>
          <ul class="social-row" aria-label="Social profiles">
            <li><a href="https://github.com/stefano-blando">GitHub</a></li>
            <li><a href="https://www.linkedin.com/in/stefano-blando/">LinkedIn</a></li>
            <li><a href="https://scholar.google.com/citations?user=dNbRRG0AAAAJ">Google Scholar</a></li>
          </ul>
          <p class="affiliation-line">Scuola Superiore Sant'Anna · Pisa</p>
        </div>
        <div class="hero-portrait">
          <img src="/media/portrait.jpg" alt="Portrait of Stefano Blando" width="360" height="450" loading="eager" />
        </div>
      </section>

      <section class="band band-lead" id="research" data-shape="0">
        <div class="band-inner">
          <p class="section-label">Research profile</p>
          <h2 class="section-lead">Four connected research pillars</h2>
          <p class="lede">
            My work combines adaptive agents, statistical verification, robust quantitative
            methods, and large-scale text analysis to study complex economic and social
            systems, from simulation design to empirical validation.
          </p>
        </div>
      </section>
```

The portrait file must exist. Find the one Hugo serves and copy it:

```bash
cd /home/stefano/Scrivania/WEBSITE
find assets static -iname "*avatar*" -o -iname "*portrait*" | head
mkdir -p site/public/media
# copy the file the previous command found:
# cp <found path> site/public/media/portrait.jpg
```

Bands 03–06 keep the existing `clusters.map(...)` block unchanged except for adding the long paragraph after the `lede`:

```astro
              <p class="pillar-detail">{cluster.detailed_text}</p>
```

Bands 07–11:

```astro
      <section class="band band-work" id="work" data-shape="5">
        <div class="band-inner">
          <p class="section-label">Selected work</p>
          <h2>Research translated into technology</h2>
          <p class="lede">
            Three projects that connect research questions with working simulations,
            interfaces, and agentic systems.
          </p>
          <ul class="card-grid">
            {featuredProjects.map((project) => (
              <li class="card">
                <a href={`/projects/${project.id}/`}>
                  <span class="card-title">{project.data.title}</span>
                  <span class="card-summary">{project.data.summary}</span>
                </a>
              </li>
            ))}
          </ul>
          <a class="pillar-link" href="/projects/">Explore all projects →</a>
        </div>
      </section>

      <section class="band band-publications" data-shape="5">
        <div class="band-inner">
          <p class="section-label">Research output</p>
          <h2>Selected publications</h2>
          <p class="lede">
            Peer-reviewed papers, conference proceedings, and working papers in computational
            economics, agent-based modeling, and quantitative finance.
          </p>
          <ul class="work-list">
            {featuredPublications.map((entry) => (
              <li>
                <a href={`/publications/${entry.id}/`}>
                  <span class="work-title">{entry.data.title}</span>
                  <span class="work-summary">{entry.data.publication ?? entry.data.summary}</span>
                </a>
              </li>
            ))}
          </ul>
          <a class="pillar-link" href="/publications/">Explore all publications →</a>
        </div>
      </section>

      <section class="band band-path" id="path" data-shape="6">
        <div class="band-inner">
          <p class="section-label">Academic path</p>
          <h2>Experience &amp; Education</h2>
          <ul class="timeline">
            {education.map((entry) => (
              <li>
                <span class="timeline-years">{entry.from}–{entry.to}</span>
                <span class="timeline-degree">{entry.degree}</span>
                <span class="timeline-institution">{entry.institution}</span>
              </li>
            ))}
          </ul>
          <ul class="timeline">
            {experience.map((entry) => (
              <li>
                <span class="timeline-years">{entry.from}–{entry.to}</span>
                <span class="timeline-degree">{entry.role}</span>
                <span class="timeline-institution">{entry.org}</span>
              </li>
            ))}
          </ul>
          <a class="pillar-link" href="/network/">
            {PEOPLE.length} co-authors across {INSTITUTION_COUNT} institutions → Explore the network
          </a>
        </div>
      </section>

      <section class="band band-news" data-shape="7">
        <div class="band-inner">
          <p class="section-label">Latest updates</p>
          <h2>News &amp; Recognition</h2>
          <ul class="work-list">
            {latestPosts.map((post) => (
              <li>
                <a href={`/blog/${post.id}/`}>
                  <span class="work-title">{post.data.title}</span>
                  <span class="work-summary">{post.data.summary}</span>
                </a>
              </li>
            ))}
          </ul>
          <a class="pillar-link" href="/blog/">Explore all news →</a>
        </div>
      </section>

      <section class="band band-contact" id="contact" data-shape="7">
        <div class="band-inner">
          <p class="section-label">Contact</p>
          <h2>Let us discuss research, systems, or collaboration.</h2>
          <p class="lede">
            I am based in Pisa and open to academic and technical collaborations in artificial
            intelligence, economic networks, and complex systems.
          </p>
          <a class="contact-link" href="mailto:stefano.blando@santannapisa.it">
            stefano.blando@santannapisa.it
          </a>
        </div>
      </section>
```

The `experience` entry field names must match what Task 3 emitted. Check `universe.json` before writing them.

- [ ] **Step 4: Create the people data module**

`site/src/data/people.js` is needed by the band above and by Task 12. Lift the array from `layouts/_partials/hbx/blocks/collaborators-network/block.html:53-67` verbatim:

```bash
cd /home/stefano/Scrivania/WEBSITE
sed -n '52,80p' layouts/_partials/hbx/blocks/collaborators-network/block.html
```

Write it as:

```js
/**
 * The co-author graph's data, lifted out of the Hugo template so it can be
 * edited without touching rendering code, and counted by the homepage without
 * duplicating the numbers.
 */
export const PEOPLE = [ /* the 15 objects, unchanged */ ];

export const INSTITUTIONS = { /* the institutions object, unchanged */ };

export const ROLE_COLORS = { /* the roleColors object, unchanged */ };

export const INSTITUTION_COUNT = new Set(PEOPLE.flatMap((p) => p.extInst)).size;
```

- [ ] **Step 5: Set the band heights**

In `site/src/styles/scene.css`, replace the single `.band { min-height: 100vh; }` rule (line 120) with per-band heights, and add the new component styles. The heights are what give each plateau its length:

```css
/* Each band is a scroll stop carrying a topology for the backdrop. Its height
   is also how long that topology is held: the blend only moves between the
   plateaus, so a taller band is a longer hold. */
.band {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 7rem clamp(1.1rem, 5vw, 4.5rem) 5rem;
}

.band-lead { min-height: 90vh; }
.band-pillar { min-height: 150vh; }
.band-work,
.band-publications { min-height: 120vh; }
.band-path { min-height: 150vh; }
.band-news { min-height: 110vh; }
.band-contact { min-height: 90vh; }

.band-hero {
  gap: clamp(2rem, 5vw, 4rem);
  justify-content: space-between;
}

.hero-portrait img {
  width: clamp(11rem, 18vw, 18rem);
  height: auto;
  border-radius: 2px;
  filter: grayscale(0.55) contrast(1.05);
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  margin: 2rem 0 1.6rem;
}

.cta {
  padding: 0.72rem 1.4rem;
  font-size: 0.82rem;
  letter-spacing: 0.06em;
  text-decoration: none;
  border: 1px solid var(--line);
  transition: border-color 200ms ease, color 200ms ease;
}

.cta-primary { color: var(--paper); border-color: var(--teal); }
.cta-secondary { color: var(--dim); }
.cta:hover { border-color: var(--gold); color: var(--gold); }

.social-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  margin: 0 0 1.4rem;
  padding: 0;
  list-style: none;
  font-size: 0.76rem;
  letter-spacing: 0.08em;
}

.social-row a { color: var(--muted); text-decoration: none; }
.social-row a:hover { color: var(--gold); }

.pillar-detail {
  margin: 1.1rem 0 1.6rem;
  color: var(--dim);
  font-size: 0.95rem;
  line-height: 1.7;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1.1rem;
  margin: 2rem 0 1.6rem;
  padding: 0;
  list-style: none;
}

.card a {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: 100%;
  padding: 1.25rem;
  border: 1px solid var(--line);
  background: var(--tint);
  text-decoration: none;
  transition: border-color 200ms ease;
}

.card a:hover { border-color: var(--gold); }
.card-title { color: var(--paper); font-size: 0.98rem; line-height: 1.4; }
.card-summary { color: var(--muted); font-size: 0.84rem; line-height: 1.6; }

@media (max-width: 860px) {
  .band-hero { flex-direction: column-reverse; }
  .hero-portrait img { width: 9rem; }
}
```

The mobile block at line 324 already collapses `.band { min-height: auto; }`; leave it, and confirm the new per-band rules do not override it — the media query must come after them in the file.

- [ ] **Step 6: Build and check the band count and page height**

```bash
cd /home/stefano/Scrivania/WEBSITE/site && npm run build
grep -o 'data-shape="[0-9]"' dist/index.html | sort | uniq -c
```

Expected: shape 0 ×2, shapes 1–4 ×1 each, shape 5 ×2, shape 6 ×1, shape 7 ×2 — eleven bands, eight distinct shapes.

- [ ] **Step 7: Look at it**

```bash
cd /home/stefano/Scrivania/WEBSITE/site && npm run dev
```

Scroll the whole page. Expected: eight distinct topologies, each held while its band is read; the camera orbit noticeably slower than before because the page is taller.

- [ ] **Step 8: Commit**

```bash
cd /home/stefano/Scrivania/WEBSITE
git add site/src/pages/index.astro site/src/styles/scene.css site/src/data/people.js \
        site/scripts/build-universe.mjs site/src/data/universe.json site/public/media
git commit -m "feat(site): rebuild the homepage on the Hugo eleven-band structure

Restores the full hero, the pillar long-form text, selected work, selected
publications, experience and news. Band heights set how long each topology
is held, which is what the blend plateaus read."
```

**Stage A is complete here. The homepage works end to end.**

---

# Stage B — Index pages and the seven-item nav

## Task 9: Shared shell, nav and static backdrop

**Files:**
- Create: `site/src/layouts/Base.astro`, `site/src/components/Masthead.astro`, `site/src/styles/static-backdrop.css`
- Modify: `site/src/pages/index.astro`

- [ ] **Step 1: Write the masthead**

`site/src/components/Masthead.astro`, mirroring `config/_default/menus.yaml`:

```astro
---
const { anchorBase = '' } = Astro.props;
const items = [
  { name: 'Research', href: `${anchorBase}#research` },
  { name: 'Projects', href: '/projects/' },
  { name: 'Publications', href: '/publications/' },
  { name: 'Experience', href: '/experience/' },
  { name: 'Network', href: '/network/' },
  { name: 'News', href: '/blog/' },
  { name: 'Contact', href: `${anchorBase}#contact` },
];
---
<header class="masthead">
  <a class="wordmark" href="/">Stefano Blando<span>.</span></a>
  <nav class="masthead-nav">
    {items.map((item) => <a href={item.href}>{item.name}</a>)}
  </nav>
</header>
```

The homepage passes no `anchorBase` (anchors stay local); every other page passes `/`.

- [ ] **Step 2: Write the base layout**

`site/src/layouts/Base.astro`. `scene` says whether this page carries the engine; every page that does not gets the CSS backdrop instead.

```astro
---
import Masthead from '../components/Masthead.astro';
import '../styles/palette.css';
import '../styles/scene.css';
import '../styles/static-backdrop.css';

const { title, description, scene = false, anchorBase = '' } = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#030608" />
    <title>{title}</title>
    <meta name="description" content={description} />
  </head>

  <body data-backdrop={scene ? 'scene' : 'static'}>
    {!scene && <div class="static-backdrop" aria-hidden="true"></div>}
    <Masthead anchorBase={anchorBase} />
    <slot />
  </body>
</html>
```

The homepage keeps its own `<canvas>`, `.tint-wash`, `.scrim` and `<script>` inside the slot — they are engine furniture, not page furniture, and no other page has them.

- [ ] **Step 3: Write the static backdrop**

`site/src/styles/static-backdrop.css`. It reads the same variables `build-palette.mjs` generates, so the engine-free pages sit in the same colour family without a line of JavaScript:

```css
/*
 * The backdrop for pages that ship no engine. The scene pages get their depth
 * from the renderer; these get it from two gradients and a grain, which is
 * enough to keep them in the same family without a canvas.
 */
.static-backdrop {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(120% 90% at 78% 12%, rgba(var(--wash-rgb), 0.28), transparent 62%),
    radial-gradient(90% 70% at 12% 88%, rgba(var(--scrim-rgb), 0.5), transparent 58%),
    var(--ink);
}

/* Grain, inline so nothing is fetched. */
.static-backdrop::after {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E");
}

body[data-backdrop='static'] .page {
  position: relative;
  z-index: 10;
  max-width: 62rem;
  margin: 0 auto;
  padding: 9rem clamp(1.1rem, 5vw, 4.5rem) 7rem;
}

body[data-backdrop='static'] .page h1 {
  margin: 0 0 2.5rem;
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  color: var(--paper);
}

.index-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.index-list > li {
  padding: 1.6rem 0;
  border-top: 1px solid var(--line);
}

.index-list a {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  text-decoration: none;
}

.index-title { color: var(--paper); font-size: 1.05rem; line-height: 1.45; }
.index-summary { color: var(--muted); font-size: 0.88rem; line-height: 1.65; }
.index-list a:hover .index-title { color: var(--gold); }

.index-meta {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--dim);
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0.8rem 0 0;
  padding: 0;
  list-style: none;
}

.tag-row li {
  padding: 0.2rem 0.55rem;
  border: 1px solid var(--line);
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  color: var(--dim);
}

.index-links {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 0.8rem 0 0;
  padding: 0;
  list-style: none;
  font-size: 0.76rem;
}

.index-links a { color: var(--teal); text-decoration: none; }
.index-links a:hover { color: var(--gold); }

.year-heading {
  margin: 3rem 0 0.5rem;
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--dim);
}
```

- [ ] **Step 4: Move the homepage onto the layout**

Replace `index.astro`'s hand-written `<html>`/`<head>`/`<header>` with `<Base title=... scene={true}>`, leaving the canvas, wash, scrim, bands and `<script>` inside the slot.

- [ ] **Step 5: Build and confirm the homepage is unchanged**

```bash
cd /home/stefano/Scrivania/WEBSITE/site && npm run build
grep -c 'data-shape' dist/index.html
grep -o 'href="/[a-z]*/"' dist/index.html | sort -u
```

Expected: 11 bands still, and the nav hrefs for projects, publications, experience, network, blog.

- [ ] **Step 6: Commit**

```bash
cd /home/stefano/Scrivania/WEBSITE
git add site/src/layouts site/src/components site/src/styles/static-backdrop.css site/src/pages/index.astro
git commit -m "feat(site): shared shell, seven-item nav, engine-free backdrop"
```

---

## Task 10: The projects and publications indexes

**Files:**
- Create: `site/src/pages/projects/index.astro`, `site/src/pages/publications/index.astro`

- [ ] **Step 1: Write `/projects/`**

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../layouts/Base.astro';

const projects = (await getCollection('projects'))
  .sort((a, b) => b.data.date - a.data.date);
---
<Base title="Projects — Stefano Blando" description="Research translated into working software." scene={false} anchorBase="/">
  <main class="page">
    <h1>Projects</h1>
    <ul class="index-list">
      {projects.map((project) => (
        <li>
          <a href={`/projects/${project.id}/`}>
            <span class="index-title">{project.data.title}</span>
            <span class="index-summary">{project.data.summary}</span>
          </a>
          <ul class="tag-row">{project.data.tags.map((tag) => <li>{tag}</li>)}</ul>
        </li>
      ))}
    </ul>
  </main>
</Base>
```

- [ ] **Step 2: Write `/publications/`**

Grouped by year descending. `doi` and `url_pdf` are empty strings on all six publications today, so the filter below is not defensive padding — without it every entry renders a "PDF" link pointing at `""`.

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../layouts/Base.astro';

const publications = (await getCollection('publications'))
  .sort((a, b) => b.data.date - a.data.date);

const years = [...new Set(publications.map((p) => p.data.date.getFullYear()))];

// Only links that actually point somewhere. url_pdf and doi are empty strings
// on every publication today; a bare href="" reloads the page.
const linksOf = (data) => [
  ...(data.url_pdf ? [{ name: 'PDF', url: data.url_pdf }] : []),
  ...(data.doi ? [{ name: 'DOI', url: `https://doi.org/${data.doi}` }] : []),
  ...(data.url_code ? [{ name: 'Code', url: data.url_code }] : []),
  ...data.links.filter((l) => l.url),
];
---
<Base
  title="Publications — Stefano Blando"
  description="Peer-reviewed papers, conference proceedings, and working papers."
  scene={false}
  anchorBase="/"
>
  <main class="page">
    <h1>Publications</h1>
    {years.map((year) => (
      <>
        <h2 class="year-heading">{year}</h2>
        <ul class="index-list">
          {publications.filter((p) => p.data.date.getFullYear() === year).map((entry) => (
            <li>
              <a href={`/publications/${entry.id}/`}>
                <span class="index-title">{entry.data.title}</span>
                <span class="index-summary">{entry.data.summary}</span>
              </a>
              <span class="index-meta">
                {[entry.data.publication_types.join(', '), entry.data.publication]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
              {linksOf(entry.data).length > 0 && (
                <ul class="index-links">
                  {linksOf(entry.data).map((l) => <li><a href={l.url}>{l.name ?? 'Link'}</a></li>)}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </>
    ))}
  </main>
</Base>
```

- [ ] **Step 3: Build and count**

```bash
cd /home/stefano/Scrivania/WEBSITE/site && npm run build
grep -c '<li>' dist/projects/index.html
grep -c 'index-title' dist/publications/index.html
```

Expected: 13 project entries, 6 publication entries.

- [ ] **Step 4: Confirm no empty links were emitted**

```bash
cd /home/stefano/Scrivania/WEBSITE/site && grep -o 'href=""' dist/publications/index.html; echo "exit=$?"
```

Expected: no matches (`exit=1`).

- [ ] **Step 5: Commit**

```bash
cd /home/stefano/Scrivania/WEBSITE
git add site/src/pages/projects site/src/pages/publications
git commit -m "feat(site): projects and publications index pages"
```

---

## Task 11: The blog and experience indexes

**Files:**
- Create: `site/src/pages/blog/index.astro`, `site/src/pages/experience/index.astro`

- [ ] **Step 1: Write `/blog/`**

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../layouts/Base.astro';

const posts = (await getCollection('blog')).sort((a, b) => b.data.date - a.data.date);

const formatDate = (date) =>
  date.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
---
<Base
  title="News — Stefano Blando"
  description="Announcements, conference acceptances, awards, and presentation recaps."
  scene={false}
  anchorBase="/"
>
  <main class="page">
    <h1>News &amp; Recognition</h1>
    <ul class="index-list">
      {posts.map((post) => (
        <li>
          <a href={`/blog/${post.id}/`}>
            <span class="index-title">{post.data.title}</span>
            <span class="index-summary">{post.data.summary}</span>
          </a>
          <span class="index-meta">{formatDate(post.data.date)}</span>
        </li>
      ))}
    </ul>
  </main>
</Base>
```

- [ ] **Step 2: Write `/experience/`**

Reads the two timelines from `universe.json` — Task 3 emitted both — so no collection is involved.

```astro
---
import Base from '../../layouts/Base.astro';
import universe from '../../data/universe.json';

const { education, experience } = universe;
---
<Base
  title="Experience — Stefano Blando"
  description="Academic path and professional experience."
  scene={false}
  anchorBase="/"
>
  <main class="page">
    <h1>Experience &amp; Education</h1>

    <h2 class="year-heading">Education</h2>
    <ul class="timeline">
      {education.map((entry) => (
        <li>
          <span class="timeline-years">{entry.from}–{entry.to}</span>
          <span class="timeline-degree">{entry.degree}</span>
          <span class="timeline-institution">{entry.institution}</span>
        </li>
      ))}
    </ul>

    <h2 class="year-heading">Experience</h2>
    <ul class="timeline">
      {experience.map((entry) => (
        <li>
          <span class="timeline-years">{entry.from}–{entry.to}</span>
          <span class="timeline-degree">{entry.role}</span>
          <span class="timeline-institution">{entry.org}</span>
        </li>
      ))}
    </ul>
  </main>
</Base>
```

- [ ] **Step 3: Build and count**

```bash
cd /home/stefano/Scrivania/WEBSITE/site && npm run build
grep -c 'index-title' dist/blog/index.html
grep -c 'timeline-degree' dist/experience/index.html
node -e "const u=require('./src/data/universe.json'); console.log('expected', u.education.length + u.experience.length)"
```

Expected: 8 posts, and a `timeline-degree` count equal to the number the last command prints.

- [ ] **Step 4: Commit**

```bash
cd /home/stefano/Scrivania/WEBSITE
git add site/src/pages/blog site/src/pages/experience
git commit -m "feat(site): blog and experience index pages"
```

---

## Task 12: The co-author network page

**Files:**
- Create: `site/src/pages/network/index.astro`, `site/src/components/CoauthorNetwork.astro`
- Modify: `site/package.json`

The source is `layouts/_partials/hbx/blocks/collaborators-network/block.html` (649 lines) and its sibling `style.css`. The data is already extracted into `site/src/data/people.js` by Task 8.

- [ ] **Step 1: Install the d3 modules the block actually uses**

```bash
cd /home/stefano/Scrivania/WEBSITE/site
npm install d3-selection d3-scale d3-array d3-force d3-transition d3-ease
```

- [ ] **Step 2: Establish exactly which d3 symbols are referenced**

```bash
cd /home/stefano/Scrivania/WEBSITE
grep -o "d3\.[a-zA-Z]*" layouts/_partials/hbx/blocks/collaborators-network/block.html | sort -u
```

Every symbol in that list needs a named import. If one is not covered by the six packages above, install the package that provides it rather than falling back to the full `d3` bundle.

- [ ] **Step 3: Port markup, CSS and script**

`site/src/components/CoauthorNetwork.astro`: the block's HTML (minus Hugo template syntax) in the template, its `style.css` in a `<style>` tag, and the script as a module importing `PEOPLE`, `INSTITUTIONS` and `ROLE_COLORS` from `../data/people.js` plus the named d3 symbols. Replace every `d3.foo(` call with the bare imported `foo(`. Remove the CDN `<script src="https://cdn.jsdelivr.net/npm/d3@7">` at line 49 — that tag is the reason Astro was chosen.

The category tab counts at lines 13–16 are hardcoded (`All (15)`, `Faculty (8)`, …). Derive them from `PEOPLE` instead so they cannot drift.

- [ ] **Step 4: Write the page**

`site/src/pages/network/index.astro` renders `<Base scene={false}>` with the component and the eyebrow, title and text from `content/network.md`.

- [ ] **Step 5: Build and verify no CDN reference survives**

```bash
cd /home/stefano/Scrivania/WEBSITE/site && npm run build
grep -rn "cdn.jsdelivr" dist/ ; echo "exit=$?"
grep -c "csh-node-circle" dist/network/index.html
```

Expected: no CDN matches (`exit=1`), and the graph markup present.

- [ ] **Step 6: Look at it**

```bash
cd /home/stefano/Scrivania/WEBSITE/site && npm run dev
```

Open `http://localhost:4321/network/`. Expected: the graph renders, category tabs filter, hovering a node grows it and shows the detail card — the same behaviour as the Hugo page. The console must be clean.

- [ ] **Step 7: Commit**

```bash
cd /home/stefano/Scrivania/WEBSITE
git add site/src/pages/network site/src/components/CoauthorNetwork.astro site/package.json site/package-lock.json
git commit -m "feat(site): migrate the co-author network off the CDN d3 global

Data lifted into src/data/people.js, CDN script replaced with scoped d3-*
imports, tab counts derived from the data instead of hardcoded."
```

---

## Task 13: Verify the whole thing

**Files:** none

- [ ] **Step 1: Full suite and clean build**

```bash
cd /home/stefano/Scrivania/WEBSITE/site && npm test && rm -rf dist && npm run build
```

Expected: all tests pass; build succeeds.

- [ ] **Step 2: Confirm every page exists**

```bash
cd /home/stefano/Scrivania/WEBSITE/site
for p in "" projects publications experience network blog; do
  test -f "dist/$p/index.html" && echo "ok   /$p/" || echo "MISS /$p/"
done
```

Expected: six `ok` lines.

- [ ] **Step 3: Confirm index pages ship no 3D JavaScript**

This is a success criterion of the parent spec, not a nicety.

```bash
cd /home/stefano/Scrivania/WEBSITE/site
for p in projects publications experience blog; do
  echo -n "/$p/ three.js refs: "
  grep -o 'src="[^"]*\.js"' "dist/$p/index.html" | while read -r s; do
    f=$(echo "$s" | sed 's/src="//;s/"//')
    grep -l "THREE" "dist${f}" 2>/dev/null
  done | wc -l
done
```

Expected: `0` for every page.

- [ ] **Step 4: Measure the homepage bundle against the budget**

The parent spec §10 predicts 150–200 KB gzip for the homepage.

```bash
cd /home/stefano/Scrivania/WEBSITE/site
for f in dist/_astro/*.js; do printf "%8s  %s\n" "$(gzip -c "$f" | wc -c)" "$f"; done | sort -rn | head
```

Record the total. If it exceeds 200 KB gzip, say so plainly rather than adjusting the budget.

- [ ] **Step 5: Confirm the loader's `../content` path survives a Netlify build**

The spec names this as the one stated risk. It cannot be fully settled without a deploy, but the two ways it breaks are checkable now: a Netlify `base` that makes `../content` fall outside the build context, and a publish directory that no longer matches.

```bash
cd /home/stefano/Scrivania/WEBSITE && cat netlify.toml
```

Confirm the `base` (if set) is the repository root or unset — if it is `site/`, then `../content` is above the build context and the loader will fail on Netlify while working locally. Record what the file says. Switching the publish directory and build command is Phase 3 and is not done here; the point of this step is to know now whether Phase 3 will hit a wall.

- [ ] **Step 6: Confirm Hugo still builds**

The whole point of reading content in place was keeping the safety net.

```bash
cd /home/stefano/Scrivania/WEBSITE && hugo --quiet && echo "hugo ok"
```

Expected: `hugo ok`. If Hugo now fails, the `pillar:` field or the directory rename broke it, and that must be fixed before this is called done.

- [ ] **Step 7: Commit any fixes and report**

Report: test results, the six pages, the measured bundle size against the 150–200 KB budget, and the Hugo build status. State the 16 work-detail 404s as still outstanding — they are out of scope here, not fixed.

---

## Out of scope, deliberately

Named so nobody mistakes their absence for an oversight:

- Per-work detail pages (`/projects/<slug>/`, `/publications/<slug>/`). The 16 homepage work links stay 404.
- Italian routing and `check:i18n`.
- Pagefind.
- The Netlify cutover.
- `doi` and `url_pdf`, empty on all six publications.
