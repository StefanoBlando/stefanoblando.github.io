# Homepage Section Structure and Index Pages — Design Spec

> **Superseded.** The homepage design in this document was replaced on 2026-08-16.
> See `docs/superpowers/specs/2026-08-16-what-was-built.md` for the site as it
> stands. Kept for the decisions and measurements it records.

**Date:** 2026-08-15
**Status:** Approved, not yet implemented.
**Parent:** `2026-08-14-spatial-3d-portfolio-design.md`. This spec covers the first
half of that document's Phase 2, plus a pacing fix to the Phase 1 engine.
**Scope:** Rebuild the Astro homepage on the section structure of the current Hugo
landing page, add the five missing index pages, and replace the shape-switching
mechanic with a scroll-driven blend.

## 1. Context

Phase 1 (commit `99df5bb`) delivered the engine against real content: `build-universe.mjs`
derives 4 pillars, 16 works and 6 degrees from the Hugo tree. What it did not deliver is a
site. `site/src/pages/` holds exactly two entries — `index.astro` and
`research/[pillar].astro` — against a Hugo site with a seven-item menu and an eight-block
landing page.

Two problems drive this spec.

**The homepage lost most of its content.** The Hugo landing page (`content/_index.md`) runs
eight blocks: `portfolio-hero`, `research-pillars`, `featured-projects`,
`featured-publications`, `resume-experience`, `collaborators-network`, `featured-news`,
`portfolio-contact`. The Astro homepage has four of those, in reduced form. The hero lost its
portrait, both calls to action and the social links. The pillars lost `detailed_text`. Featured
projects, featured publications, experience and news are absent entirely.

**The backdrop changes too fast.** Eight bands at `min-height: 100vh` (`scene.css:120`)
carry the shape sequence `0,0,1,2,3,4,2,4` — a topology change roughly every screen, with
`path` and `contact` reusing shapes 2 and 4 so the page ends by going backwards.

The second problem is not primarily one of length. It is a mismatch between two mechanics:
the **trigger** is positional and binary (`readShape` calls `swarm.setShape()` when the
winning section changes, `index.js:178`), while the **morph** is temporal
(`damp(current, target, 1.6, dt)`, `swarm.js:300`, roughly two seconds to settle). Scroll
quickly and you cross three topologies in two seconds, reaching none of them. The result
reads as noise rather than as transformation. Lengthening the page alone makes this rarer,
not absent.

One thing already works in favour of a longer page: the camera orbit is normalised over the
whole document (`this.scroll`, `index.js:175`), so a taller page slows the orbit for free.

## 2. Decisions taken

Recorded because each closed off alternatives that were live.

- **Scope is the homepage plus the five index pages.** Per-work detail pages
  (`/projects/<slug>/`, `/publications/<slug>/`) stay out. The 16 links from the homepage
  works remain 404 after this pass — a known, accepted debt, unchanged from today.
- **The co-author network keeps its own page and stays off the homepage.** It is an
  interactive D3 visualization; placing it inside a page that already runs a WebGL universe
  puts two visualizations in competition. On Hugo the backdrop was static and this was not a
  problem.
- **The full Hugo hero returns**, portrait included, accepting that the portrait competes
  with the backdrop. Parity with the current site and a reachable CV outweigh it.
- **Content is copied into `site/src/content/` and normalised on the way**, rather than read
  in place from the Hugo tree. Reading in place was the earlier decision, taken to keep Hugo
  building as a safety net; it was reversed on 2026-08-15 in favour of setting Hugo aside
  entirely. The consequence is stated plainly in §7: from the copy onward the Hugo tree is
  legacy, and editing it changes nothing.
- **English only.** The Italian routing arrives with the rest of Phase 2, before cutover.
  The `.it.md` files stay where they are and nothing is lost.

## 3. Homepage structure

Eleven bands. The Hugo blocks map one to one, with `resume-experience` absorbing the
current `path` band.

