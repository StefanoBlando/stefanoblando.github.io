import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildStructure } from '../src/engine/structure.js';
import { PRESETS, ACTIVE } from '../src/engine/palette.js';
import { buildJourney } from '../src/engine/journey.js';

const universe = JSON.parse(readFileSync(new URL('../src/data/universe.json', import.meta.url)));
const COUNT = 350;

test('the field is populated, finite and does not collapse', () => {
  const { positions } = buildStructure(universe, COUNT);
  assert.equal(positions.length, COUNT * 3);

  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < positions.length; i += 1) {
    assert.ok(Number.isFinite(positions[i]), `non-finite value at ${i}`);
    if (positions[i] < min) min = positions[i];
    if (positions[i] > max) max = positions[i];
  }
  assert.ok(max - min > 0.5, `the field spans only ${max - min}`);
});

test('every region is a separate body, and none swallows another', () => {
  // Two regions overlapping would read as one misshapen blob, and the road
  // between them would have nowhere to go.
  const { regions } = buildStructure(universe, COUNT);
  assert.equal(regions.length, 7);
  for (let a = 0; a < regions.length; a += 1) {
    for (let b = a + 1; b < regions.length; b += 1) {
      const gap = Math.hypot(
        regions[a].centre[0] - regions[b].centre[0],
        regions[a].centre[1] - regions[b].centre[1],
        regions[a].centre[2] - regions[b].centre[2],
      );
      const touching = regions[a].radius + regions[b].radius;
      assert.ok(gap > touching, `${regions[a].id} and ${regions[b].id} overlap`);
    }
  }
});

test('a region is as big as what is behind its link', () => {
  const { regions } = buildStructure(universe, COUNT);
  const size = (id) => regions.find((r) => r.id === id).size;
  assert.ok(size('projects') > size('publications'), '13 projects against 6 publications');
  assert.ok(size('research') > size('news'), '16 works against 7 posts');
});

test('the particle budget is spent exactly', () => {
  for (const count of [220, 350]) {
    const { positions, regions } = buildStructure(universe, count);
    assert.equal(positions.length, count * 3, `count ${count} produced the wrong buffer`);
    assert.equal(
      regions.reduce((sum, r) => sum + r.size, 0),
      count,
      `count ${count}: the regions do not add up`,
    );
  }
});

test('the field is deterministic for a given content set', () => {
  const a = buildStructure(universe, COUNT).positions;
  const b = buildStructure(universe, COUNT).positions;
  assert.deepEqual(Array.from(a), Array.from(b));
});

test('every stop has a tint the palette actually defines', () => {
  const journey = buildJourney(universe);
  const tints = PRESETS[ACTIVE].tints;
  assert.ok(tints, `preset ${ACTIVE} defines no tints`);

  for (const [i, stop] of journey.entries()) {
    assert.equal(typeof stop.tint, 'number', `stop ${i} has no tint zone`);
    assert.ok(tints[stop.tint], `stop ${i} asks for tint ${stop.tint}, which does not exist`);
  }
});

test('the colour changes on arrival, not on every screen of travelling', () => {
  const journey = buildJourney(universe);
  for (let i = 1; i < journey.length; i += 1) {
    const changed = journey[i].tint !== journey[i - 1].tint;
    const arrived = journey[i].kind === 'destination' || journey[i].kind === 'contact';
    if (changed) {
      assert.ok(arrived, `the tint changes at stop ${i}, which is only travelling`);
    }
  }
});
