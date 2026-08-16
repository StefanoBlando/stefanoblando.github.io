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

The one thing not in that copy is the person: `data/authors/me.yaml` is still
the source for degrees, roles, awards, skills and languages, and
`build-resume.mjs` turns it into `src/data/resume.json`. It is a second file
rather than more of universe.json because **universe.json is imported by the
homepage's client script** — anything added to it is downloaded by every
visitor, and a résumé is read by one page at build time. The summaries in that
YAML are Hugo markdown, hard wrapped, so `resume-source.mjs` reflows them into
facts, prose and bullets; that parsing is a pure function with tests, which is
how the split of "Supervisor: Prof. Alessio Farcomeni" into "Prof" was caught.

## 5. Pages

**77 built: 39 English, 38 Italian.** Every internal link resolves. The table
below lists the English paths; each has an `/it/` twin (see §7).

| Route | |
|---|---|
| `/` | the eight-shape journey |
| `/research/` + 4 pillars | |
| `/projects/` + 13 details | card grid over the migrated cover images |
| `/publications/` + 6 details | a bibliography: no cards, only one has an image |
| `/blog/` + 7 details | card grid |
| `/experience/` | the whole résumé on one rail: degrees, roles, awards, methods, languages |
| `/network/` | the co-author graph, off the CDN d3 global; its images live in `site/public/images/` and were 404 until they were copied there |

**Content pages ship no 3D JavaScript**, verified per page. The homepage is
about 148 KB gzip, inside the 150–200 KB the parent spec predicted.

Type is Fraunces italic and Instrument Sans, both of which the Hugo site already
self-hosted, with a monospace for anything that is instrument output.

### The nav

The wordmark and eight items **measure 1040px**, so below 1080px they become a
`<details>` disclosure — no script, because these pages ship none. That number
was guessed at 700 first, which left the row silently cut off across the whole
tablet range: the overflow probe missed it because the masthead is `fixed` and
overflowing it never grows `document.scrollWidth`. **A layout check that only
reads the document cannot see inside a fixed element.** Re-measure whenever an
item is added.

On the homepage the nav follows the scroll: the reached section is lit and
carries a dash that grows from the centre, as the Hugo site's did. It is driven
by the same position the page dots read, not by an observer of its own — two
opinions about which section you are on can disagree, and one of them would be
wrong on screen.

The bar itself is a blurred layer that hangs below its own box: a gradient
alone hid nothing, and a page scrolling past was legible straight through the
top of it. The current section is marked from `Astro.url.pathname`, on its
index and on everything under it — which is also why `Research` points at
`/research/` and not at the homepage's own section, as it used to.

### The type on the reading pages

Raised across the board and taken out of the greys, because at the old scale
the indexes read as captions: card titles 1.04 → 1.24rem, summaries 0.84 →
0.98rem, publication titles to `clamp(1.2, 1.8vw, 1.45)`, CV notes and bullets
0.88 → 0.98rem, prose 0.98 → 1.06rem. Body copy moved from `--muted` to
`--dim`; `--muted` is now only for metadata. Three things were wrong rather
than merely small:

- **The card grid squared itself off at the wrong end.** `.card-title` reserved
  two lines on every card so summaries would line up, which opened a hole under
  every one-line title. The card is a flex column now and the tag row is pinned
  with `margin-top: auto`, so every card in a row ends on the same line — which
  is where the eye actually reads a grid — and the title is free.
- **`.card-title` was clamped to two lines.** At the new size that cut titles
  mid-word. A title a reader cannot finish is the one thing a card must not do.
- **The tag separators produced stray slashes.** The row was `nowrap` with a
  `/` in an `::after`; a long label wrapped inside its `li` while its separator
  stayed behind. Tags wrap as whole items now, separated by space.

### One column on a detail page

A blog post, a project and a publication were each running **four measures at
once**: the title to 62rem, the lede to 44, the cover picture to 62 and the
prose to 36. The text hung as a narrow column under a picture half again as
wide, sharing neither edge with it. `.page-article` gives the head, the
picture and the prose a single `--measure`, left-aligned inside the page
rather than centred — the whole site hangs off one left edge, and a centred
column here would read as a different site.

### Citing the work

