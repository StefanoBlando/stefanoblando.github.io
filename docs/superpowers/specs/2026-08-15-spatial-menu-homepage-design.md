# Spatial Menu Homepage — Design Spec

> **Superseded.** The homepage design in this document was replaced on 2026-08-16.
> See `docs/superpowers/specs/2026-08-16-what-was-built.md` for the site as it
> stands. Kept for the decisions and measurements it records.

**Date:** 2026-08-15
**Status:** Approved, not yet implemented.
**Supersedes:** §3, §4 and §5 of `2026-08-15-homepage-sections-and-index-pages-design.md`
(homepage structure, the eight layouts, and the scroll-driven morph). That document's §6
and §7 — the index pages and the content pipeline — were implemented and stand.
**Parent:** `2026-08-14-spatial-3d-portfolio-design.md`.

## 1. Why this changes

The eleven-band homepage built earlier today works and is dense with content: pillar
long-form text, work lists, timelines, news. Read against the visual reference it is
cluttered — the reference is quiet and ordered, and ours puts paragraphs on top of the
particle field.

The resolution is to move the reading somewhere else. Every section becomes a real page,
reachable from the menu, the way the Hugo site did it. The homepage stops carrying content
and becomes **the menu, laid out in space**: eight stations, each a title and a link, each a
different region of the particle field, joined by a camera that travels as you scroll.

**This restores the original design, and the reason it was abandoned no longer holds.** The
parent spec (§5) records the journey being cut because *"it was hard to follow: nothing could
be read while scrolling"*. That objection assumed the homepage had to carry the reading. It
no longer does.

## 2. The decision that shapes everything else

**One structure, a travelling camera — not a morphing structure.**

A road through space requires the space to hold still. If the constellation reshapes while
the camera moves through it, there is no road: there is a sequence of unrelated worlds, and
you never arrive anywhere because the place you were flying toward has moved.

So the morph goes. `swarm.setBlend` and the three layouts added today — core-periphery,
branching growth, percolation front — are deleted rather than left dormant, following this
project's existing habit (parent spec §5 deleted five modules outright).

**The surviving structure is `randomNetwork`, layout 0.** Not an arbitrary pick: the
proximity threads are already computed from it (`structure.js`, `const base = layouts[0]`),
so it is the one layout whose wiring is exactly true to its geometry.

**The world stays alive without morphing.** Everything that moves today is independent of the
layout and survives: the GPU drift on every particle, the radial breath, the body's own slow
rotation (`bodyYaw += dt * 0.16`), the domain-warped smoke, the volumetric dust and its
afterimage trails, and the pointer agitation and repulsion. What goes is only the field
*changing into a different structure*. It no longer changes what it is; it never stops moving.

## 2b. The body must be released into the world

The constellation is currently welded to the camera —
`swarm.group.position.copy(camera.position).add(bodyOffset)` — so it holds its place on screen
while the dust and smoke sweep past it.

**With that rule a journey is impossible.** If the body follows the camera, moving the camera
takes you nowhere: the destination travels with you. Every station would frame the same view
of the same thing. The body has to be anchored in world space and the camera has to move
through it for real.

The parent spec (§5) warns that anchoring the body in world space "makes it swing across the
view and the composition never settles". That finding was made under a continuous orbit, where
no framing was ever designed — the camera simply swept and the body drifted through the frame.
With eight authored waypoints every station has a composed framing by construction, which is
precisely the thing that was missing. The warning is inherited knowledge, not a blocker, and
it names what the waypoints have to earn: each one must be *composed*, not merely a position.

## 3. The homepage

Eight stations, roughly eight screens, against 1280vh today.

| # | Station | Destination |
|---|---|---|
| 1 | Hero — name, one line, a scroll hint | — |
| 2 | Research | `/research/` |
| 3 | Projects | `/projects/` |
| 4 | Publications | `/publications/` |
| 5 | Experience | `/experience/` |
| 6 | Network | `/network/` |
| 7 | News | `/blog/` |
| 8 | Contact | email |

Each station carries a title and a link. Nothing else — no summary, no counts, no lists. The
text sits on one side of the frame and the camera's target region on the other.

