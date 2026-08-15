# Spatial 3D Research Portfolio — Design Spec

**Date:** 2026-08-14
**Status:** Phase 1 built. Revised 2026-08-15 to describe what was actually
implemented, which diverged substantially from the original design — see §5.
**Scope:** Full site replacement. Hugo Blox is retired; Astro becomes the site engine.
Content, assets and curated relationships are migrated from the current repo.

## 1. Context and Goals

The current site is a mature Hugo Blox academic site: bilingual (`/en/`, `/it/`), with
publication/project/blog pages, Pagefind full-text search, and deploys to Netlify and
GitHub Pages. It works, but the design and interaction model are to be replaced entirely.

A prototype lived in `portfolio-v2/` (archived out of the repository on 2026-08-15,
since most of its weight was third-party material downloaded from the reference site) (12 WebGL engines, 11 of them dead code). Only
`index.html` + `styles.css` + `fplus-engine.js` are wired. The prototype hardcodes its
content inline and already drifted from reality: it lists 4 publications and 6 projects
where the repo has 6 and 13.

**Visual reference:** fplus.it — dark cosmic field, caustic nebula shader, dense particle
network, teal/gold palette. Target is "FPlus, or better".

**Cinematic reference:** hubtown.co.in — continuous scroll-driven travel through 3D space,
zoom into a cluster, free clicking on nodes, zoom out, fly to the next.

**Success criteria:**

- A dense living particle network is on screen essentially always; content nodes are a
  sparse, visually distinct minority embedded in it.
- Scrolling out always returns to the whole system in motion — not to a generic backdrop.
- Inside a cluster, any node is clickable in any order. Scroll never fights click.
- Clicking a node shows *that* node's content. (Today it does not — see §3.)
- Content pages ship zero 3D JavaScript.
- Nothing regresses: bilingual, per-item pages, blog, full-text search all survive.

**Non-goals:** the co-author network visualization (`assets/js/research-network/`) is a
separate asset with its own page and tests. It is migrated as-is, not merged into the
universe engine.

## 2. Why the current prototype cannot get there

Recorded because these are the specific defects the new engine must not reproduce.

- **No node identity.** `fplus-engine.js:560` dispatches a raw point index from a 220-point
  cloud; `index.html:541` resolves it with `cData.nodes[pointIndex % cData.nodes.length]`.
  The modulo makes clicked content arbitrary. This is the headline bug.
- **Frame-rate–dependent motion.** `fplus-engine.js:568` (`this.time += 0.015`) and `:575`
  (`position.z += (target - z) * 0.06`) ignore delta time. On a 120 Hz display everything
  runs twice as fast as on 60 Hz. This is the main reason the animation reads as unstable.
- **Depth cues disabled.** `sizeAttenuation: false` at `:267` keeps points the same screen
  size at any distance, destroying the primary depth signal in a scene whose entire premise
  is movement through space.
- **Everything additive.** Points (`:273`) and lines (`:300`) use `AdditiveBlending`, which
  never occludes. The result is always suspended sprites, never objects.
- **No post-processing possible.** Three.js r128 is loaded as a CDN global
  (`index.html:14`); addons are separate files and are not loaded. Bloom and DOF are
  unreachable without changing how Three.js is delivered.
- **CPU line rebuild every frame** (`:601-616`) — the first thing to break at higher density.
- **Corridor layout.** The abandoned `pure-spatial-engine.js:25-50` places clusters along
  z from 0 to −105. Pulling back never reveals the whole system, only separate rooms in a row.

## 3. Architecture

**Astro, static output**, deployed to the existing Netlify pipeline.

Five typed content collections — `publications`, `projects`, `blog`, `events`, `authors` —
inheriting the existing academic frontmatter (`title`, `authors`, `doi`, `abstract`,
`publication_types`, `tags`, `links[]`, `url_pdf`, `url_code`) under a validation schema.
Bilingual routing by directory (`/en/`, `/it/`), with `.it.md` files mapped onto the same keys.

Astro is chosen because it is Vite-based: Three.js becomes a local, current, tree-shaken
dependency with post-processing addons available. The r128-from-CDN problem and the
unreachable-bloom problem are resolved structurally rather than worked around.

**Content is the single source of truth.** The 3D universe is generated from the collections
at build time into a `universe.json` (clusters, nodes, edges, seeded positions). The engine
consumes that artifact and knows nothing about Markdown. Adding a paper reorganizes the
universe with no duplicated data.

**Layering:** the scene is a background layer; all content is real semantic DOM above it.
This is what keeps the design and indexability compatible — crawlers and screen readers get
an ordinary document, the visitor gets a journey.