| # | Band | Hugo block | Content | Height |
|---|---|---|---|---|
| 01 | `hero` | `portfolio-hero` | eyebrow, headline, summary, portrait, two CTAs, socials | 100vh |
| 02 | `research-lead` | `research-pillars` head | title and framing text | 90vh |
| 03–06 | `pillar` ×4 | `research-pillars` items | title, description, `detailed_text`, topics, publications, projects, pillar link | ~150vh each |
| 07 | `selected-work` | `featured-projects` | three featured projects | 120vh |
| 08 | `selected-publications` | `featured-publications` | publications with `featured: true` | 120vh |
| 09 | `path` | `resume-experience` | education and experience | 150vh |
| 10 | `news` | `featured-news` | latest posts | 110vh |
| 11 | `contact` | `portfolio-contact` | email, GitHub, LinkedIn, Scholar | 90vh |

Roughly 1280vh against today's 800.

The pillar bands recover `detailed_text` (`content/_index.md:37` and siblings), the long-form
paragraph absent from the current Astro page. They become tall because they carry more, not
because they are padded.

Two selections are inherited rather than reinvented. `selected-work` uses the explicit slug
list already in `content/_index.md:71` (`risk-sentinel`, `island-model-smc`,
`multi-agent-orchestration`). `selected-publications` uses the `featured: true` flag already
set on four of the six publications.

The `path` band closes with a single line — co-author and institution counts, linking to
`/network/`. The counts are derived at build time from the people data extracted in §6, not
typed in, so they cannot drift from the visualization they point at. This keeps the research
network in the narrative without putting a second visualization on the page.

## 4. Layouts: five to eight

`structure.js` defines five generators. Three more are needed, and they follow the parent
spec's rule (§4) that layouts are complex-system structures rather than geometric solids.

| Shape | Layout | Bands |
|---|---|---|
| 0 | random network | 01 hero, 02 research-lead |
| 1 | scale-free hubs | 03 Adaptive Multi-Agent Systems |
| 2 | stochastic trajectories | 04 Statistical Verification |
| 3 | two communities | 05 Robust Quantitative Methods |
| 4 | small-world ring | 06 Text Analytics and Language Models |
| 5 | **core–periphery** | 07 selected work, 08 selected publications |
| 6 | **branching growth** | 09 path |
| 7 | **percolation front** | 10 news, 11 contact |

The assignments carry meaning rather than filling slots: a dense core for the work held up as
strongest, a branching growth process for an academic trajectory, an outward-spreading front
for news and for reaching out.

**Palette cost.** Only two of the six presets define `tints[]` at all — `reference-scene`
(`palette.js:34`) and the active `tonal-night` (`palette.js:68`) — each with five entries.
Eight are needed. `tonal-night` gets three properly designed additions because it is what
ships. `reference-scene` is a comparison preset and keeps its five: the read at
`index.js:182` is already `palette.tints?.[shape]`, so a missing index simply leaves the tint
where it was. The four presets with no `tints` are unaffected, as they are today.

## 5. Pacing: plateau and transition

The shape becomes a continuous function of scroll position, held flat while a section is
being read.

`pickActiveShape()` returns `{ from, to, t, weight }` instead of `{ shape, weight }`:

```js
u = (viewportCenter - centerA) / (centerB - centerA)   // between consecutive section centres
t = smoothstep(clamp((u - PLATEAU) / (1 - 2 * PLATEAU), 0, 1))
// PLATEAU = 0.3
```

`A` and `B` are the two bands in document order whose centres bracket the viewport centre.
Above the first band's centre and below the last one's there is no pair to bracket with:
`from` and `to` both take that outermost band's shape and `t` is 0, so the topology is simply
held. `weight` keeps its current meaning and its current consumers — the damped camera
distance at `index.js:215` — and is computed as before.

`swarm.setShape()` is replaced by `setBlend(a, b, t)`, which writes
`target[i] = A[i] + (B[i] - A[i]) * t` over the precomputed layouts already held in
`this.layouts` (`structure.js:198`). At 350 points that is 1050 floats per frame — far below
the morph work already being done.

