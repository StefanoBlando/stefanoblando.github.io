/**
 * Generates src/data/resume.json from the author data file.
 *
 * Separate from universe.json on purpose: universe.json is imported by the
 * homepage's client script, so everything added to it is downloaded by every
 * visitor. The résumé is read by one page, at build time, and belongs in a
 * file that page alone imports.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load as parseYaml } from 'js-yaml';
import { buildResume } from './resume-source.mjs';

const here = dirname(fileURLToPath(import.meta.url));

/** One author file per language; the Italian one came over with the Hugo site. */
const SOURCES = {
  en: { author: '../src/data/authors/me.yaml', out: '../src/data/resume.json' },
  it: { author: '../src/data/authors/me-it.yaml', out: '../src/data/resume.it.json' },
};

for (const [lang, { author: authorPath, out }] of Object.entries(SOURCES)) {
  const author = parseYaml(readFileSync(join(here, authorPath), 'utf8'));
  const resume = {
    generatedAt: new Date().toISOString().slice(0, 10),
    source: authorPath.replace('../', ''),
    lang,
    ...buildResume(author),
    // After the spread, not before: `buildResume` sets its own empty default,
    // which silently blanked this when it came first. The ORCID is one number
    // in any language and the Italian author file predates it.
    orcid: author.orcid || parseYaml(readFileSync(join(here, SOURCES.en.author), 'utf8')).orcid,
  };

  const target = join(here, out);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(resume, null, 2)}\n`);

  console.log(
    `${out.split('/').pop()} written: ${resume.education.length} degrees, ` +
      `${resume.experience.length} roles, ${resume.awards.length} awards, ` +
      `${resume.skills.length} skill groups, ${resume.languages.length} languages`,
  );
}
