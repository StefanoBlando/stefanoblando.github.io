/**
 * Generates src/data/universe.json from the site's own content.
 *
 * It reads `src/content` — the same tree the pages read. Pointing this at the
 * Hugo tree while the pages read the copy would let the constellation and the
 * page it sits behind describe different work.
 *
 * Each publication declares its own `pillar:`; the pillars themselves are data
 * in `src/data/pillars.yaml`. Both used to live in this file, the first as a
 * hardcoded map and the second as regexes keyed to the indentation of a Hugo
 * landing page.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load as parseYaml } from 'js-yaml';

const here = dirname(fileURLToPath(import.meta.url));
const CONTENT = join(here, '../src/content');
const PILLARS = join(here, '../src/data/pillars.yaml');
const AUTHOR = join(here, '../../data/authors/me.yaml');
const OUT = join(here, '../src/data/universe.json');

// One body, not four regions. Each pillar owns a sector of a single sphere,
// given by an axis direction; the constellation rotates to present the active
// sector, the way the FPlus object turns rather than being flown between.
const CLUSTER_LAYOUT = {
  'multi-agent': { azimuth: 0.6, elevation: 0.3, accent: '#dbb057' },
  'statistical-verification': { azimuth: 2.2, elevation: -0.22, accent: '#8acbc1' },
  'robust-quant': { azimuth: 3.8, elevation: 0.18, accent: '#f2a98c' },
  'text-analytics': { azimuth: 5.4, elevation: -0.3, accent: '#c9d4e8' },
};

/** Radius at which content nodes rest inside the swarm. */
const NODE_SHELL = 1.72;
/** Half-angle of a pillar's sector, in radians. */
const SECTOR_SPREAD = 0.5;

const CLUSTER_ORDER = ['multi-agent', 'statistical-verification', 'robust-quant', 'text-analytics'];

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The four research pillars. Data, not a landing page read back with regexes. */
function readPillars() {
  return parseYaml(readFileSync(PILLARS, 'utf8'));
}

function readItem(section, dir) {
  const file = join(CONTENT, section, dir, 'index.md');
  if (!existsSync(file)) return null;
  const match = readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error(`no frontmatter in ${section}/${dir}/index.md`);
  const fm = parseYaml(match[1]);
  return {
    title: fm.title,
    summary: fm.summary ?? fm.abstract ?? '',
    tags: fm.tags ?? [],
    pillar: fm.pillar,
  };
}

const pillars = readPillars();
const nodes = [];

for (const pillar of pillars) {
  for (const slug of pillar.projects) {
    const item = readItem('projects', slug);
    if (!item) {
      console.warn(`  ! project "${slug}" referenced by pillar "${pillar.id}" but not found`);
      continue;
    }
    nodes.push({
      // Qualified by kind: island-model-smc and network-crash-prediction each
      // exist as both a project and a publication, so bare slugs collide.
      id: `project/${slug}`,
      cluster: pillar.id,
      kind: 'project',
      title: item.title,
      summary: item.summary,
      tags: item.tags.slice(0, 4),
      href: `/projects/${slug}/`,
    });
  }
}

