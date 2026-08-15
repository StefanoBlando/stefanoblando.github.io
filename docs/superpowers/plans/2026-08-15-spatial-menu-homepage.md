# Spatial Menu Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the homepage into eight stations of a camera journey through one stable particle field, move all reading onto section pages, and close every 404 with detail pages.

**Architecture:** One structure (`randomNetwork`), anchored in world space. Eight authored camera waypoints, interpolated by the already-tested plateau curve. The homepage carries only titles and links; content lives on `/research/`, `/projects/`, `/publications/`, `/experience/`, `/blog/`, `/network/` and their detail pages.

**Tech Stack:** Astro 5.14, Three.js 0.181, `node --test`, chrome-headless-shell over CDP for visual verification.

**Spec:** `docs/superpowers/specs/2026-08-15-spatial-menu-homepage-design.md`

---

## File Structure

**Created:**

| Path | Responsibility |
|---|---|
| `site/src/engine/waypoints.js` | The eight camera stations and their interpolation |
| `site/tests/waypoints.test.mjs` | Waypoint coverage and interpolation |
| `site/src/pages/research/index.astro` | Index of the four pillars |
| `site/src/pages/projects/[slug].astro` | 13 detail pages |
| `site/src/pages/publications/[slug].astro` | 6 detail pages |
| `site/src/pages/blog/[slug].astro` | 7 detail pages |
| `site/src/styles/stations.css` | Station typography and layout |
| `site/scripts/shoot.mjs` | Screenshots at fixed scroll positions, over CDP |

**Modified:**

| Path | Change |
|---|---|
| `site/src/engine/structure.js` | One generator; `layouts` becomes `positions` |
| `site/src/engine/swarm.js` | `setBlend` deleted; single position buffer |
| `site/src/engine/index.js` | Waypoint camera; body released into world space |
| `site/src/pages/index.astro` | Eleven bands become eight stations |
| `site/src/pages/research/[pillar].astro` | Receives the pillar content from the homepage |
| `site/tests/shapes.test.mjs` | Layout assertions become waypoint assertions |
| `site/src/styles/scene.css` | Band styles removed or repurposed |

**Deleted:** `scaleFree`, `trajectories`, `twoCommunities`, `smallWorld`, `corePeriphery`, `branchingGrowth`, `percolationFront` from `structure.js`. With one structure they are all unreachable, and this project deletes rather than leaves dormant (parent spec §5). Git holds them.

---

## Task 1: The waypoints module

**Files:**
- Create: `site/src/engine/waypoints.js`, `site/tests/waypoints.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
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
    // Inside the field, not on top of it and not lost outside it.
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
  // rather than look wrong, which is harder to notice.
  for (let i = 1; i < WAYPOINTS.length; i += 1) {
    const a = WAYPOINTS[i - 1].position;
    const b = WAYPOINTS[i].position;
    const moved = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    assert.ok(moved > 0.6, `waypoints ${i - 1} and ${i} are ${moved} apart`);
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
```

- [ ] **Step 2: Run it and watch it fail**

```bash
cd /home/stefano/Scrivania/WEBSITE/site && node --test tests/waypoints.test.mjs
```

Expected: every test fails on the missing module.

- [ ] **Step 3: Write the module**

