import test from 'node:test';
import assert from 'node:assert/strict';
import { arxivId, citeKey, generateBibtex, citationFor } from '../src/lib/citation.js';

const arxivEntry = {
  title: 'Towards Agentic Agent-based Models: Feasibility, Performance, and Statistical Model Checking',
  authors: ['Stefano Blando', 'Andrea Vandin'],
  date: new Date('2026-07-18'),
  venue: 'Submitted to AISoLA 2026 (arXiv:2607.17948)',
  links: [],
};

test('the arXiv id is found in the venue', () => {
  assert.equal(arxivId(arxivEntry), '2607.17948');
});

test('the arXiv id is found in a link when the venue does not carry it', () => {
  assert.equal(
    arxivId({ venue: 'In preparation', links: [{ url: 'https://arxiv.org/abs/2605.10447' }] }),
    '2605.10447',
  );
});

test('a work with no preprint has no id', () => {
  assert.equal(arxivId({ venue: 'MARS @ ETAPS 2026', links: [] }), null);
});

test('the key skips the words that identify nothing', () => {
  // "Towards" is the first word of the title and says nothing about the paper.
  assert.equal(citeKey(arxivEntry), 'blando2026agentic');
});

test('the entry states only what the frontmatter states', () => {
  const bibtex = generateBibtex(arxivEntry);
  assert.match(bibtex, /^@misc\{blando2026agentic,/);
  assert.match(bibtex, /author = \{Blando, Stefano and Vandin, Andrea\}/);
  assert.match(bibtex, /eprint = \{2607\.17948\}/);
  assert.match(bibtex, /archivePrefix = \{arXiv\}/);
  assert.match(bibtex, /year = \{2026\}/);
  assert.ok(bibtex.trim().endsWith('}'));
});

test('a bundled cite.bib is used verbatim, never regenerated', () => {
  const bundled = '@inproceedings{blando2026islandsmc,\n  title={Island Model}\n}';
  const cite = citationFor({ ...arxivEntry, venue: 'MARS @ ETAPS 2026' }, bundled);
  assert.equal(cite.source, 'file');
  assert.equal(cite.bibtex, bundled);
});

test('a work that is neither published nor preprinted offers no citation', () => {
  const cite = citationFor(
    { title: 'Working note', authors: ['Stefano Blando'], date: new Date('2026-01-01'), venue: 'In preparation', links: [] },
    null,
  );
  assert.equal(cite, null);
});