The 3D island loads only where it is used. Publication, project and blog pages stay static
and light.

Pagefind is unchanged: it indexes built HTML and is generator-agnostic.

## 4. The universe model

**One body, reactive to the document.** The scene is a backdrop, not a stage. The page
scrolls normally; the constellation morphs toward whichever `[data-shape]` section is
nearest the centre of the viewport, using the reference's own weighting — a dead zone of
40% of the viewport, then a linear falloff over another 50%. The wide dead zone is what
stops the topology flickering while a section slides past.

**Particles belong to works.** Each of the 350 particles is assigned to one of the 16 real
works. Wiring is computed once and holds across every layout:

- **proximity threads** through the resting network (threshold 0.72, uncapped, ~1670
  edges) — the web reads by accumulation of faint additive threads, not by any one of
  them being bright;
- **bridges** between works that genuinely share a research topic (26 of them).

Tags naming a project category (`Research`, `Hackathon`, `Side Quest`) or a tool
(`Python`, `R`, `Streamlit`, …) are excluded from bridge derivation. A shared programming
language is not a shared idea, and an edge drawn from one would make the graph assert
something false about the work.

**Five layouts**, all complex-system structures rather than geometric solids, each compact
and space-filling so the threads stay short:

| # | Layout | Section |
|---|---|---|
| 0 | random network | hero, research lead-in |
| 1 | scale-free hubs, preferential attachment | Adaptive Multi-Agent Systems |
| 2 | ensemble of stochastic trajectories | Statistical Verification |
| 3 | two communities joined by a thin bridge | Robust Quantitative Methods |
| 4 | small-world ring with shortcuts | Text Analytics and Language Models |

Works occupy contiguous wedges of each structure, so a work stays a recognisable body
through every morph.

## 5. What changed from the original design, and why

Recorded because the divergence is large and the reasons matter more than the outcome.

**The pinned stage and the virtual scroll track are gone.** The original design pinned a
100vh viewport and drove a camera from a 700vh empty track. It was hard to follow: nothing
could be read while scrolling. The reference drives its scene from real content sections,
and that structure suits an academic site far better — the content is the page again.

**Node picking, labels, the inspector panel and the content-node meshes are gone.** With
the works listed as readable rows in the sections, a parallel interactive layer inside the
scene was redundant, and the labels cluttered the frame. Five engine modules were deleted
outright rather than left dormant.

**The camera orbits instead of diving.** It sweeps three quarters of a turn across the
page, closing from 5.9 to 3.3 over the first fifth. The body rides in the camera's frame,
so it holds its place on screen while the world's dust and smoke sweep past it. Fixing the
body in world space instead makes it swing across the view and the composition never
settles.

**Colour shifts per section** — threads, points, smoke, the readability scrim and the
background wash all move together. Tinting only the constellation reads as a glitch rather
than as a change of light.

**Two overlay layers, not one.** A bottom-anchored wash carries the section colour at full
strength; a separate side scrim stays near the page background and only takes a fifth of
the tint. Merging the two jobs into one layer paints the text side with a colour cast.

**One trade-off was tested in both directions and settled by preference.** Making the
bridges legible (accent colour, higher intensity) turns the scene into a diagram; the
reference's restraint keeps threads uniform and quiet. The quiet version was kept, which
means the topic bridges are present in the structure but not distinguishable by eye.

## 6. Engine components

Single canvas, single delta-time loop, independent parts under `site/src/engine`:

- **`swarm`** — the constellation: points and threads morphing between layouts. Morph runs
  on the CPU and rewrites both buffers each frame (~12k floats, well under a millisecond);
  drift stays on the GPU as a pure function of position, so thread endpoints follow their
  points with no extra work.
- **`structure`** — layouts, particle-to-work assignment, and the wiring described in §4.
- **`sections`** — pure, tested: which layout the document is asking for, and how strongly.
- **`ambient-layer`** — the domain-warped smoke veil and the volumetric dust. The dust is
  invisible to the main camera by design: it is rendered only by the trail composer.
- **`postfx`** — two composers. Dust accumulates through an afterimage pass, which is what
  produces the fluid quality; the main chain is render → bloom → a finishing pass adding
  the trails, an RGB split, a contrast lift and grain, then sRGB encoding.
- **`palette`** — six presets in one module; `scripts/build-palette.mjs` generates the CSS
  variables so scene and stylesheet cannot drift apart.
- **`damping`** — frame-rate independent throughout.

Two failures worth recording, both found by measurement rather than by eye:

- The finishing pass lifts contrast around a pivot. At a pivot of 0.5 it crushed everything
  dimmer than mid grey to black and erased the entire thread web. The pivot is now 0.28.