```js
/**
 * The eight stations of the homepage, as camera compositions.
 *
 * The field no longer changes shape, so these are what make one station
 * different from the next: where you stand in the world and what you are
 * looking at. A waypoint is a composition, not a coordinate — the region it
 * frames, how full the frame is, and which side stays clear for the text.
 *
 * The numbers below are a starting point to be judged on screen, not derived.
 * `scripts/shoot.mjs` renders all eight; tune against those, not by reasoning.
 */

/** The field spans roughly a radius of 2.25 around the origin. */
export const WAYPOINTS = [
  // 1 Hero — outside the field, the whole body visible, text on the left.
  { id: 'hero', position: [1.6, 0.4, 5.6], target: [0.6, 0.0, 0.0] },
  // 2 Research — closing in, the body swinging to frame right.
  { id: 'research', position: [2.6, 0.9, 3.4], target: [0.3, 0.1, 0.2] },
  // 3 Projects — inside the near edge, looking back across the field.
  { id: 'projects', position: [1.4, -0.7, 1.9], target: [-0.4, 0.2, -0.6] },
  // 4 Publications — low and wide, the field overhead.
  { id: 'publications', position: [-1.7, -1.1, 2.4], target: [0.2, 0.3, -0.2] },
  // 5 Experience — a long diagonal through the middle.
  { id: 'experience', position: [-2.7, 0.6, 0.4], target: [0.4, -0.1, 0.3] },
  // 6 Network — above, looking down into the structure.
  { id: 'network', position: [-1.1, 2.4, -1.6], target: [0.1, -0.2, 0.1] },
  // 7 News — coming back out on the far side.
  { id: 'news', position: [1.2, 1.0, -3.3], target: [-0.2, 0.0, 0.4] },
  // 8 Contact — pulled back, the whole body again, mirrored from the hero.
  { id: 'contact', position: [3.4, -0.3, -4.6], target: [0.0, 0.0, 0.0] },
];

const clampIndex = (i) => Math.max(0, Math.min(WAYPOINTS.length - 1, i | 0));
const lerp3 = (a, b, t) => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

/** Straight-line interpolation between two stations. */
export function interpolateWaypoint(from, to, t) {
  const a = WAYPOINTS[clampIndex(from)];
  const b = WAYPOINTS[clampIndex(to)];
  return { position: lerp3(a.position, b.position, t), target: lerp3(a.target, b.target, t) };
}
```

- [ ] **Step 4: Run the tests**

```bash
cd /home/stefano/Scrivania/WEBSITE/site && node --test tests/waypoints.test.mjs
```

Expected: six passes. If "consecutive waypoints are actually different places" fails, two stations were authored too close — move one, do not relax the threshold.

- [ ] **Step 5: Commit**

```bash
cd /home/stefano/Scrivania/WEBSITE
git add site/src/engine/waypoints.js site/tests/waypoints.test.mjs
git commit -m "feat(engine): eight camera stations for the homepage journey"
```

---

## Task 2: One structure, and release the body

**Files:**
- Modify: `site/src/engine/structure.js`, `site/src/engine/swarm.js`, `site/tests/shapes.test.mjs`

- [ ] **Step 1: Reduce `structure.js` to one generator**

Delete `scaleFree`, `trajectories`, `twoCommunities`, `smallWorld`, `corePeriphery`, `branchingGrowth`, `percolationFront` and the `GENERATORS` array. Keep `randomNetwork`, `gaussian`, `mulberry32` and `assignByWedge`.

In `buildStructure`, replace the layouts line:

```js
  const positions = assignByWedge(randomNetwork(count, rand), owner, count);
```

Use `positions` where `layouts[0]` was read for the proximity threads (`const base = positions;`), and return `positions` in place of `layouts`. Update the file's header comment: it currently describes four layouts and a morph, which will no longer be true.

- [ ] **Step 2: Reduce `swarm.js` to one position buffer**

Replace the layout fields:

```js
    this.positions = this.structure.positions;
    this.current = Float32Array.from(this.positions);
```

Delete `this.layouts`, `this.target` and the whole `setBlend` method. In `update`, damp toward the fixed positions scaled by the breath:

```js
    for (let i = 0; i < this.current.length; i += 1) {
      this.current[i] = damp(this.current[i], this.positions[i] * this.breath, MORPH_RATE, dt);
    }
```

`MORPH_RATE` now only serves the breath. Rename it `SETTLE_RATE` and correct its comment, which currently explains a scroll-driven morph that no longer exists.

- [ ] **Step 3: Rewrite `shapes.test.mjs` against waypoints**

The layout assertions go; the tint assertion stays, keyed to waypoints:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildStructure } from '../src/engine/structure.js';
import { PRESETS, ACTIVE } from '../src/engine/palette.js';
import { WAYPOINTS } from '../src/engine/waypoints.js';

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

test('the field is deterministic for a given content set', () => {
  const a = buildStructure(universe, COUNT).positions;
  const b = buildStructure(universe, COUNT).positions;
  assert.deepEqual(Array.from(a), Array.from(b));
});

