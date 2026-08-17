/**
 * Writes src/data/pillars.json — the research pillars, in both languages.
 *
 * Separate from universe.json for the reason resume.json is separate: the
 * homepage's client script imports universe.json, so the pillars' prose in two
 * languages would be downloaded by every visitor to read four headings. The
 * engine never touches this text — it only ever asked the clusters for their
 * axis, accent and count.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load as parseYaml } from 'js-yaml';

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, '../src/data/pillars.yaml');
const OUT = join(here, '../src/data/pillars.json');

const pillars = parseYaml(readFileSync(SRC, 'utf8'));

/** A pillar states each field once per language; a missing one is a build error. */
function localised(pillar, field) {
  const en = pillar[field];
  const it = pillar[`${field}_it`];
  if (en === undefined) throw new Error(`pillar "${pillar.id}" has no ${field}`);
  if (it === undefined) throw new Error(`pillar "${pillar.id}" has no ${field}_it`);
  return { en, it };
}

const out = pillars.map((pillar) => ({
  id: pillar.id,
  index: pillar.index,
  projects: pillar.projects ?? [],
  title: localised(pillar, 'title'),
  description: localised(pillar, 'description'),
  detailed_text: localised(pillar, 'detailed_text'),
  topics: localised(pillar, 'topics'),
}));

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, `${JSON.stringify(out, null, 2)}\n`);
console.log(`pillars.json written: ${out.length} pillars, 2 languages`);