// Every publication, taking its pillar from its own frontmatter. A throw
// rather than a warning: a publication that silently vanishes leaves a
// half-empty cluster, and a broken build beats a site that lies.
const publicationDirs = readdirSync(join(CONTENT, 'publications'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

for (const dir of publicationDirs) {
  const item = readItem('publications', dir);
  if (!item) throw new Error(`publication "${dir}" could not be read`);
  if (!CLUSTER_ORDER.includes(item.pillar)) {
    throw new Error(`publication "${dir}" has unknown pillar "${item.pillar}"`);
  }
  nodes.push({
    id: `publication/${dir}`,
    cluster: item.pillar,
    kind: 'publication',
    title: item.title,
    summary: item.summary,
    tags: item.tags.slice(0, 4),
    href: `/publications/${dir}/`,
  });
}

/**
 * Education entries from the author data file. Parsed rather than restated:
 * the earlier prototype hand-wrote a timeline naming the wrong universities.
 */
function readEducation() {
  const raw = readFileSync(AUTHOR, 'utf8');
  const block = raw.match(/^ {2}education:\n([\s\S]*?)(?=^ {2}[a-z_]+:)/m);
  if (!block) return [];

  return block[1]
    .split(/^ {4}- /m)
    .slice(1)
    .map((entry) => {
      const field = (key) => (entry.match(new RegExp(`^ *${key}: *(.+)$`, 'm')) || [, ''])[1].trim();
      const start = field('start');
      const end = field('end');
      return {
        degree: field('degree').replace(/^["']|["']$/g, ''),
        institution: field('institution').replace(/^["']|["']$/g, ''),
        from: start.slice(0, 4),
        to: end ? end.slice(0, 4) : 'present',
      };
    })
    .filter((e) => e.degree && e.institution);
}

/**
 * Work history, normalised to the same from/to shape as education so one
 * timeline component renders both. The author file calls them `role` and
 * `org` where education says `degree` and `institution`.
 */
function readExperience() {
  const raw = readFileSync(AUTHOR, 'utf8');
  const block = raw.match(/^ {2}experience:\n([\s\S]*?)(?=^ {2}[a-z_]+:)/m);
  if (!block) return [];

  return block[1]
    .split(/^ {4}- /m)
    .slice(1)
    .map((entry) => {
      const field = (key) => (entry.match(new RegExp(`^ *${key}: *(.+)$`, 'm')) || [, ''])[1].trim();
      const strip = (s) => s.replace(/^["']|["']$/g, '');
      const start = strip(field('start'));
      const end = strip(field('end'));
      return {
        role: strip(field('role')),
        org: strip(field('org')),
        from: start.slice(0, 4),
        to: end ? end.slice(0, 4) : 'present',
      };
    })
    .filter((e) => e.role && e.org);
}

/** Unit vector for a sector axis. */
function axisOf(azimuth, elevation) {
  return [
    Math.cos(elevation) * Math.sin(azimuth),
    Math.sin(elevation),
    Math.cos(elevation) * Math.cos(azimuth),
  ];
}

// Deterministic placement: each work rests inside its pillar's cone on a single
// shell, so the whole set reads as one constellation rather than four clumps.
const clusters = CLUSTER_ORDER.map((id, index) => {
  const pillar = pillars.find((p) => p.id === id);
  const layout = CLUSTER_LAYOUT[id];
  const members = nodes.filter((n) => n.cluster === id);
  const rand = mulberry32(0x5eed + index * 977);
  const axis = axisOf(layout.azimuth, layout.elevation);

  // An orthonormal pair spanning the plane perpendicular to the axis.
  const up = Math.abs(axis[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
  const t1 = [
    up[1] * axis[2] - up[2] * axis[1],
    up[2] * axis[0] - up[0] * axis[2],
    up[0] * axis[1] - up[1] * axis[0],
  ];
  const n1 = Math.hypot(...t1);
  const e1 = t1.map((v) => v / n1);
  const e2 = [
    axis[1] * e1[2] - axis[2] * e1[1],
    axis[2] * e1[0] - axis[0] * e1[2],
    axis[0] * e1[1] - axis[1] * e1[0],
  ];

  members.forEach((node, i) => {
    const ring = (i + 0.5) / members.length;
    const angle = ring * Math.PI * 2 + index;
    const tilt = SECTOR_SPREAD * (0.35 + rand() * 0.65);
    const radius = NODE_SHELL + (rand() - 0.5) * 0.34;

    const dir = [0, 1, 2].map(
      (k) =>
        axis[k] * Math.cos(tilt) +
        (e1[k] * Math.cos(angle) + e2[k] * Math.sin(angle)) * Math.sin(tilt),
    );

    node.position = dir.map((v) => +(v * radius).toFixed(4));
  });

  return {
    id,
    index: index + 1,
    title: pillar.title,
    description: pillar.description,
    detailed_text: pillar.detailed_text,
    topics: pillar.topics,
    axis: axis.map((v) => +v.toFixed(4)),
    accent: layout.accent,
    count: members.length,
  };
});

const education = readEducation();
const experience = readExperience();

const universe = {
  generatedAt: new Date().toISOString().slice(0, 10),
  source: 'src/content',
  clusters,
  nodes,
  education,
  experience,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, `${JSON.stringify(universe, null, 2)}\n`);

console.log(
  `universe.json written: ${clusters.length} clusters, ${nodes.length} nodes, ` +
    `${education.length} degrees, ${experience.length} roles`,
);
for (const c of clusters) console.log(`  ${c.index}. ${c.title.padEnd(38)} ${c.count} nodes`);
