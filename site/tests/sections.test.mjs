import test from 'node:test';
import assert from 'node:assert/strict';
import { pickActiveShape } from '../src/engine/sections.js';

const VIEWPORT = 1000;

test('a section centred in the viewport wins outright', () => {
  const { shape, weight } = pickActiveShape(
    [
      { shape: 1, center: 500 },
      { shape: 2, center: 1800 },
    ],
    VIEWPORT,
  );
  assert.equal(shape, 1);
  assert.equal(weight, 1);
});

test('the dead zone keeps a section fully active while it slides past', () => {
  // Anything within 40% of the viewport from centre still counts as centred,
  // which is what stops the topology flickering mid-scroll.
  for (const center of [500, 600, 700, 900, 100]) {
    const { weight } = pickActiveShape([{ shape: 3, center }], VIEWPORT);
    assert.equal(weight, 1, `center ${center} should still be fully weighted`);
  }
});

test('weight falls off outside the dead zone and reaches zero', () => {
  const near = pickActiveShape([{ shape: 1, center: 1050 }], VIEWPORT).weight;
  const far = pickActiveShape([{ shape: 1, center: 1300 }], VIEWPORT).weight;
  const gone = pickActiveShape([{ shape: 1, center: 1600 }], VIEWPORT).weight;

  assert.ok(near > far, 'closer sections must weigh more');
  assert.ok(far > 0, 'a section one falloff away should still register');
  assert.equal(gone, 0, 'beyond the falloff a section must not register at all');
});

test('the nearest section wins when several are in view', () => {
  const { shape } = pickActiveShape(
    [
      { shape: 1, center: 1400 },
      { shape: 2, center: 520 },
      { shape: 3, center: 2000 },
    ],
    VIEWPORT,
  );
  assert.equal(shape, 2);
});

test('nothing in range yields the resting shape', () => {
  const { shape, weight } = pickActiveShape([{ shape: 4, center: 5000 }], VIEWPORT);
  assert.equal(shape, 0);
  assert.equal(weight, 0);
});

test('a zero-height viewport does not divide by zero', () => {
  const result = pickActiveShape([{ shape: 2, center: 0 }], 0);
  assert.equal(result.shape, 0);
  assert.equal(result.weight, 0);
});