While a band is centred, `t` sits at an endpoint and the topology is fully resolved and
still. While you move between bands, the morph tracks the scroll exactly: fast scrolling
passes coherently through the intermediate states instead of chasing a target it never
reaches.

Three consequences follow, and two of them are the point.

**Holding a shape across two bands comes out for free.** Hero and research-lead both carry
shape 0, so `A === B`, `t` is irrelevant and the topology is motionless for two full screens.
The same holds for selected-work with selected-publications, and for news with contact. No
dedicated hold logic is needed.

**The morph damping must be retuned.** `swarm.js:300` damps at rate `1.6`, about two seconds
to settle. Against a target that now follows the scroll, it would lag permanently and cancel
the benefit. It goes to roughly `8`: still enough to remove jitter, not enough to be seen as
lag. This number is set by looking at it on localhost, not derived.

**Colour follows the scroll too.** The tint currently snaps inside `readShape()`
(`index.js:180-187`). It becomes `lerp(tints[from], tints[to], t)` applied to swarm, ambient
layer, scrim and wash together — consistent with the parent spec's finding (§5) that tinting
these separately reads as a glitch.

**A latent bug this change exposes.** `setBreath` is driven by
`sin(scrollY / innerHeight * 0.9)` (`index.js:205`), which counts in screens. At 1280vh
instead of 800 the breath oscillates proportionally more often and reads as a tremor. It is
re-anchored to the normalised `this.scroll`.

## 6. Index pages and navigation

The seven Hugo menu entries all resolve:

| Label | URL | Content |
|---|---|---|
| Research | `/#research` | anchor |
| Projects | `/projects/` | 13 projects |
| Publications | `/publications/` | 6 publications |
| Experience | `/experience/` | education and experience |
| Network | `/network/` | migrated D3 visualization |
| News | `/blog/` | 7 posts |
| Contact | `/#contact` | anchor |

On index pages the anchors become `/#research` and `/#contact`.

**Index pages load no engine.** The parent spec makes this a success criterion (§1) and a
performance commitment (§10); with the D3 visualization living on `/network/`, it is also the
only coherent option. They get a static backdrop instead — a CSS gradient plus grain, driven
by the same `palette.css` variables the scene uses, so the two stay in the same visual family
with no JavaScript.

**`/network/` needs more than a copy.** The parent spec (§1) points at
`assets/js/research-network/` as the co-author visualization to migrate. That is wrong, and
the error is recorded here so it is not inherited: `assets/js/research-network/` generates the
*decorative* hero topology from a seeded RNG, and the tests in `tests/network/` cover that,
not the graph. The real co-author network is
`layouts/_partials/hbx/blocks/collaborators-network/block.html` — 649 lines of Hugo template
with the data for 15 people, their institutions and role colours written inline, and D3 loaded
from a CDN `<script>` at line 49.

The migration therefore does three things rather than one: lift the 15 people out of the
template into a data module that the `path` band can also count from; replace the CDN global
with scoped npm imports (`d3-selection`, `d3-scale`, `d3-array`, `d3-force`, `d3-transition`,
`d3-ease`), since removing CDN globals is the reason Astro was chosen in the first place; and
port markup and CSS as they are. The decorative hero topology and its tests stay where they
are and are not part of this.

## 7. Content pipeline

The Hugo tree is copied into `site/src/content/` as page bundles and normalised on the way.
Bundles rather than flat files because 25 assets are co-located with their entries — 21
`featured.*` images and 4 `cite.bib` — and Astro supports co-located assets natively.

| Collection | Location | Entries |
|---|---|---|
| `publications` | `site/src/content/publications/<slug>/index.md` | 6 |
| `projects` | `site/src/content/projects/<slug>/index.md` | 13 |
| `blog` | `site/src/content/blog/<slug>/index.md` | 7 |
| `events` | `site/src/content/events/<slug>/index.md` | 1 |

