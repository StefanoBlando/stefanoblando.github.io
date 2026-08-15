# Homepage Section Structure and Index Pages — Design Spec

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
- **Content is read in place from the Hugo tree** through Astro collections, rather than
  moved into `site/src/content/`. Hugo keeps building in parallel, which is the safety net
  until cutover.
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
`/network/`. The counts are derived at build time from `assets/js/research-network/`, not
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

**Palette cost.** `palette.js:34` gives each of six presets a `tints[]` array of five entries.
Eight are needed. Only the active preset gets three properly designed additions; the others
get a `tints[i] ?? tints.at(-1)` fallback so they degrade instead of throwing. Inventing
eighteen colour triplets nobody will look at is not worth the effort, and a half-considered
tint is worse than a repeated one.

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
| News | `/blog/` | 8 posts |
| Contact | `/#contact` | anchor |

On index pages the anchors become `/#research` and `/#contact`.

**Index pages load no engine.** The parent spec makes this a success criterion (§1) and a
performance commitment (§10); with the D3 visualization living on `/network/`, it is also the
only coherent option. They get a static backdrop instead — a CSS gradient plus grain, driven
by the same `palette.css` variables the scene uses, so the two stay in the same visual family
with no JavaScript.

## 7. Content pipeline

`site/src/content.config.ts`, using the Astro 5 content layer with `glob()` loaders reading
outside `src/`:

| Collection | base | pattern |
|---|---|---|
| `publications` | `../content/publications` | `*/index.md` |
| `projects` | `../content/projects` | `*/index.md` |
| `blog` | `../content/blog` | `*/index.md` |

Hugo page bundles put each entry at `<slug>/index.md`, so `*/index.md` excludes `_index.md`
and `_index.it.md` — which sit at the collection root — without a filter.

Schemas validate the existing academic frontmatter. A build that fails on a missing field is
the intended behaviour, per the parent spec §8: a broken build beats a site that lies.

Two items become blocking here rather than deferred:

- **`content/publications/network crash prediction/` contains spaces.** Hugo tolerated it;
  as a collection entry id it produces a slug with spaces. It is renamed to
  `network-crash-prediction`, preserving the public URL
  `/publications/network-crash-prediction/`.
- **The hardcoded publication→pillar map goes away.** `build-universe.mjs:27` carries it with
  the comment *"Curated, pending the `pillar:` frontmatter field"*. With schemas in place,
  `pillar:` is added to the frontmatter of the six publications and the map is deleted.

**Stated risk:** a `base` path outside `src/` needs to hold on the Netlify build, not only
locally. This is verified first, not last.

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
