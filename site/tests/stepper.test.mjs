import test from 'node:test';
import assert from 'node:assert/strict';

// createStepper binds listeners on construction. A stub is enough: the
// pacing, not the plumbing, is what these tests are about.
const listeners = new Map();
globalThis.window = {
  addEventListener: (name, fn) => listeners.set(name, fn),
  removeEventListener: (name) => listeners.delete(name),
};

const { createStepper } = await import('../src/engine/stepper.js');

const wheel = (delta) => listeners.get('wheel')({ deltaY: delta, preventDefault() {} });
/** Runs a flight to completion in sixty-per-second slices. */
const settle = (stepper, seconds = 3) => {
  for (let i = 0; i < seconds * 60; i += 1) stepper.update(1 / 60);
};

test('one or two gestures are not enough to leave the page', () => {
  const stepper = createStepper({ pages: 8 });
  wheel(120);
  assert.equal(stepper.index, 0, 'a single notch moved the page');
  wheel(120);
  assert.equal(stepper.index, 0, 'two notches moved the page');
  stepper.destroy();
});

test('three gestures advance exactly one page', () => {
  const stepper = createStepper({ pages: 8 });
  wheel(120);
  wheel(120);
  wheel(120);
  assert.equal(stepper.index, 1, 'three notches should arrive at the next page');
  settle(stepper);
  assert.equal(stepper.position, 1);
  stepper.destroy();
});

test('a flight cannot be hurried by scrolling harder', () => {
  // This is the whole point: the pace belongs to the site, not the device.
  const stepper = createStepper({ pages: 8 });
  wheel(400);
  assert.equal(stepper.index, 1);

  for (let i = 0; i < 40; i += 1) wheel(400);
  assert.equal(stepper.index, 1, 'input during a flight moved the page');

  settle(stepper);
  assert.equal(stepper.position, 1);
  stepper.destroy();
});

test('the flight takes its own time and eases at both ends', () => {
  const stepper = createStepper({ pages: 8 });
  wheel(400);

  const quarter = [];
  for (let i = 0; i < 60; i += 1) {
    stepper.update(1 / 60);
    quarter.push(stepper.position);
  }

  // Eased: the first tenth of the flight covers less ground than the middle.
  const early = quarter[5] - quarter[0];
  const middle = quarter[35] - quarter[30];
  assert.ok(middle > early * 2, `middle ${middle} should outpace the start ${early}`);

  // And it is still monotone: a page never slides backwards on the way.
  for (let i = 1; i < quarter.length; i += 1) {
    assert.ok(quarter[i] >= quarter[i - 1], `position went backwards at ${i}`);
  }
  stepper.destroy();
});

test('reversing direction discards the push already accumulated', () => {
  const stepper = createStepper({ pages: 8 });
  wheel(300);
  wheel(-300);
  assert.equal(stepper.index, 0, 'opposite pushes should cancel, not add up');
  stepper.destroy();
});

test('the journey does not run past either end', () => {
  const stepper = createStepper({ pages: 3 });
  wheel(-600);
  assert.equal(stepper.index, 0);

  for (let i = 0; i < 10; i += 1) {
    wheel(600);
    settle(stepper);
  }
  assert.equal(stepper.index, 2, 'it should stop at the last page');
  stepper.destroy();
});

test('reduced motion arrives without a flight', () => {
  const stepper = createStepper({ pages: 8, reducedMotion: true });
  wheel(400);
  assert.equal(stepper.index, 1);
  assert.equal(stepper.position, 1, 'there should be nothing left to animate');
  assert.equal(stepper.flying, false);
  stepper.destroy();
});

test('goTo jumps anywhere and reports the pages it passes', () => {
  const seen = [];
  const stepper = createStepper({ pages: 8, onChange: (p) => seen.push(p) });
  stepper.goTo(5);
  settle(stepper);
  assert.equal(stepper.position, 5);
  assert.ok(seen.length > 30, 'the flight should report continuously, not once');
  assert.ok(
    seen.some((p) => p > 1 && p < 4),
    'the flight should pass through the pages between, not cut to the end',
  );
  stepper.destroy();
});