test('every station has a waypoint and a tint', () => {
  const page = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
  const stations = [...page.matchAll(/data-shape="(\d+)"/g)].map((m) => Number(m[1]));
  assert.equal(stations.length, WAYPOINTS.length, 'a station lost or gained its data-shape');

  const tints = PRESETS[ACTIVE].tints;
  assert.ok(tints.length >= WAYPOINTS.length, `${WAYPOINTS.length} stations, ${tints.length} tints`);
  for (const s of stations) {
    assert.ok(WAYPOINTS[s], `station ${s} has no waypoint`);
    assert.ok(tints[s], `station ${s} has no tint`);
  }
});
```

- [ ] **Step 4: Run the suite**

```bash
cd /home/stefano/Scrivania/WEBSITE/site && npm test
```

Expected: `blend.test.mjs` and `damping.test.mjs` and `sections.test.mjs` unchanged and passing; `waypoints` and the rewritten `shapes` passing. The station test fails until Task 3 rewrites the page — that is correct ordering, and it is the one failure allowed to stand between Task 2 and Task 3.

- [ ] **Step 5: Drive the camera from waypoints in `index.js`**

Replace the orbit block (`index.js:210-224`) with waypoint interpolation, and release the body.

```js
import { interpolateWaypoint } from './waypoints.js';
```

In `readShape`, keep the blend result and store it:

```js
    this.waypoint = { from, to, t };
```

In `loop`, replace the orbit and the body welding:

```js
    // The camera travels between authored stations; the field holds still in
    // world space. Welding the body to the camera, as the orbit build did,
    // makes travel impossible: the destination moves with you.
    const shot = interpolateWaypoint(this.waypoint.from, this.waypoint.to, this.waypoint.t);
    this.camDesired.set(shot.position[0], shot.position[1], shot.position[2]);
    this.camTargetDesired.set(shot.target[0], shot.target[1], shot.target[2]);

    // Damped so a fast scroll glides rather than snapping between stations.
    this.camPos.x = damp(this.camPos.x, this.camDesired.x + this.parallax.x * 0.22, 3.2, dt);
    this.camPos.y = damp(this.camPos.y, this.camDesired.y + this.parallax.y * 0.18, 3.2, dt);
    this.camPos.z = damp(this.camPos.z, this.camDesired.z, 3.2, dt);
    this.camLook.x = damp(this.camLook.x, this.camTargetDesired.x, 3.2, dt);
    this.camLook.y = damp(this.camLook.y, this.camTargetDesired.y, 3.2, dt);
    this.camLook.z = damp(this.camLook.z, this.camTargetDesired.z, 3.2, dt);

    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camLook);

    // The field is a place. It rotates slowly on its own and stays put.
    this.swarm.group.position.set(0, 0, 0);
    this.bodyYaw += dt * 0.05;
    this.swarm.group.rotation.set(0, this.bodyYaw, 0);
    this.swarm.group.updateMatrixWorld();
```

Add the scratch vectors in `init()` beside the other Three.js scratch objects, seeded from the first waypoint so the first frame is already composed:

```js
    this.waypoint = { from: 0, to: 0, t: 0 };
    this.camDesired = new THREE.Vector3(...WAYPOINTS[0].position);
    this.camTargetDesired = new THREE.Vector3(...WAYPOINTS[0].target);
    this.camPos = this.camDesired.clone();
    this.camLook = this.camTargetDesired.clone();
```

Delete `this.orbit`, the `smoothstep` distance ramp, `this.bodyOffset`, `this.bodyCenter`, `this.bodyPitch`, `this.bodyQuat`, `this.bodyEuler` and the `grow` scale — all of them exist to serve the welded body. Confirm nothing else reads them:

```bash
cd /home/stefano/Scrivania/WEBSITE/site && grep -n "orbit\|bodyOffset\|bodyCenter\|bodyPitch\|bodyQuat\|bodyEuler\|grow" src/engine/index.js
```

`bodyCenter` is also passed to the `Swarm` constructor as `offset`; check what `swarm.js` does with it and remove it there too if it only served the welded framing.

- [ ] **Step 6: Build**

```bash
cd /home/stefano/Scrivania/WEBSITE/site && npm run build 2>&1 | tail -4
```

Expected: build succeeds. The page still has eleven bands at this point; it will look wrong, and that is expected until Task 3.

- [ ] **Step 7: Commit**

```bash
cd /home/stefano/Scrivania/WEBSITE
git add site/src/engine site/tests/shapes.test.mjs
git commit -m "refactor(engine): one world, a travelling camera

