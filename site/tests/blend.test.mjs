import test from 'node:test';
import assert from 'node:assert/strict';
import { pickActiveBlend } from '../src/engine/sections.js';

// The viewport centre is fixed at 500; the section centres move instead, which
// is what scrolling actually does to them.
const VIEWPORT = 1000;

test('t is pinned to 0 while the first section holds the centre', () => {
  // Centres 400 and 1400: the centre line sits 10% along the span.
  const { from, to, t } = pickActiveBlend(
    [
      { shape: 1, center: 400 },
      { shape: 2, center: 1400 },
    ],
    VIEWPORT,
  );
  assert.equal(from, 1);
  assert.equal(to, 2);
  assert.equal(t, 0);
});

test('t is pinned to 1 once the next section has taken over', () => {
  // Centres -400 and 600: the centre line sits 90% along the span.
  const { from, to, t } = pickActiveBlend(
    [
      { shape: 1, center: -400 },
      { shape: 2, center: 600 },
    ],
    VIEWPORT,
  );
  assert.equal(from, 1);
  assert.equal(to, 2);
  assert.equal(t, 1);
});

test('t is one half exactly midway between two section centres', () => {
  const { t } = pickActiveBlend(
    [
      { shape: 1, center: 0 },
      { shape: 2, center: 1000 },
    ],
    VIEWPORT,
  );
  assert.equal(t, 0.5);
});

/**
 * Where the constellation actually sits, as one number. `t` alone is not
 * monotone: when the second band reaches the centre the pair is exhausted and
 * the result becomes `from === to, t = 0`, which renders the same topology as
 * `t = 1` did the frame before. This is the quantity that must not jump.
 */
const position = ({ from, to, t }) => from + (to - from) * t;

test('the rendered topology never moves backwards as the document scrolls', () => {
  let previous = -Infinity;
  for (let offset = 0; offset <= 1000; offset += 25) {
    // Sliding both centres up by `offset` is what scrolling down does.
    const result = pickActiveBlend(
      [
        { shape: 1, center: 500 - offset },
        { shape: 2, center: 1500 - offset },
      ],
      VIEWPORT,
    );
    const p = position(result);
    assert.ok(p >= previous, `topology went backwards at offset ${offset}: ${p} < ${previous}`);
    previous = p;
  }
  assert.equal(previous, 2, 'and it arrives fully at the second shape');
});

test('the topology does not jump when a pair is exhausted', () => {
  // The frame before the handover and the frame after must render the same
  // thing, or the seam between every pair of bands is a visible cut.
  const before = pickActiveBlend(
    [
      { shape: 1, center: -475 },
      { shape: 2, center: 525 },
    ],
    VIEWPORT,
  );
  const after = pickActiveBlend(
    [
      { shape: 1, center: -500 },
      { shape: 2, center: 500 },
    ],
    VIEWPORT,
  );
  assert.equal(position(before), 2);
  assert.equal(position(after), 2);
});

test('consecutive bands sharing a shape report from === to', () => {
  // This is what holds a topology perfectly still across two bands, and it
  // falls out of the mechanism rather than needing its own code path.
  const { from, to } = pickActiveBlend(
    [
      { shape: 5, center: 200 },
      { shape: 5, center: 1200 },
    ],
    VIEWPORT,
  );
  assert.equal(from, 5);
  assert.equal(to, 5);
});

test('above the first centre the first shape is simply held', () => {
  const { from, to, t } = pickActiveBlend(
    [
      { shape: 3, center: 900 },
      { shape: 4, center: 1900 },
    ],
    VIEWPORT,
  );
  assert.equal(from, 3);
  assert.equal(to, 3);
  assert.equal(t, 0);
});

test('below the last centre the last shape is simply held', () => {
  const { from, to, t } = pickActiveBlend(
    [
      { shape: 3, center: -900 },
      { shape: 4, center: -100 },
    ],
    VIEWPORT,
  );
  assert.equal(from, 4);
  assert.equal(to, 4);
  assert.equal(t, 0);
});

test('two sections sharing a centre do not divide by zero', () => {
  const result = pickActiveBlend(
    [
      { shape: 1, center: 500 },
      { shape: 2, center: 500 },
    ],
    VIEWPORT,
  );
  assert.ok(Number.isFinite(result.t));
  assert.equal(result.t, 0);
});

test('a zero-height viewport does not divide by zero', () => {
  const result = pickActiveBlend([{ shape: 2, center: 0 }], 0);
  assert.deepEqual(result, { from: 0, to: 0, t: 0, weight: 0 });
});

test('a single section is held with no partner to blend toward', () => {
  const { from, to, t } = pickActiveBlend([{ shape: 2, center: 500 }], VIEWPORT);
  assert.equal(from, 2);
  assert.equal(to, 2);
  assert.equal(t, 0);
});

test('a band sitting exactly on the centre line is held, not blended away', () => {
  const sections = [0, 0, 1, 2, 3, 4, 5, 5, 6, 7, 7].map((shape, i) => ({
    shape,
    center: -1500 + i * 500,
  }));
  // Centres run -1500, -1000, -500, 0, 500, … so index 4 (shape 3) is dead centre.
  const { from, to, t } = pickActiveBlend(sections, VIEWPORT);
  assert.equal(from, 3);
  assert.equal(to, 3);
  assert.equal(t, 0);
});

test('the bracketing pair is chosen from a full page of bands', () => {
  const sections = [0, 0, 1, 2, 3, 4, 5, 5, 6, 7, 7].map((shape, i) => ({
    shape,
    center: -1250 + i * 500,
  }));
  // Centres run -1250, -750, -250, 250, 750, … so the line at 500 falls
  // halfway between index 3 (shape 2) and index 4 (shape 3).
  const { from, to, t } = pickActiveBlend(sections, VIEWPORT);
  assert.equal(from, 2);
  assert.equal(to, 3);
  assert.equal(t, 0.5);
});
