import test from 'node:test';
import assert from 'node:assert/strict';
import { UI, LANGS, localise, otherLang, useTranslations } from '../src/i18n/ui.js';

test('both languages define exactly the same keys', () => {
  const [a, b] = LANGS;
  const keysA = Object.keys(UI[a]).sort();
  const keysB = Object.keys(UI[b]).sort();

  const onlyA = keysA.filter((k) => !keysB.includes(k));
  const onlyB = keysB.filter((k) => !keysA.includes(k));

  assert.deepEqual(onlyA, [], `only in ${a}`);
  assert.deepEqual(onlyB, [], `only in ${b}`);
});

test('no string is left untranslated by being left empty', () => {
  for (const lang of LANGS) {
    for (const [key, value] of Object.entries(UI[lang])) {
      assert.ok(typeof value === 'string' && value.trim().length > 0, `${lang}.${key} is empty`);
    }
  }
});

test('the Italian is actually different from the English', () => {
  // Catches keys copied across and never translated. The exceptions are the
  // words that are the same in both, and the two that name the languages.
  const SAME_IN_BOTH = new Set(['publications.abstract', 'nav.menu', 'lang.switch', 'lang.name']);
  const identical = Object.keys(UI.en).filter(
    (key) => !SAME_IN_BOTH.has(key) && UI.en[key] === UI.it[key],
  );
  assert.deepEqual(identical, [], 'identical in both languages');
});

test('paths are prefixed for Italian and left alone for English', () => {
  assert.equal(localise('/projects/', 'en'), '/projects/');
  assert.equal(localise('/projects/', 'it'), '/it/projects/');
  assert.equal(localise('/', 'it'), '/it/');
});

test('each language points at the other', () => {
  assert.equal(otherLang('en'), 'it');
  assert.equal(otherLang('it'), 'en');
});

test('a missing key fails loudly rather than rendering blank', () => {
  const t = useTranslations('en');
  assert.throws(() => t('nav.nonexistent'), /missing translation: en\.nav\.nonexistent/);
});