The field stops morphing and is released from the camera's frame into world
space, because a journey needs a destination that does not move with you."
```

---

## Task 3: Eight stations

**Files:**
- Modify: `site/src/pages/index.astro`
- Create: `site/src/styles/stations.css`
- Modify: `site/src/styles/scene.css`

- [ ] **Step 1: Rewrite the page body**

Every band, list and paragraph goes. Eight stations, each a title and a link.

```astro
---
import Base from '../layouts/Base.astro';

const STATIONS = [
  { shape: 0, kind: 'hero' },
  { shape: 1, label: 'Research', href: '/research/', cta: 'Four connected pillars' },
  { shape: 2, label: 'Projects', href: '/projects/', cta: 'Research, built' },
  { shape: 3, label: 'Publications', href: '/publications/', cta: 'Papers and proceedings' },
  { shape: 4, label: 'Experience', href: '/experience/', cta: 'The academic path' },
  { shape: 5, label: 'Network', href: '/network/', cta: 'Co-authors and collaborators' },
  { shape: 6, label: 'News', href: '/blog/', cta: 'Recent updates' },
  { shape: 7, kind: 'contact' },
];
---

<Base
  title="Stefano Blando — AI Researcher & PhD Candidate"
  description="PhD candidate at Scuola Superiore Sant'Anna. Adaptive multi-agent systems, statistical verification, robust quantitative methods, and language models for economic and financial systems."
  scene={true}
  anchorBase=""
>
  <canvas id="universe" aria-hidden="true"></canvas>
  <div class="tint-wash" aria-hidden="true"></div>
  <div class="scrim" aria-hidden="true"></div>

  <main>
    {STATIONS.map((s) => (
      <section class={`station station-${s.kind ?? 'link'}`} data-shape={s.shape}>
        <div class="station-inner">
          {s.kind === 'hero' && (
            <>
              <p class="eyebrow"><span class="pip"></span>AI Researcher &amp; PhD Candidate</p>
              <h1>Stefano Blando</h1>
              <p class="lede">
                Adaptive multi-agent systems, statistical verification, and robust
                quantitative methods for economic and financial systems.
              </p>
              <p class="scroll-hint">Scroll to travel</p>
            </>
          )}

          {s.kind === undefined && (
            <>
              <p class="station-index">{String(s.shape).padStart(2, '0')}</p>
              <h2 class="station-title">{s.label}</h2>
              <a class="station-link" href={s.href}>{s.cta} →</a>
            </>
          )}

          {s.kind === 'contact' && (
            <>
              <p class="station-index">07</p>
              <h2 class="station-title">Contact</h2>
              <a class="station-link" href="mailto:stefano.blando@santannapisa.it">
                stefano.blando@santannapisa.it →
              </a>
              <ul class="social-row" aria-label="Social profiles">
                <li><a href="https://github.com/stefano-blando">GitHub</a></li>
                <li><a href="https://www.linkedin.com/in/stefano-blando/">LinkedIn</a></li>
                <li><a href="https://scholar.google.com/citations?user=dNbRRG0AAAAJ">Scholar</a></li>
              </ul>
            </>
          )}
        </div>
      </section>
    ))}
  </main>

  <script>
    // unchanged from the previous homepage — canvas, engine, diagnostics
  </script>
</Base>
```

Copy the existing `<script>` block across verbatim; it does not change.

- [ ] **Step 2: Write the station styles**

`site/src/styles/stations.css`:

```css
/*
 * A station is one screen of the journey: a title, a link, and a great deal of
 * deliberate emptiness. The field is the subject here, not the type.
 */
.station {
  position: relative;
  z-index: 10;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 7rem clamp(1.1rem, 5vw, 4.5rem);
}

.station-inner {
  width: 100%;
  max-width: 32rem;
}

