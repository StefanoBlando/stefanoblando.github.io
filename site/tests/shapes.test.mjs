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

test('the field stays within the volume the journey was built against', () => {
  // The camera stops are derived from the work positions, which sit on a shell
  // inside this radius. If the field grew, every stop would be framed wrongly
  // and nothing else would report it.
  const { positions } = buildStructure(universe, COUNT);
  let maxRadius = 0;
  for (let i = 0; i < positions.length; i += 3) {
    const r = Math.hypot(positions[i], positions[i + 1], positions[i + 2]);
    if (r > maxRadius) maxRadius = r;
  }
  assert.ok(maxRadius < 3, `the field reaches ${maxRadius.toFixed(2)}`);
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
