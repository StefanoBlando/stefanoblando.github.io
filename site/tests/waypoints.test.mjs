import test from 'node:test';
import assert from 'node:assert/strict';
import { WAYPOINTS, interpolateWaypoint } from '../src/engine/waypoints.js';

test('there is one waypoint per station', () => {
  assert.equal(WAYPOINTS.length, 8);
});

test('every waypoint is a complete composition', () => {
  for (const [i, w] of WAYPOINTS.entries()) {
    assert.equal(w.position.length, 3, `waypoint ${i} has no position`);
    assert.equal(w.target.length, 3, `waypoint ${i} has no look-at target`);
    for (const v of [...w.position, ...w.target]) {
      assert.ok(Number.isFinite(v), `waypoint ${i} has a non-finite coordinate`);
    }
    // Inside the field, not sitting on top of it and not lost outside it.
    const distance = Math.hypot(
      w.position[0] - w.target[0],
      w.position[1] - w.target[1],
      w.position[2] - w.target[2],
    );
    assert.ok(distance > 0.8 && distance < 12, `waypoint ${i} sits at distance ${distance}`);
  }
});

test('consecutive waypoints are actually different places', () => {
  // Two stations framing the same view would make the scroll feel broken
  // rather than look wrong, which is much harder to notice.
  for (let i = 1; i < WAYPOINTS.length; i += 1) {
    const a = WAYPOINTS[i - 1].position;
    const b = WAYPOINTS[i].position;
    const moved = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    assert.ok(moved > 0.6, `waypoints ${i - 1} and ${i} are only ${moved.toFixed(2)} apart`);
  }
});

test('interpolation lands exactly on a waypoint at the ends', () => {
  const at0 = interpolateWaypoint(2, 5, 0);
  const at1 = interpolateWaypoint(2, 5, 1);
  assert.deepEqual(at0.position, WAYPOINTS[2].position);
  assert.deepEqual(at1.position, WAYPOINTS[5].position);
});

test('interpolation is halfway at t = 0.5', () => {
  const mid = interpolateWaypoint(0, 1, 0.5);
  for (let axis = 0; axis < 3; axis += 1) {
    const expected = (WAYPOINTS[0].position[axis] + WAYPOINTS[1].position[axis]) / 2;
    assert.ok(Math.abs(mid.position[axis] - expected) < 1e-9);
  }
});

test('out-of-range indices are clamped rather than throwing', () => {
  const r = interpolateWaypoint(-3, 99, 0.5);
  assert.ok(Number.isFinite(r.position[0]));
  assert.ok(Number.isFinite(r.target[0]));
});

test('every station id is unique and readable', () => {
  const ids = WAYPOINTS.map((w) => w.id);
  assert.equal(new Set(ids).size, ids.length, 'two stations share an id');
  for (const id of ids) assert.match(id, /^[a-z-]+$/, `"${id}" is not a slug`);
});