.station-index {
  margin: 0 0 1rem;
  font-size: 0.7rem;
  letter-spacing: 0.28em;
  color: var(--muted);
}

.station-title {
  margin: 0 0 1.6rem;
  font-size: clamp(2.6rem, 7vw, 5rem);
  font-weight: 300;
  letter-spacing: -0.03em;
  line-height: 1;
  color: var(--paper);
}

.station-link {
  display: inline-block;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--line);
  color: var(--teal);
  font-size: 0.9rem;
  text-decoration: none;
  transition: color 200ms ease, border-color 200ms ease;
}

.station-link:hover {
  color: var(--gold);
  border-color: var(--gold);
}

.scroll-hint {
  margin-top: 3rem;
  font-size: 0.7rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--muted);
}

@media (max-width: 720px) {
  .station {
    min-height: 92vh;
    padding: 5rem 1.2rem;
  }
}
```

Import it in `Base.astro` beside the others. Then strip `scene.css` of everything that served the bands — `.band*`, `.work-list`, `.timeline`, `.card*`, `.topic-row`, `.pillar-*`, `.hero-*`, `.cta*` — keeping only what the shell and the scene still use: `body`, `#universe`, `.masthead`, `.tint-wash`, `.scrim`, `.eyebrow`, `.pip`, `.lede`, `.social-row`. Anything the section pages use must move to `static-backdrop.css` rather than be deleted:

```bash
cd /home/stefano/Scrivania/WEBSITE/site
grep -rno "class=\"[^\"]*\"" src/pages src/layouts src/components | sed 's/.*class="//;s/"//' | tr ' ' '\n' | sort -u > /tmp/classes-in-use.txt
head -60 /tmp/classes-in-use.txt
```

Delete only classes absent from that list.

- [ ] **Step 3: Build and count**

```bash
cd /home/stefano/Scrivania/WEBSITE/site && npm run build
grep -o 'data-shape="[0-9]"' dist/index.html | sort | uniq -c
echo "page bytes: $(wc -c < dist/index.html)"
```

Expected: eight stations, shapes 0–7, one each. The page should be dramatically smaller than the 20 KB the eleven-band version produced.

- [ ] **Step 4: Run the suite**

```bash
cd /home/stefano/Scrivania/WEBSITE/site && npm test
```

Expected: all pass, including the station/waypoint/tint test that was failing after Task 2.

- [ ] **Step 5: Commit**

```bash
cd /home/stefano/Scrivania/WEBSITE
git add site/src/pages/index.astro site/src/styles site/src/layouts
git commit -m "feat(site): the homepage becomes eight stations of a journey"
```

---

## Task 4: The screenshot instrument

Built before tuning, because the waypoints are compositions and cannot be judged by reasoning.

**Files:**
- Create: `site/scripts/shoot.mjs`

- [ ] **Step 1: Write the script**

A CDP driver that navigates, scrolls to each station's centre, and writes a PNG per station. It needs no dependency: Node 24 has a global `WebSocket`.

```js
/**
 * Screenshots the homepage at each station, over the DevTools protocol.
 *
 * The waypoints are compositions and there is no way to reason about whether
 * one is framed well. This renders all eight so they can be looked at.
 *
 * Start chrome first:
 *   chrome-headless-shell --no-sandbox --use-gl=angle --use-angle=swiftshader \
 *     --enable-unsafe-swiftshader --remote-debugging-port=9222 about:blank
 */
import { writeFileSync, mkdirSync } from 'node:fs';

const URL_ = process.argv[2] ?? 'http://localhost:4321/';
const OUT = process.argv[3] ?? 'shots';
mkdirSync(OUT, { recursive: true });

const targets = await (await fetch('http://127.0.0.1:9222/json/list')).json();
const target = targets.find((t) => t.type === 'page');
if (!target) throw new Error('no page target; is chrome running with --remote-debugging-port=9222?');

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve) => (ws.onopen = resolve));

let id = 0;
const pending = new Map();
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (!msg.id || !pending.has(msg.id)) return;
  const { resolve, reject } = pending.get(msg.id);
  pending.delete(msg.id);
  msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
};
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const n = ++id;
    pending.set(n, { resolve, reject });
    ws.send(JSON.stringify({ id: n, method, params }));
  });
const evaluate = async (expression) =>
  (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.value;
const settle = (ms) => evaluate(`new Promise((r) => setTimeout(r, ${ms}))`);

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: 1440, height: 900, deviceScaleFactor: 1, mobile: false,
});
await send('Page.navigate', { url: URL_ });
await settle(4000);

const stations = await evaluate(`
  [...document.querySelectorAll('[data-shape]')].map((el) => ({
    shape: el.dataset.shape,
    centre: Math.round(el.offsetTop + el.offsetHeight / 2 - window.innerHeight / 2),
  }))
