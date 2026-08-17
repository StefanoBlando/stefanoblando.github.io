import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseSummary, unwrap, firstSentenceEnd, buildResume } from '../scripts/resume-source.mjs';

const resume = JSON.parse(readFileSync(new URL('../src/data/resume.json', import.meta.url)));

test('hard-wrapped prose is rejoined into one statement', () => {
  const text = [
    'Research focus: "Learning How to Learn: Adaptive Cognitive Architectures for Economic',
    'Network Formation". Methods include differentiable agent-based models.',
  ].join('\n');
  assert.equal(unwrap(text).length, 1);
});

test('a finished line is not swallowed by the one before it', () => {
  const text = 'Final Grade: 108/110.\nSupervisor: Prof. Alessio Farcomeni.';
  assert.equal(unwrap(text).length, 2);
});

test('a full stop inside a thesis title does not end the sentence', () => {
  const title = '"Robust Portfolio Optimization: A Factor-Analytic Approach". Supervised work.';
  assert.equal(title.slice(0, firstSentenceEnd(title)), '"Robust Portfolio Optimization: A Factor-Analytic Approach".');
});

test('a title is not mistaken for the end of a sentence', () => {
  // "Supervisor: Prof. Alessio Farcomeni." became "Prof" plus a stray note.
  const { facts, notes } = parseSummary('Supervisor: Prof. Alessio Farcomeni.');
  assert.deepEqual(facts, [{ label: 'Supervisor', value: 'Prof. Alessio Farcomeni' }]);
  assert.equal(notes.length, 0);
});

test('a summary splits into facts, prose and bullets', () => {
  const { facts, notes, bullets } = parseSummary(
    [
      'Final Grade: 110/110 cum laude.',
      'Thesis: "Network Topology Analysis".',
      'Advanced program in statistics and machine learning.',
      '* Supported students with statistics.',
    ].join('\n'),
  );

  assert.deepEqual(facts, [
    { label: 'Final Grade', value: '110/110 cum laude' },
    { label: 'Thesis', value: '"Network Topology Analysis"' },
  ]);
  assert.deepEqual(notes, ['Advanced program in statistics and machine learning.']);
  assert.deepEqual(bullets, ['Supported students with statistics.']);
});

test('a second statement sharing a line with a fact becomes prose', () => {
  const { facts, notes } = parseSummary(
    'Research focus: "Learning How to Learn". Methods include differentiable models.',
  );
  assert.deepEqual(facts, [{ label: 'Research focus', value: '"Learning How to Learn"' }]);
  assert.deepEqual(notes, ['Methods include differentiable models.']);
});

test('an unlabelled sentence containing a colon stays prose', () => {
  // "Selected as one of the top 3..." has no label; a greedier rule invented one.
  const { facts, notes } = parseSummary('Completed coursework in logic, epistemology and ethics.');
  assert.equal(facts.length, 0);
  assert.equal(notes.length, 1);
});

test('both date spellings in the author file yield a year', () => {
  const built = buildResume({
    education: [{ degree: 'PhD', institution: 'Somewhere', start: new Date('2025-11-01') }],
    experience: [{ role: 'Researcher', org: 'Somewhere', start: '2025-11-01', end: '2026-01-31' }],
  });
  assert.deepEqual(
    [built.education[0].from, built.education[0].to, built.education[0].current],
    ['2025', 'present', true],
  );
  assert.deepEqual(
    [built.experience[0].from, built.experience[0].to, built.experience[0].current],
    ['2025', '2026', false],
  );
});

test('the generated résumé carries every section the page renders', () => {
  for (const key of ['education', 'experience', 'awards', 'skills', 'languages']) {
    assert.ok(resume[key].length > 0, `resume.json has no ${key}`);
  }
  assert.match(resume.since, /^\d{4}$/);
});

test('no entry is missing the fields the timeline prints', () => {
  for (const entry of resume.education) {
    assert.ok(entry.degree && entry.institution, 'a degree is incomplete');
    assert.match(entry.from, /^\d{4}$/);
  }
  for (const entry of resume.experience) {
    assert.ok(entry.role && entry.org, 'a role is incomplete');
    assert.match(entry.from, /^\d{4}$/);
  }
  for (const award of resume.awards) {
    assert.ok(award.title && award.awarder, 'an award is incomplete');
    assert.match(award.year, /^\d{4}$/);
  }
  for (const group of resume.skills) {
    for (const item of group.items) {
      assert.ok(item.level >= 1 && item.level <= 5, `${item.label} has level ${item.level}`);
    }
  }
});

test('the Hugo em-dash shortcode does not reach the page', () => {
  for (const award of resume.awards) {
    assert.doesNotMatch(`${award.title} ${award.awarder}`, /---/);
  }
});
