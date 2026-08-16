import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildJourney } from '../src/engine/journey.js';

const universe = JSON.parse(readFileSync(new URL('../src/data/universe.json', import.meta.url)));
const journey = buildJourney(universe);

const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

test('the journey opens wide, ends wide, and visits every destination', () => {
  assert.equal(journey[0].kind, 'hero');
  assert.equal(journey.at(-1).kind, 'contact');

  const destinations = journey.filter((s) => s.kind === 'destination').map((s) => s.label);
  assert.deepEqual(destinations, [
    'Research',
    'Projects',
    'Publications',
    'Experience',
    'Network',
    'News',
  ]);
});

test('every destination carries a label, a link and a call to action', () => {
  for (const stop of journey.filter((s) => s.kind === 'destination')) {
    assert.ok(stop.label, 'a destination has no label');
    assert.match(stop.href, /^\/[a-z-]*\/$/, `${stop.label} has a suspect href`);
    assert.ok(stop.cta, `${stop.label} has no call to action`);
  }
});

test('there is travelling between destinations, but never a trek', () => {
  // A destination reached in one step is a cut, not a journey; one reached in
  // six is a page nobody finishes.
  let sinceLast = 0;
  const legs = [];
  for (const stop of journey.slice(1)) {
    sinceLast += 1;
    if (stop.kind === 'destination' || stop.kind === 'contact') {
      legs.push(sinceLast);
      sinceLast = 0;
    }
  }
  assert.equal(legs.length, 7, 'six destinations and the contact page');
  for (const [i, hops] of legs.entries()) {
    if (i === 0) continue; // the first destination opens the road
    assert.ok(hops >= 2 && hops <= 4, `leg ${i} takes ${hops} stops`);
  }
});

test('no two consecutive stops frame the same place', () => {
  for (let i = 1; i < journey.length; i += 1) {
    const moved = distance(journey[i - 1].position, journey[i].position);
    assert.ok(moved > 0.4, `stops ${i - 1} and ${i} are ${moved.toFixed(2)} apart`);
  }
});

test('every stop is a finite composition looking somewhere else', () => {
  for (const [i, stop] of journey.entries()) {
    for (const v of [...stop.position, ...stop.target]) {
      assert.ok(Number.isFinite(v), `stop ${i} has a non-finite coordinate`);
    }
    const d = distance(stop.position, stop.target);
    assert.ok(d > 0.5 && d < 20, `stop ${i} looks from ${d.toFixed(2)} away`);
  }
});

test('the journey is deterministic', () => {
  const again = buildJourney(universe);
  assert.deepEqual(journey, again);
});

test('the road stays inside the sky the regions occupy', () => {
  // The regions sit on a shell of about 5.2; a camera at 30 would be looking
  // at a speck, and nothing else would report it.
  for (const [i, stop] of journey.entries()) {
    const r = Math.hypot(...stop.position);
    assert.ok(r < 16, `stop ${i} sits at radius ${r.toFixed(2)}`);
  }
});

test('every destination arrives at a different region', () => {
  const arrivals = journey.filter((s) => s.region !== null).map((s) => s.region);
  assert.equal(new Set(arrivals).size, arrivals.length, 'two pages share a region');
  assert.equal(arrivals.length, 7, 'six destinations and contact');
});

test('the colour changes on arrival, not while travelling', () => {
  for (let i = 1; i < journey.length; i += 1) {
    if (journey[i].tint === journey[i - 1].tint) continue;
    const arrived = journey[i].kind === 'destination' || journey[i].kind === 'contact';
    assert.ok(arrived, `the tint changes at stop ${i}, which is only travelling`);
  }
});