`);

for (const s of stations) {
  await evaluate(`window.scrollTo(0, ${s.centre})`);
  // Long enough for the camera damping to arrive, which is the thing being judged.
  await settle(2200);
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  const name = `${OUT}/station-${s.shape}.png`;
  writeFileSync(name, Buffer.from(data, 'base64'));
  console.log(name);
}

ws.close();
```

- [ ] **Step 2: Run it**

```bash
cd /home/stefano/Scrivania/WEBSITE/site
CHROME=~/.cache/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-linux64/chrome-headless-shell
nohup $CHROME --no-sandbox --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader \
  --remote-debugging-port=9222 --window-size=1440,900 about:blank >/dev/null 2>&1 &
curl -s --retry 20 --retry-delay 1 --retry-connrefused -o /dev/null http://127.0.0.1:9222/json/version
node scripts/shoot.mjs http://localhost:4321/ /tmp/shots
```

Expected: eight PNGs. **Look at every one.** For each, ask: is the field in frame, is the left third clear for the text, and does it look different from its neighbours? Tune `waypoints.js` and re-run until all eight hold. This is the task's real work; the script is only the instrument.

- [ ] **Step 3: Commit**

```bash
cd /home/stefano/Scrivania/WEBSITE
git add site/scripts/shoot.mjs site/src/engine/waypoints.js
git commit -m "tooling(site): screenshot each station, and tune the waypoints against it"
```

---

## Task 5: `/research/` and the pillar content

**Files:**
- Create: `site/src/pages/research/index.astro`
- Modify: `site/src/pages/research/[pillar].astro`

- [ ] **Step 1: Read what the pillar page holds today**

```bash
cd /home/stefano/Scrivania/WEBSITE/site && cat src/pages/research/\[pillar\].astro
```

- [ ] **Step 2: Write the index**

`/research/` lists the four pillars from `universe.json`, each with title, description and a link to its page, using `Base` with `scene={false}` and the `.page` / `.index-list` styles the other index pages use.

- [ ] **Step 3: Move the homepage's pillar content onto the pillar pages**

Each `/research/<pillar>/` gains what the homepage band used to carry: `detailed_text`, the topic row, and the publication and project lists for that cluster, with the same markup the band used (`work-list`, `work-group-title`, `topic-row`). Those styles move from `scene.css` to `static-backdrop.css` as part of Task 3 Step 2.

- [ ] **Step 4: Build and verify all five pages**

```bash
cd /home/stefano/Scrivania/WEBSITE/site && npm run build
grep -c 'index-title' dist/research/index.html
for p in multi-agent statistical-verification robust-quant text-analytics; do
  echo -n "$p: "; grep -o 'work-title' "dist/research/$p/index.html" | wc -l
done
```

Expected: four pillars on the index, and each pillar page carrying its own works — 3, 4, 5 and 4 respectively, matching `universe.json`.

- [ ] **Step 5: Commit**

```bash
cd /home/stefano/Scrivania/WEBSITE
git add site/src/pages/research
git commit -m "feat(site): research index, and the pillar content moved off the homepage"
```

---

## Task 6: The 26 detail pages

**Files:**
- Create: `site/src/pages/projects/[slug].astro`, `site/src/pages/publications/[slug].astro`, `site/src/pages/blog/[slug].astro`

- [ ] **Step 1: Write the project detail route**

