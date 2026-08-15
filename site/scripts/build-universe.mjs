/**
 * Generates src/data/universe.json from the existing Hugo content tree.
 *
 * Phase 1 uses this as the fixture source so the prototype shows real work
 * instead of invented placeholders. It is also a dry run of the Phase 2 build
 * step, where the same derivation moves onto Astro content collections.
 *
 * The publication -> pillar mapping is hardcoded here because the `pillar:`
 * frontmatter field does not exist yet (see spec §4).
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const CONTENT = join(here, '../../content');
const AUTHOR = join(here, '../../data/authors/me.yaml');
const OUT = join(here, '../src/data/universe.json');

const PILLAR_SLUGS = {
  'Adaptive Multi-Agent Systems': 'multi-agent',
  'Statistical Verification': 'statistical-verification',
  'Robust Quantitative Methods': 'robust-quant',
  'Text Analytics and Language Models': 'text-analytics',
};

// Curated, pending the `pillar:` frontmatter field.
const PUBLICATION_PILLARS = {
  'island-model-smc': 'statistical-verification',
  'ks-model-smc': 'statistical-verification',
  'agentic-llm-formalization': 'statistical-verification',
  'multi-method-validation-framework': 'text-analytics',
  'network-crash-prediction': 'robust-quant',
  'robust-port-opt': 'robust-quant',
};

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

// Some content files (e.g. projects/real-estate-ai-agent) start with a blank
// line before the delimiter, so the opening --- is not at offset 0.
function frontmatter(raw) {
  const m = raw.match(/^\s*---\r?\n([\s\S]*?)\r?\n---/);
  return m ? m[1] : '';
}

function unquote(v) {
  const s = v.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

function scalar(fm, key) {
  const re = new RegExp(`^${key}:[ \\t]*(.*)$`, 'm');
  const m = fm.match(re);
  return m ? unquote(m[1]) : '';
}

function list(fm, key) {
  const lines = fm.split(/\r?\n/);
  const start = lines.findIndex((l) => new RegExp(`^${key}:[ \\t]*$`).test(l));
  if (start === -1) return [];
  const out = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^[ \t]*-[ \t]+/.test(line)) out.push(unquote(line.replace(/^[ \t]*-[ \t]+/, '')));
    else if (line.trim() !== '') break;
  }
  return out;
}

/** Parses the research-pillars block in content/_index.md. */
function readPillars() {
  const raw = readFileSync(join(CONTENT, '_index.md'), 'utf8');
  const blockStart = raw.indexOf('block: research-pillars');
  if (blockStart === -1) throw new Error('research-pillars block not found in content/_index.md');
  const after = raw.slice(blockStart);
  const blockEnd = after.indexOf('\n  - block:', 1);
  const block = blockEnd === -1 ? after : after.slice(0, blockEnd);

  const chunks = block.split(/^ {8}- name: /m).slice(1);
  return chunks.map((chunk) => {
    const name = chunk.split(/\r?\n/)[0].trim();
    const slug = PILLAR_SLUGS[name];
    if (!slug) throw new Error(`Unmapped pillar name: "${name}"`);
    const description = (chunk.match(/^ {10}description: (.*)$/m) || [, ''])[1].trim();
    const topicsRaw = (chunk.match(/^ {10}topics: \[(.*)\]$/m) || [, ''])[1];
    const projects = [];
    const lines = chunk.split(/\r?\n/);
    const start = lines.findIndex((l) => /^ {10}projects:[ \t]*$/.test(l));
    if (start !== -1) {
      for (let i = start + 1; i < lines.length; i += 1) {
        const t = lines[i].match(/^ {12}- (.+)$/);
        if (t) projects.push(t[1].trim());
        else if (lines[i].trim() !== '') break;
      }
    }
    return {
      id: slug,
      title: name,
      description,
      topics: topicsRaw ? topicsRaw.split(',').map((s) => s.trim()).filter(Boolean) : [],
      projects,
    };
  });
}

function readItem(section, dir) {
  const file = join(CONTENT, section, dir, 'index.md');
  if (!existsSync(file)) return null;
  const fm = frontmatter(readFileSync(file, 'utf8'));
  const title = scalar(fm, 'title');
  const summary = scalar(fm, 'summary') || scalar(fm, 'abstract');
  return {
    title,
    summary,
    tags: list(fm, 'tags'),
  };
}

function slugify(dir) {
  return dir.trim().toLowerCase().replace(/\s+/g, '-');
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

for (const [dir, cluster] of Object.entries(PUBLICATION_PILLARS)) {
  const item = readItem('publications', dir);
  if (!item) {
    console.warn(`  ! publication "${dir}" not found`);
    continue;
  }
  nodes.push({
    id: `publication/${slugify(dir)}`,
    cluster,
    kind: 'publication',
    title: item.title,
    summary: item.summary,
    tags: item.tags.slice(0, 4),
    href: `/publications/${slugify(dir)}/`,
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
    topics: pillar.topics,
    axis: axis.map((v) => +v.toFixed(4)),
    accent: layout.accent,
    count: members.length,
  };
});

const education = readEducation();

const universe = {
  generatedAt: new Date().toISOString().slice(0, 10),
  source: 'hugo-content-tree',
  clusters,
  nodes,
  education,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, `${JSON.stringify(universe, null, 2)}\n`);

console.log(
  `universe.json written: ${clusters.length} clusters, ${nodes.length} nodes, ${education.length} degrees`,
);
for (const c of clusters) console.log(`  ${c.index}. ${c.title.padEnd(38)} ${c.count} nodes`);
