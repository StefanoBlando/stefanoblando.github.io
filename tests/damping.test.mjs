import test from 'node:test';
import assert from 'node:assert/strict';
import { damp, dampVector, clampDelta } from '../src/engine/damping.js';

test('damping is independent of frame rate', () => {
  const lambda = 3;

  // One second of damping delivered as a single step...
  const coarse = damp(0, 1, lambda, 1);

  // ...and as sixty steps of the same total duration.
  let fine = 0;
  for (let i = 0; i < 60; i += 1) fine = damp(fine, 1, lambda, 1 / 60);

  assert.ok(
    Math.abs(coarse - fine) < 1e-12,
    `60 Hz and 1 Hz paths diverged: ${coarse} vs ${fine}`,
  );
});

test('a 120 Hz client lands where a 60 Hz client lands', () => {
  const lambda = 4;
  const seconds = 0.5;

  let at60 = 0;
  for (let i = 0; i < 30; i += 1) at60 = damp(at60, 10, lambda, seconds / 30);

  let at120 = 0;
  for (let i = 0; i < 60; i += 1) at120 = damp(at120, 10, lambda, seconds / 60);

  assert.ok(Math.abs(at60 - at120) < 1e-9, `${at60} vs ${at120}`);
});

test('damping approaches the target without overshooting', () => {
  let v = 0;
  let previous = -Infinity;
  for (let i = 0; i < 200; i += 1) {
    v = damp(v, 1, 5, 1 / 60);
    assert.ok(v > previous, 'must be monotonic');
    assert.ok(v <= 1, `overshot the target: ${v}`);
    previous = v;
  }
  assert.ok(v > 0.99, 'should have essentially converged');
});

test('dampVector damps each component in place', () => {
  const current = { x: 0, y: 0, z: 0 };
  dampVector(current, { x: 1, y: 2, z: 3 }, 5, 1);
  assert.ok(current.x > 0 && current.x < 1);
  assert.ok(current.y > 0 && current.y < 2);
  assert.ok(current.z > 0 && current.z < 3);
});

test('clampDelta absorbs the jump from a backgrounded tab', () => {
  assert.equal(clampDelta(12), 0.05);
  assert.equal(clampDelta(-1), 0);
  assert.equal(clampDelta(0.016), 0.016);
});