```astro
---
import { getCollection, render } from 'astro:content';
import Base from '../../layouts/Base.astro';

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return projects.map((project) => ({ params: { slug: project.id }, props: { project } }));
}

const { project } = Astro.props;
const { Content } = await render(project);
const links = project.data.links.filter((l) => l.url);
---

<Base title={`${project.data.title} — Stefano Blando`} description={project.data.summary} scene={false}>
  <main class="page">
    <p class="index-meta">Project</p>
    <h1>{project.data.title}</h1>
    <p class="page-lede">{project.data.summary}</p>

    <ul class="tag-row">{project.data.tags.map((tag) => <li>{tag}</li>)}</ul>

    {links.length > 0 && (
      <ul class="index-links">
        {links.map((link) => <li><a href={link.url}>{link.name ?? 'Link'}</a></li>)}
      </ul>
    )}

    <article class="prose"><Content /></article>

    <p class="back-link"><a href="/projects/">← All projects</a></p>
  </main>
</Base>
```

- [ ] **Step 2: Write the publication and blog routes**

The same shape. The publication page additionally renders `type`, `venue`, the author list and the abstract, and the blog page renders the formatted date. Neither may emit a link without a url — `doi` and `url_pdf` are empty on all six publications, so an unguarded template would produce six dead links.

- [ ] **Step 3: Add prose styles**

`.prose` in `static-backdrop.css`: measure, line height, heading scale, list and link colours for rendered Markdown bodies.

- [ ] **Step 4: Build and count**

```bash
cd /home/stefano/Scrivania/WEBSITE/site && npm run build
echo "projects: $(ls dist/projects | grep -v index.html | wc -l)"
echo "publications: $(ls dist/publications | grep -v index.html | wc -l)"
echo "blog: $(ls dist/blog | grep -v index.html | wc -l)"
```

Expected: 13, 6, 7.

- [ ] **Step 5: Commit**

```bash
cd /home/stefano/Scrivania/WEBSITE
git add site/src/pages site/src/styles/static-backdrop.css
git commit -m "feat(site): detail pages for every project, publication and post"
```

---

## Task 7: Verify

- [ ] **Step 1: Suite and clean build**

```bash
cd /home/stefano/Scrivania/WEBSITE/site && npm test && rm -rf dist && npm run build 2>&1 | tail -3
```

- [ ] **Step 2: Every internal link resolves to a built page**

The homepage is now nothing but links, so a broken one is the whole page. This is the assertion the design most needs.

```bash
cd /home/stefano/Scrivania/WEBSITE/site
node -e "
const { readFileSync, existsSync, readdirSync, statSync } = require('fs');
const { join } = require('path');
const pages = [];
(function walk(d) {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && pages.push(p);
  }
})('dist');
let bad = 0;
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  for (const m of html.matchAll(/href=\"(\/[^\"#?]*)\"/g)) {
    const href = m[1];
    if (/\.(pdf|png|jpe?g|webp|svg|xml|txt|js|css)\$/i.test(href)) continue;
    const target = join('dist', href, 'index.html');
    const asFile = join('dist', href);
    if (!existsSync(target) && !existsSync(asFile)) {
      console.log('BROKEN', href, 'in', page);
      bad++;
    }
  }
}
console.log(bad === 0 ? 'every internal link resolves' : bad + ' broken links');
process.exit(bad === 0 ? 0 : 1);
"
```

Expected: `every internal link resolves`. This is the step that proves the 404 debt is closed.

- [ ] **Step 3: Index and detail pages still ship no 3D**

```bash
cd /home/stefano/Scrivania/WEBSITE/site
for p in projects publications experience blog network research; do
  n=0
  for s in $(grep -o 'src="/_astro/[^"]*\.js"' "dist/$p/index.html" | sed 's/src="//;s/"//'); do
    grep -q "WebGLRenderer" "dist$s" 2>/dev/null && n=$((n+1))
  done
  echo "/$p/ three.js chunks: $n"
done
```

Expected: `0` everywhere.

- [ ] **Step 4: Shoot all eight stations and look at them**

```bash
cd /home/stefano/Scrivania/WEBSITE/site && node scripts/shoot.mjs http://localhost:4321/ /tmp/shots-final
```

Look at each. Report honestly which stations are well framed and which are not.

- [ ] **Step 5: Report**

Test results, page count, the link check, the bundle sizes, and the screenshots. State plainly anything left undone.
