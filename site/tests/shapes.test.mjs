import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildStructure } from '../src/engine/structure.js';
import { PRESETS, ACTIVE } from '../src/engine/palette.js';
import { WAYPOINTS } from '../src/engine/waypoints.js';
import { STATIONS } from '../src/data/stations.js';

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

test('the field stays within the volume the waypoints were authored against', () => {
  // The camera positions assume a radius of roughly 2.25. If the field grew,
  // every station would be framed wrongly and nothing would report it.
  const { positions } = buildStructure(universe, COUNT);
  let maxRadius = 0;
  for (let i = 0; i < positions.length; i += 3) {
    const r = Math.hypot(positions[i], positions[i + 1], positions[i + 2]);
    if (r > maxRadius) maxRadius = r;
  }
  assert.ok(maxRadius < 3, `the field reaches ${maxRadius.toFixed(2)}, past the waypoint volume`);
});

test('the field is deterministic for a given content set', () => {
  const a = buildStructure(universe, COUNT).positions;
  const b = buildStructure(universe, COUNT).positions;
  assert.deepEqual(Array.from(a), Array.from(b));
});

test('every station has a waypoint and a tint', () => {
  assert.equal(STATIONS.length, WAYPOINTS.length, 'a station lost or gained its camera');

  const tints = PRESETS[ACTIVE].tints;
  assert.ok(tints.length >= STATIONS.length, `${STATIONS.length} stations, ${tints.length} tints`);

  for (const station of STATIONS) {
    assert.ok(WAYPOINTS[station.shape], `station ${station.shape} has no waypoint`);
    assert.ok(tints[station.shape], `station ${station.shape} has no tint`);
  }
});

test('station indices are a complete run with no gaps or repeats', () => {
  // A repeated index would give two stations the same camera and the same
  // colour, which reads as the scroll having stopped working.
  const shapes = STATIONS.map((s) => s.shape);
  assert.deepEqual(shapes, [...shapes].sort((a, b) => a - b), 'stations are out of order');
  assert.deepEqual(shapes, [...new Set(shapes)], 'two stations share an index');
  assert.equal(shapes[0], 0);
  assert.equal(shapes.at(-1), STATIONS.length - 1);
});

test('every station that links somewhere has a label and a destination', () => {
  for (const station of STATIONS) {
    if (station.kind) continue;
    assert.ok(station.label, `station ${station.shape} has no label`);
    assert.match(station.href, /^\/[a-z-]*\/$/, `station ${station.shape} has a suspect href`);
    assert.ok(station.cta, `station ${station.shape} has no call to action`);
  }
});
