import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildStructure } from '../src/engine/structure.js';
import { PRESETS, ACTIVE } from '../src/engine/palette.js';

const universe = JSON.parse(readFileSync(new URL('../src/data/universe.json', import.meta.url)));
const COUNT = 350;

test('there are eight layouts, one per band group', () => {
  const { layouts } = buildStructure(universe, COUNT);
  assert.equal(layouts.length, 8);
});

test('every layout is fully populated and finite', () => {
  const { layouts } = buildStructure(universe, COUNT);
  for (const [index, layout] of layouts.entries()) {
    assert.equal(layout.length, COUNT * 3, `layout ${index} has the wrong length`);
    for (let i = 0; i < layout.length; i += 1) {
      assert.ok(Number.isFinite(layout[i]), `layout ${index} has a non-finite value at ${i}`);
    }
  }
});

test('no layout collapses to a point', () => {
  // A generator that silently produced one repeated coordinate would morph the
  // whole constellation into a dot, which is easy to miss in a dark scene.
  const { layouts } = buildStructure(universe, COUNT);
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

test('no layout runs away past the frame', () => {
  // branchingGrowth compounds a step each generation; an unbounded frontier
  // would put most of the cloud outside the camera without any error.
  const { layouts } = buildStructure(universe, COUNT);
  for (const [index, layout] of layouts.entries()) {
    for (let i = 0; i < layout.length; i += 1) {
      assert.ok(Math.abs(layout[i]) < 6, `layout ${index} reaches ${layout[i]} at ${i}`);
    }
  }
});

test('layouts are deterministic for a given content set', () => {
  const a = buildStructure(universe, COUNT).layouts;
  const b = buildStructure(universe, COUNT).layouts;
  for (let i = 0; i < a.length; i += 1) {
    assert.deepEqual(Array.from(a[i]), Array.from(b[i]), `layout ${i} is not reproducible`);
  }
});

test('no band asks for a layout that does not exist', () => {
  // setBlend clamps, so a data-shape typo would not throw: band 9 would
  // quietly render band 7 and nobody would know which one they were looking at.
  const page = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
  const literals = [...page.matchAll(/data-shape="(\d+)"/g)].map((m) => Number(m[1]));
  const { layouts } = buildStructure(universe, COUNT);
  assert.ok(literals.length > 0, 'no data-shape literals found; has the page changed shape?');
  for (const shape of literals) {
    assert.ok(shape < layouts.length, `index.astro asks for shape ${shape}, only ${layouts.length} exist`);
  }
  // The pillar bands use data-shape={cluster.index}, which is not a literal.
  for (const cluster of universe.clusters) {
    assert.ok(cluster.index < layouts.length, `cluster ${cluster.id} has no layout`);
  }
});

test('the active preset carries a tint for every layout', () => {
  const { layouts } = buildStructure(universe, COUNT);
  const tints = PRESETS[ACTIVE].tints;
  assert.ok(tints, `preset ${ACTIVE} defines no tints`);
  assert.equal(tints.length, layouts.length);
  for (const [index, tint] of tints.entries()) {
    for (const key of ['primary', 'accent', 'smoke', 'scrim']) {
      assert.ok(tint[key], `tint ${index} is missing ${key}`);
    }
    assert.match(tint.primary, /^#[0-9a-f]{6}$/i, `tint ${index} has a malformed primary`);
    assert.match(tint.scrim, /^\d+, \d+, \d+$/, `tint ${index} has a malformed scrim`);
  }
});