Every publication carries a **Cite** disclosure. Four of the six have their own
`cite.bib` in the bundle — carried since the migration with nothing ever
offering it — and those are used verbatim: they are the author's record of how
the work should be cited, and regenerating them from frontmatter would quietly
overrule it. The two that live on arXiv get a `@misc` entry built from the
frontmatter and **labelled as generated**. Anything neither published nor
preprinted gets no button at all.

The `.bib` files are read through Vite's `import.meta.glob`, not `fs`: the page
module is compiled, so `import.meta.url` points into the build output and every
path resolved against it missed — silently, because "no file" is a valid answer
here and the four citations simply never appeared.

### What the phone was actually missing

Checked at 320, 390 and 768 with a probe that names any element sticking out
past the viewport — every route is clean at all three. Three things were not:

- **The co-author graph.** Its radial layout has a floor on the node radius,
  so at 390px fifteen people were drawn on top of each other. It now keeps a
  minimum working width of 820 and the container pans. Scaling the figure down
  instead would have taken the labels to four pixels.
- **The topic core of that graph, at every width.** The boundary clamp ran
  *after* the collision simulation and undid it. The collision was circular
  too, which reserves the space above and below a wide flat pill — the space
  the next pill needs. Rectangular separation, clamped inside the tick loop.
- **The homepage copy**, read through the brightest part of the cloud: the
  mobile scrim is a top-down gradient that has run out by the middle of the
  screen, which is exactly where the copy sits. It now carries its own pocket.

## 6. What a page now tells the outside world

The head used to carry a title and a description and nothing else, so a link
shared anywhere rendered as a bare URL, and the Hugo site's sitemap, robots,
404 and feed had no counterpart here. All of that is in `Base.astro` and four
routes now:

| | |
|---|---|
| `astro.config.mjs` | `site:` — every absolute URL resolves against it; `SITE_URL` overrides for a preview deploy |
| canonical, Open Graph, Twitter | on all 39 pages, off one card generated by `build-brand.mjs` from the site's own portrait and palette |
| `/sitemap-index.xml`, `/robots.txt` | robots is generated, so it advertises the sitemap of the origin it was built for |
| `/rss.xml` | the news feed Hugo published at `index.xml`; dropping it silently unsubscribes anyone following |
| `/404.html` | there was none: a bad URL left the site entirely |
| `favicon.svg`, `apple-touch-icon.png` | the wordmark's own mark |
| `citation_*` + `ScholarlyArticle` | Highwire tags are what Google Scholar reads; without them a publication page is a web page that happens to mention a title |
| `Person` JSON-LD | `sameAs` is what ties the site, Scholar, GitHub and LinkedIn together as one person |

**Search** is Pagefind, indexed from `dist/` after the build (`npm run
search:index`, wired into `npm run build`). `data-pagefind-body` sits on the
`#content` wrapper in the layout, so the nav never appears in a result and the
homepage — eight labels, no answers — is excluded along with `/search/` and the
404. The section facet is derived from the first path segment. 36 pages
indexed. The UI's assets only exist after a build: in `astro dev` the search
page is an empty box, by design.

`lang` is a prop rather than a constant, and `alternates` emits `hreflang` —
but **it is deliberately inert**: there are no Italian routes yet, and
advertising alternates that 404 is worse than advertising none.

### One theme, and why the second was withdrawn

The site is dark, full stop. A light theme was built, measured, shipped behind
a toggle and **removed the same day** — worth recording, because the numbers
said it should have worked.

Every light value cleared 4.5:1 against its background and the two carrying
small uppercase cleared 5.8:1, so the text was never the problem. **The
pictures were.** Every project and post cover is dark artwork on black; on
paper they read as black slabs punched through the page, and a detail page
became a white article wrapped around a black rectangle. The co-author graph
had the same trouble — dark pills, faint emissive threads, drawn for a dark
field. The homepage could not follow at all: additive blending, bloom and
additive trails add light to the background, and on white there is none to add.

**A light theme here is a second art direction, not a second palette.** It
needs new cover images and a recoloured graph first; the CSS is the smallest
part of that job. The measured values survive in `engine/palette.js` as `LIGHT`
with that note beside them, unwired, because the measuring was the expensive
part.

Removing it also took the last JavaScript off the reading pages: **an index or
a detail page now ships zero inline script and zero external script.** Only the
publication pages carry one, for the citation copy button.

