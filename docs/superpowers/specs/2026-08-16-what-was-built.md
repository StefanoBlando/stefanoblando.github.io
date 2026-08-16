# What Was Built — State of the Site

**Date:** 2026-08-16
**Status:** Describes the site as it stands, not a plan.
**Reading order:** start here. The three earlier documents describe designs that
were each superseded on the same day; they are kept for the reasons they record,
not as descriptions of the site.

| Document | Still true? |
|---|---|
| `2026-08-14-spatial-3d-portfolio-design.md` | Context and constraints yes; the engine sections no |
| `2026-08-15-homepage-sections-and-index-pages-design.md` | §6 and §7 (pages, content pipeline) yes; §3–§5 no |
| `2026-08-15-spatial-menu-homepage-design.md` | No. Superseded within hours |

## 1. The homepage

One cloud of particles that takes **eight shapes**, one per page: a random
network, scale-free hubs, a core and periphery, stochastic trajectories, a
branching growth, a small-world ring, a percolation front, two communities.
Scrolling morphs the cloud from one into the next; the camera only turns, three
quarters of a revolution across the whole journey.

Mid-morph the cloud disperses — a radial swell at the midpoint, because a
straight interpolation per particle looked mechanical — and the brightness dips
with it, so arriving somewhere looks like arriving.

Each page carries a title, a link and nothing else. The reading is on the pages
those links point at.

## 2. The scroll

**Lenis**, with the reference site's own settings, read out of its shipped
bundle rather than guessed: `duration: 1.1`, easing
`t => Math.min(1, 1.001 - 2^(-10t))`, `smoothWheel`, and skipped entirely under
`prefers-reduced-motion`.

Lenis drives the window's real scroll, so `window.scrollY` is already the
smoothed value and the engine reads the shape straight off it.

**This took three attempts, and the first two are worth not repeating.** A
hand-rolled damped transform missed because it smoothed the wrong layer. A
stepper that advanced one page per three gestures missed because it was
imitating something the reference does not do — its scroll never snaps. The
feel comes from the easing curve over tall sections.

## 3. What is deliberately not here

Recorded because each was built, judged, and removed:

- **A camera travelling between scattered clusters.** Seven topologies placed
  around a sky with the camera flying between them. It gave confusing jumps and
  seven small bodies that read as debris.
- **A walk along the graph's edges**, stopping at works. Same problem.
- **Discrete page snapping.** See §2.
- **Node picking.** Clicking an individual particle to open a work has never
  been built and remains out of scope.

The generators for those layouts all survive — they are the eight shapes now.

## 4. Content

The Hugo tree was **copied** into `site/src/content/` and normalised by
`scripts/migrate-content.mjs`, not read in place. From that copy onward the Hugo
tree is legacy: editing `content/` changes nothing that ships.

The script is the record of what changed — `url_*` folded into `links[]`, Hugo
Blox names made plain, empty placeholders dropped by measurement, language
prefixes stripped, `relref` shortcodes turned into paths. Re-running it
regenerates the copy, so a wrong rule is fixed by editing the rule.

`build-universe.mjs` reads the same copy, so the scene and the pages cannot
describe different work. Pillars are data in `src/data/pillars.yaml`; each
publication declares its own `pillar:`.

## 5. Pages

37 built. Every internal link resolves — 345 checked.

| Route | |
|---|---|
| `/` | the eight-shape journey |
| `/research/` + 4 pillars | |
| `/projects/` + 13 details | card grid over the migrated cover images |
| `/publications/` + 6 details | a bibliography: no cards, only one has an image |
| `/blog/` + 7 details | card grid |
| `/experience/`, `/network/` | the co-author graph, off the CDN d3 global |

**Content pages ship no 3D JavaScript**, verified per page. The homepage is
about 149 KB gzip, inside the 150–200 KB the parent spec predicted.

Type is Fraunces italic and Instrument Sans, both of which the Hugo site already
self-hosted, with a monospace for anything that is instrument output.

## 6. Still missing, and why it matters

- **Italian.** The 54 `.it.md` files are migrated and present but nothing routes
  them. The live Hugo site is bilingual, so **there can be no cutover until this
  exists.** This is the blocking item.
- **Pagefind.** No search.
- **The cutover itself.** `netlify.toml` still builds Hugo and publishes
  `public/`. Nothing built here is live.

## 7. Two traps this repository sets

Both cost real time on 2026-08-15 and neither is a bug in the code.

- **A long-running dev server goes stale.** It served a stylesheet 1000 bytes
  out of date, and later failed a module with `504 (Outdated Optimize Dep)`
  after a dependency was installed — which stopped the engine from starting at
  all and looked exactly like a broken scene. After `npm install`, restart the
  dev server, and `rm -rf node_modules/.vite` if anything looks impossible.
- **The Astro compiler reads script tags out of comments.** Writing a
  `<script src="…">` inside a comment in a `.astro` file makes Vite try to
  resolve it as a dependency.

## 8. The reference bundle

`/home/stefano/Scrivania/portfolio-v2-archivio/_nuxt/` holds the reference
site's compiled bundle. It is a studio's proprietary code and is not licensed
for reuse; it stays out of this repository. Reading it to learn which libraries
a site uses is ordinary, and that is where §2's three constants came from.

The `*-engine.js` files beside it are **not** the reference's code — they are
the previous prototype's own attempts at imitating it.