**Normalisation, by rule rather than by hand.** A script performs the copy so the transform
is reproducible and reviewable, and so a mistake can be corrected by editing a rule and
re-running rather than by re-editing 62 files. Every rule preserves information:

- **Empty fields are dropped.** Measured, not assumed: `doi`, `url_pdf`, `url_dataset`,
  `url_poster`, `url_slides`, `url_source` and `url_video` are empty on all six publications.
  Only `url_code` (one entry) and `url_project` (four) ever carry a value.
- **The surviving `url_*` fields fold into `links[]`** with a name, so a template renders one
  list instead of testing eight fields for emptiness.
- **Hugo Blox names give way to plain ones:** `publication` → `venue`, `publication_short` →
  `venue_short`, `publication_types: [x]` → `type: x`.
- **`authors: [me, …]` is expanded** to the real name. `me` is a Hugo author-file reference
  and means nothing outside it.
- **Anything the script does not recognise is carried through untouched**, so no field can be
  lost by omission. What is dropped is dropped by an explicit rule and reported.

The copy also repairs `content/projects/real-estate-ai-agent/index.md`, which opens with a
blank line before its `---` and therefore has no parseable frontmatter at all. Hugo tolerates
it; every standard parser does not.

Schemas validate the result. A build that fails on a missing field is intended, per the
parent spec §8: a broken build beats a site that lies.

**The consequence, stated plainly:** after the copy the Hugo tree is legacy. Editing
`content/` changes nothing that ships. This is the cost of the copy, and it is the reason the
earlier read-in-place design existed; it was accepted deliberately in order to stop carrying
Hugo Blox's shape into the new site.

Two items are settled by the copy rather than deferred:

- **`content/publications/network crash prediction/` contained spaces.** Renamed to
  `network-crash-prediction`, preserving `/publications/network-crash-prediction/`. Two
  `relref` shortcodes in `content/blog/graduation-cesma/` pointed at the old path and moved
  with it.
- **The hardcoded publication→pillar map goes away.** `build-universe.mjs:27` carried it with
  the comment *"Curated, pending the `pillar:` frontmatter field"*. `pillar:` now sits in the
  frontmatter of all six publications, English and Italian, and the map is deleted.

**`build-universe.mjs` follows the copy.** It reads `../../content` today. If the pages read
the Astro copy while the universe reads the Hugo tree, the two diverge at the first edit, so
the script is repointed in the same pass.

**The research pillars stop being parsed out of a landing page.** The four pillars — title,
description, `detailed_text`, topics, member projects — live inside `content/_index.md`, a
Hugo Blox landing page, and `readPillars()` extracts them with regexes keyed to exact
indentation (`/^ {10}description: (.*)$/m`). Copying that arrangement forward would be
copying the fragility. They become `site/src/data/pillars.yaml`, and the parser is deleted.

## 8. Degradation

Unchanged from Phase 1 and unaffected by this work: no WebGL or a lost context sets
`data-scene="off"` and the page stays whole and readable; `prefers-reduced-motion` yields a
static composition. Index pages have nothing to degrade — they ship no engine.

## 9. Testing

`sections.js` stays pure and carries the new tests:

- `t` pinned to 0 inside A's plateau and to 1 inside B's;
- `t` monotonically increasing across the transition zone;
- `from === to` when consecutive bands share a shape;
- no division by zero with a zero-height viewport, or with two bands sharing a centre.

`damping.test.mjs` is unchanged.

One build-time assertion is added: every `data-shape` present in the rendered DOM resolves to
a layout in `structure.js` **and** a tint in `palette.js`. This is precisely the kind of
mismatch the three new shapes can introduce silently.

Rendering quality is judged by looking at it on localhost.

## 10. Out of scope

- Per-work detail pages. The 16 homepage work links stay 404.
- Italian routing and the `check:i18n` gate.
- Pagefind.
- The Netlify cutover.
- `doi` and `url_pdf`, empty on all six publications (parent spec §11). Named here so it is
  not mistaken for something this pass fixes.
