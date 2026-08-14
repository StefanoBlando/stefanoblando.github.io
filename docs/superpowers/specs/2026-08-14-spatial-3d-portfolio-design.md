# Spatial 3D Research Portfolio — Design Spec

**Date:** 2026-08-14
**Status:** Approved in brainstorming (terminal-only session, no visual companion)
**Scope:** Full site replacement. Hugo Blox is retired; Astro becomes the site engine.
Content, assets and curated relationships are migrated from the current repo.

## 1. Context and Goals

The current site is a mature Hugo Blox academic site: bilingual (`/en/`, `/it/`), with
publication/project/blog pages, Pagefind full-text search, and deploys to Netlify and
GitHub Pages. It works, but the design and interaction model are to be replaced entirely.

A prototype lives in `portfolio-v2/` (12 WebGL engines, 11 of them dead code). Only
`index.html` + `styles.css` + `fplus-engine.js` are wired. The prototype hardcodes its
content inline and already drifted from reality: it lists 4 publications and 6 projects
where the repo has 7 and 13.

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

**Two populations, always co-present:**

1. **Dense field** — several hundred anonymous particles forming the living network. This is
   the FPlus aesthetic. Visible at all times; provides local texture when zoomed in.
2. **Content nodes** — the real works (7 publications + the 10 pillar-mapped projects = 17),
   embedded in the field but clearly distinct (larger, brighter, identified). These alone are
   interactive.

Seen wide, the field reads as one pulsing complex system with the works standing out as
brighter hubs. Zoomed into a region, that region's works become legible and selectable.

**One bounded volume, not a corridor.** The four macro-clusters are dense regions inside a
single network that the camera orbits and dives into. This is required by the rhythm below:
pulling back must reveal *the same system from a new angle*.

**Macro-clusters are the four research pillars**, already authored in `content/_index.md`
with `topics:` and an explicit `projects:` slug list:

| Macro-cluster | Mapped projects |
|---|---|
| Adaptive Multi-Agent Systems | risk-sentinel, multi-agent-orchestration, real-estate-ai-agent |
| Statistical Verification | island-model-smc |
| Robust Quantitative Methods | robust-portfolio-optimization, network-crash-prediction, gas-network-risk-forecasting |
| Text Analytics and Language Models | nlp-semantic-network-analysis, peft-finetuning, rag-chatbot |

Publications and projects of the same pillar sit together and are linked: a paper and the
project implementing it are one intellectual object and must not be split by content type.

**Cluster balance is a design constraint, not an outcome.** By projects alone the pillars are
3 / 1 / 3 / 3: Statistical Verification would render as a nearly empty region. The publication
assignment must correct this — several SMC papers (`island-model-smc`, `ks-model-smc`,
`agentic-llm-formalization`) belong there and bring it to parity. Balance must be verified
after assignment and before positions are tuned; a lopsided pillar is a visible flaw.

**Required content change:** the 7 publications do not declare a pillar. A curated `pillar:`
frontmatter field (values: the four pillar slugs) must be added to 7 files, in both languages.
Tags cannot substitute — there are 77 distinct
tags across ~20 items, mixing three incompatible axes (research topic, project category
`Research`/`Hackathon`/`Side Quest`, and technology). Automatic clustering on that vocabulary
would produce noise.

**Side Quests** (`advanced-recommender-system`, `ai-photo-editor`, `pokenexus` — the 3 of 13
projects with no pillar) stay out of the research constellation and live on the projects page.

## 5. Journey and interaction

**Rhythm:** wide field → descend into a region → rise back to the wide field → descend into
the next. The overview returns at every transition.

**Chapters:** `00` whole network → `01-04` the four pillars → `05` academic path →
`06` skills → `07` contact.

**State machine:** `traveling` → `at-cluster` → `node-open`.

Scroll governs *which chapter*. Click governs *which node*, in any order, with no forced
sequence. Continuing to scroll closes the open node and resumes the climb out. The two inputs
never contend because they act on different axes.

**Node opening — short drift.** The camera makes a small move toward the chosen node (not a
full flight) while the node expands and the others attenuate; the info panel enters from the
side. Full camera flights per click were rejected: with several nodes per cluster, exploration
would become a sequence of waits, and repeated large moves risk motion sickness.

Node panels are previews. They link through to the real, static, citable page
(`/en/publications/<slug>/`). The 3D is the door, not the archive; `/publications/` and
`/projects/` remain complete browsable listings.

## 6. Engine components

Single canvas, single delta-time loop, independent parts:

- **`AmbientLayer`** — nebula shader and volumetric dust. Follows the camera, never the subject.
- **`ClusterLayer`** — world-space regions. Content nodes as instanced solid meshes with
  fresnel and emissive response; additive blending reserved for glow around them, not for
  the bodies themselves.
- **`CameraRig`** — waypoint path and critically damped follow, all on real delta time. No
  overshoot; speed independent of display refresh rate.
- **`Picker`** — raycasts against content-node meshes only, and returns real node identity.
- **`PostFX`** — controlled bloom, light depth of field, and dithering against banding on the
  dark field.

**`JourneyController`** (DOM side) translates scroll into journey state and listens to the
picker. **HUD** components (chapter tracker, node chips, inspector) are Astro components
rendering real DOM.

Lines between particles are updated GPU-side, not rebuilt on the CPU per frame.

## 7. Content migration

Verified inventory: **62 Markdown files**, fully translated.

| Collection | EN | IT |
|---|---|---|
| publications | 7 | 7 |
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
  cluster; no orphan nodes; every link resolves.
- **Journey state machine** — scroll selects chapter; click opens any node in any order;
  scrolling past closes and exits.
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

**Phase 1 — Engine, on fixture data.** A minimal Astro shell (for the Vite pipeline and a
current local Three.js), the five engine modules, the journey state machine and the HUD,
driven by a hand-authored `universe.json` that mirrors the real 17 nodes and 4 pillars.
Judged on localhost until the look holds.
*Exit criteria:* reads as FPlus or better; clicking a node opens that node's content;
motion identical at 60 and 120 Hz; bundle measured against §10.

**Phase 2 — Content parity.** Collections and schemas, `/en/` `/it/` routing, the 62 files,
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