Cutting that CSS block also cut, unnoticed, the `@media (min-width: 1080px)`
rule beside it that shows the desktop nav — every page above 1080px lost its
navigation until a screenshot caught it. **Deleting a region of a stylesheet by
its start and end markers takes whatever sits between them.**

While mapping the theme it turned out `CoauthorNetwork.astro` referenced seven
`--portfolio-*` variables **that were never carried over from the Hugo
stylesheet**. Every rule using one was invalid at computed-value time, so the
tabs, the search field and the detail card had been taking inherited colours
all along. They are now defined in terms of the site palette.

## 7. Both languages

**77 pages: 39 English, 38 Italian.** The blocking item is closed.

One page file serves both languages. The whole tree lives under
`src/pages/[...locale]/`, and `getStaticPaths` returns two entries per route —
`locale: undefined` for English, which Astro renders at the unprefixed path,
and `locale: 'it'`. Duplicating twelve routes into an `it/` folder would have
meant every future change being made twice and one of the two being forgotten.

| | |
|---|---|
| Interface | `src/i18n/ui.js`, one dictionary, ~120 keys per language |
| Content | `index.it.md` beside each original, loaded by parallel collections |
| Pillars | `pillars.yaml` gained `*_it`; `build-pillars.mjs` emits both |
| Résumé | `me-it.yaml` was already there; `build-resume.mjs` now writes `resume.it.json` too |
| Feed | `/rss.xml` and `/it/rss.xml`, over their own posts |
| Search | Pagefind indexes per `lang` attribute; an Italian search answers with Italian pages |

`tests/i18n.test.mjs` fails the build if a key exists in one language and not
the other, if any string is blank, or if an English string was copied into the
Italian and left there. `useTranslations` throws on a missing key rather than
rendering an empty element — a blank heading is the kind of thing that ships.

**The language switch only appears where the other language exists.** It is
built from the same `alternates` list that feeds `hreflang`, so it cannot land
on a 404, and it holds your place: `/blog/vadistat-award-2026/` switches to
`/it/blog/vadistat-award-2026/` and back, not to the homepage.

Two things worth not re-learning:

- **`export const getStaticPaths = () => …` is not picked up.** Astro hoists
  the declaration form; with the arrow-const the page renders with
  `Astro.props` undefined and the build dies on a destructure, naming a
  compiled chunk rather than the route. Use `export function`.
- The Italian author file still said `Thesis:`, `Focus:` and `University of
  Rome Tor Vergata`. Translating a CV means translating its labels, not only
  its sentences.

## 8. Still missing, and why it matters
- **DOIs and PDFs.** `doi:` and `pdf:` are in the schema and the page renders
  them when present; **all six publications have neither.** These cannot be
  generated — they have to be filled in from the proceedings.
The CV PDF and the ORCID were on this list and are now linked: `resume.pdf`
had been sitting unlinked in `public/uploads/` since the migration, and the
ORCID (`0009-0007-0523-6855`) is in `data/authors/me.yaml`, in the contact
section, at the head of the Experience page, and in the `Person` JSON-LD as
both `identifier` and `sameAs`.
- **The cutover itself.** `netlify.toml` still builds Hugo and publishes
  `public/`. Nothing built here is live.

## 9. Two traps this repository sets

Both cost real time on 2026-08-15 and neither is a bug in the code.

- **A long-running dev server goes stale.** It served a stylesheet 1000 bytes
  out of date, and later failed a module with `504 (Outdated Optimize Dep)`
  after a dependency was installed — which stopped the engine from starting at
  all and looked exactly like a broken scene. After `npm install`, restart the
  dev server, and `rm -rf node_modules/.vite` if anything looks impossible.
- **The Astro compiler reads script tags out of comments.** Writing a
  `<script src="…">` inside a comment in a `.astro` file makes Vite try to
  resolve it as a dependency.

## 10. The reference bundle

`/home/stefano/Scrivania/portfolio-v2-archivio/_nuxt/` holds the reference
site's compiled bundle. It is a studio's proprietary code and is not licensed
for reuse; it stays out of this repository. Reading it to learn which libraries
a site uses is ordinary, and that is where §2's three constants came from.

The `*-engine.js` files beside it are **not** the reference's code — they are
the previous prototype's own attempts at imitating it.