- Dropping `OutputPass` when the chain was rewritten removed the linear→sRGB conversion.
  The whole image rendered about five times too dark; bright points survived it and faint
  threads did not. The conversion now lives in the finishing pass.

## 7. Content migration

Verified inventory: **62 Markdown files**, fully translated.

| Collection | EN | IT |
|---|---|---|
| publications | 6 (+ index) | 6 (+ index) |
| projects | 13 (+ index) | 13 (+ index) |
| blog | 8 | 8 |
| events | 1 | 1 |
| authors | 1 | 1 |

Migration tasks: map Hugo Blox frontmatter onto collection schemas; port the pillar block
from `content/_index.md` into structured data; add the pillar field to publications; rename
`content/publications/network crash prediction` (spaces in directory name) to a clean slug,
preserving the existing public URL `/publications/network-crash-prediction/`; carry over
`assets/` media; migrate the co-author network page with its tests.

## 8. Degradation and error handling

The content is in the DOM and the scene sits above it, so a failed scene leaves the site
whole and readable.

- **Build fails loudly** on schema violations. A publication missing its pillar must not
  vanish silently from the universe and leave a half-empty cluster. A broken build beats a
  site that lies.
- **No WebGL, or lost context** (`webglcontextlost`, a real event on mobile and long
  sessions) → fall back to the 2D editorial presentation without a page reload.
- **Weak device** → reduced particle count, post-processing off. Detected, not guessed.
- **`prefers-reduced-motion`** → static composition.
- **Missing Italian translation** → explicit fallback to English, never a 404.
  `check:i18n` is retained.

## 9. Testing

Reuses the existing habit (`node --test`, per `package.json`).

- **Graph construction** — deterministic for a given content set; every work in exactly one
  cluster; no orphan nodes; every link resolves. *(Not yet automated: currently verified by
  one-off checks during the build.)*
- **Section selection** — the weighting curve: a centred section wins outright, the dead
  zone holds it through the slide, weight falls to zero beyond the falloff, and a
  zero-height viewport does not divide by zero.
- **Camera damping** — delta-time independence, asserted rather than eyeballed. This is
  precisely the current defect and is cheap to test.

Rendering quality is judged by looking at it on localhost.

## 10. Performance budget

- **Content pages: zero 3D JavaScript.** This is the large win — today every page pays for
  the full theme.
- **Homepage:** Three.js dominates. Honestly stated, expect roughly 150–200 KB gzip with
  post-processing even after tree-shaking. Loaded as an island, after content, only there.

Measured against a real build on localhost before tuning.

## 11. Delivery order

**Engine first.** The 3D universe is the novel, risky part; the content migration is known
work with no surprises. Building the engine first means an unconvincing aesthetic is
discovered before 62 files have been moved.

**Phase 1 — Engine. Done (commit 99df5bb).** Delivered against real content rather than
fixtures: `scripts/build-universe.mjs` derives 4 pillars, 16 works and 6 degrees from the
existing Hugo tree, the last read from `data/authors/me.yaml`.

*Original plan, kept for the record:* A minimal Astro shell (for the Vite pipeline and a
current local Three.js), the five engine modules, the journey state machine and the HUD,
driven by a hand-authored `universe.json` that mirrors the real 16 nodes and 4 pillars.
Judged on localhost until the look holds.
*Exit criteria:* reads as FPlus or better; clicking a node opens that node's content;
motion identical at 60 and 120 Hz; bundle measured against §10.

**Phase 2 — Content parity. Not started, and now the blocking work.** Every one of the 16
work links on the homepage points at `/publications/…` or `/projects/…`, which do not
exist: 16 live 404s. Also outstanding: `doi` and `url_pdf` are empty on all six
publications, so the thing a visitor most wants — the PDF — is not reachable from the data.

 Collections and schemas, `/en/` `/it/` routing, the 62 files,
page templates, the co-author network page with its tests, Pagefind, and URL parity with the
current site. The `pillar:` field is added to publications, and the fixture `universe.json`
is replaced by the build-time generated one.
*Exit criteria:* every URL the current site serves still resolves; i18n sync check passes.

**Phase 3 — Cutover.** Netlify publish directory and build command switched, redirects
verified, Hugo retired.

Each phase gets its own implementation plan.

## 12. Deferred

- Deriving edge topology from real inter-work relationships (shared co-authors, methods)
  rather than authored placement. Sensible later; not the foundation.
- Per-publication OpenGraph image generation at build.
- `ScholarlyArticle` JSON-LD with DOI and ORCID.

## 13. Notes

`STATUS.md` and `TODO.md` are local tracking files and must not be pushed.
