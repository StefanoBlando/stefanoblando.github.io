import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildStructure, SHAPE_COUNT } from '../src/engine/structure.js';
import { PRESETS, ACTIVE } from '../src/engine/palette.js';
import { buildPages } from '../src/engine/pages.js';

const universe = JSON.parse(readFileSync(new URL('../src/data/universe.json', import.meta.url)));
const COUNT = 350;

test('there is one shape per page', () => {
  const { layouts } = buildStructure(universe, COUNT);
  assert.equal(layouts.length, SHAPE_COUNT);
  assert.equal(buildPages().length, SHAPE_COUNT);
});

test('every shape is fully populated, finite, and does not collapse', () => {
  const { layouts } = buildStructure(universe, COUNT);
  for (const [index, layout] of layouts.entries()) {
    assert.equal(layout.length, COUNT * 3, `shape ${index} has the wrong length`);

    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < layout.length; i += 1) {
      assert.ok(Number.isFinite(layout[i]), `shape ${index} has a non-finite value at ${i}`);
      if (layout[i] < min) min = layout[i];
      if (layout[i] > max) max = layout[i];
    }
    assert.ok(max - min > 0.5, `shape ${index} spans only ${max - min}`);
  }
});

test('every shape occupies the same volume', () => {
  // A morph should change the figure, not lurch the cloud toward or away from
  // the camera. Normalising the extent is what stops that, and nothing else
  // would report it if the normalisation were dropped.
  const { layouts } = buildStructure(universe, COUNT);
  const extents = layouts.map((layout) => {
    let extent = 0;
    for (let i = 0; i < layout.length; i += 3) {
      extent = Math.max(extent, Math.hypot(layout[i], layout[i + 1], layout[i + 2]));
    }
    return extent;
  });
  for (const [index, extent] of extents.entries()) {
    assert.ok(Math.abs(extent - extents[0]) < 0.01, `shape ${index} reaches ${extent}`);
  }
});

test('no two shapes are the same figure', () => {
  // Two pages morphing into indistinguishable clouds would look like the
  // scroll had stopped working.
  const { layouts } = buildStructure(universe, COUNT);
  for (let a = 0; a < layouts.length; a += 1) {
    for (let b = a + 1; b < layouts.length; b += 1) {
      let moved = 0;
      for (let i = 0; i < layouts[a].length; i += 1) {
        moved += Math.abs(layouts[a][i] - layouts[b][i]);
      }
      const average = moved / layouts[a].length;
      assert.ok(average > 0.25, `shapes ${a} and ${b} differ by only ${average.toFixed(3)}`);
    }
  }
});

test('the shapes are deterministic for a given content set', () => {
  const a = buildStructure(universe, COUNT).layouts;
  const b = buildStructure(universe, COUNT).layouts;
  for (let i = 0; i < a.length; i += 1) {
    assert.deepEqual(Array.from(a[i]), Array.from(b[i]), `shape ${i} is not reproducible`);
  }
});

test('every page has a shape and a tint the palette defines', () => {
  const pages = buildPages();
  const tints = PRESETS[ACTIVE].tints;
  assert.ok(tints, `preset ${ACTIVE} defines no tints`);

  for (const [index, page] of pages.entries()) {
    assert.equal(page.shape, index, `page ${index} points at the wrong shape`);
    assert.ok(tints[page.tint], `page ${index} asks for tint ${page.tint}, which does not exist`);
  }
});

test('every page that links somewhere has a label and a destination', () => {
  for (const page of buildPages()) {
    if (page.kind !== 'destination') continue;
    assert.ok(page.label, 'a destination has no label');
    assert.match(page.href, /^\/[a-z-]*\/$/, `${page.label} has a suspect href`);
    assert.ok(page.cta, `${page.label} has no call to action`);
  }
});

test('no two pages are the same view', () => {
  const pages = buildPages();
  for (let i = 1; i < pages.length; i += 1) {
    const a = pages[i - 1].position;
    const b = pages[i].position;
    const moved = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    assert.ok(moved > 0.5, `pages ${i - 1} and ${i} are ${moved.toFixed(2)} apart`);
  }
});