**Accepted trade-off, recorded so it is not rediscovered as a bug:** the eight regions are
positions in the field, not meanings. Zooming toward the Projects station does not show the
thirteen projects; it shows a part of the cloud. The geometry is composition, not data. The
alternative — stations that are the four research pillars, which *are* real sectors of the
constellation — was considered and set aside in favour of the homepage being the menu.

## 4. The camera

Eight waypoints, each a position, a look-at target and a distance. Scroll interpolates
between consecutive waypoints.

**The interpolation curve already exists and is already tested.** `pickActiveBlend` returns
`{ from, to, t, weight }` against `[data-shape]` sections, holding `t` flat while a section is
centred and tracking the scroll between them. Applied to camera waypoints instead of layout
buffers it needs no change, and the twelve tests in `blend.test.mjs` remain valid as written:
they test the curve, not what consumes it.

The document orbit at `index.js:212` is replaced by this. Its `smoothstep` distance ramp goes
with it, since distance is now per waypoint, and so does the camera-frame welding described in
§2b: `swarm.group` takes a fixed world position and the camera moves instead.

**A waypoint is a composition, not a coordinate.** Each is authored by looking at it: the
region it frames, how much of the field fills the frame, and which side stays empty for the
text. Eight screenshots at fixed scroll positions are the instrument for that, not intuition.

**Colour still shifts per station.** The eight tints added to `tonal-night` today survive
unchanged — eight stations, eight tints — and `applyTint` keeps interpolating them on the
same curve. This is the cheapest source of variety once the topology stops changing, and it
is what keeps eight stations from reading as one.

## 5. Where the content goes

Nothing written today is discarded; it moves to the pages that already hold its neighbours.

| Was, on the homepage | Goes to |
|---|---|
| Pillar titles, descriptions, `detailed_text`, topics | `/research/` and `/research/<pillar>/` |
| Per-pillar publication and project lists | `/research/<pillar>/` |
| Selected work | `/projects/` |
| Selected publications | `/publications/` |
| Education and experience timelines | `/experience/` (already there) |
| Latest news | `/blog/` (already there) |
| Co-author counts | `/network/` and `/experience/` (already there) |

**`/research/` is new.** Four pillar pages exist; the index that lists them does not, and the
Research station needs somewhere to land.

## 6. Detail pages, and the end of the 404s

With the lists gone from the homepage, an index page is the only route to an individual work
— and today every one of those routes is a dead end. `/projects/` lists thirteen projects
whose pages do not exist. This is the debt the parent spec (§11) recorded as sixteen live
404s, and removing the homepage lists makes it the site's main defect rather than a
background one.

Three dynamic routes close it, over content whose Markdown bodies are already migrated:

| Route | Pages |
|---|---|
| `/projects/<slug>/` | 13 |
| `/publications/<slug>/` | 6 |
| `/blog/<slug>/` | 7 |

Detail pages ship no engine, like the indexes, and use the same static backdrop.

Publication pages render the abstract, the venue, the author list and the links. `doi` and
`url_pdf` are empty on all six publications — the pages must not render a link to nothing,
and the absence is data about the content, not a template bug.

## 7. Testing

- **The blend curve** — unchanged, twelve tests, now covering camera waypoints instead of
  layouts. Renaming is not needed: the module tests a curve.
- **Waypoints resolve** — every `[data-shape]` station index has a waypoint, asserted the way
  `shapes.test.mjs` asserts tints today. That test is rewritten against waypoints; the layout
  assertions in it go with the layouts.
- **Every station link resolves to a page that is built.** This is the failure this design is
  most exposed to: the homepage is now nothing but links, so a broken one is the whole page.
  A build-time assertion over the emitted `dist/` is worth more here than a unit test.

Composition and camera framing are judged by looking at them, now with screenshots at fixed
scroll positions rather than by eye alone.

## 8. Out of scope

- Italian routing and `check:i18n`.
- Pagefind.
- The Netlify cutover.
- Node picking: clicking an individual particle to open a work. The stations are the only
  interactive targets. This stays out, as it did in Phase 1.
