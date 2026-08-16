/**
 * The constellation: seven complex systems in one sky.
 *
 * Each destination of the site is its own graph, with its own topology — a
 * scale-free hub network, an ensemble of stochastic trajectories, a
 * two-community contagion network, a small-world ring, a core and its
 * periphery, a branching growth, a spreading front. They sit apart from one
 * another and are joined by bridges, so the whole reads as one very large
 * graph whose regions happen to be built differently.
 *
 * Nothing morphs. An earlier build cycled the whole field between these same
 * topologies, which cannot coexist with a camera that travels: if the world
 * reshapes as you move through it, nothing you fly toward stays where it was.
 * Laying them out in space instead gives every destination a shape of its own
 * *and* keeps the world still enough to cross.
 *
 * A cluster's size comes from what is actually behind its link — thirteen
 * projects make a larger body than six publications — so the sky is a picture
 * of the site rather than decoration.
 */

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rand) {
  const u = Math.max(rand(), 1e-6);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
}

/** The resting network: a filled, evenly wired cloud. */
function randomNetwork(count, rand) {
  const points = [];
  for (let i = 0; i < count; i += 1) {
    const radius = 0.75 + Math.cbrt(rand()) * 1.5;
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    points.push([
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi),
    ]);
  }
  return points;
}









/** Power-law hubs: a handful of dense centres, each with its own periphery. */
function scaleFree(count, rand) {
  const hubCount = 6;
  const hubs = [];
  for (let h = 0; h < hubCount; h += 1) {
    const theta = (h / hubCount) * Math.PI * 2 + rand() * 0.4;
    const r = 0.9 + rand() * 0.7;
    hubs.push([Math.cos(theta) * r, (rand() - 0.5) * 1.5, Math.sin(theta) * r]);
  }

  const points = [];
  for (let i = 0; i < count; i += 1) {
    // Preferential attachment: the first hubs draw disproportionately more.
    const pick = Math.min(hubCount - 1, Math.floor(hubCount * Math.pow(rand(), 1.7)));
    const hub = hubs[pick];
    const spread = 0.24 + rand() * 0.5;
    points.push([
      hub[0] + gaussian(rand) * spread,
      hub[1] + gaussian(rand) * spread,
      hub[2] + gaussian(rand) * spread,
    ]);
  }
  return points;
}

/** An ensemble of stochastic trajectories: what statistical verification samples. */
function trajectories(count, rand) {
  const bundles = 7;
  const perBundle = Math.ceil(count / bundles);
  const points = [];

  for (let b = 0; b < bundles && points.length < count; b += 1) {
    // Runs start from nearly the same state and diverge — the reason one trace
    // is never enough.
    let x = (rand() - 0.5) * 0.25;
    let y = (rand() - 0.5) * 0.25;
    let z = (rand() - 0.5) * 0.25;
    const drift = 0.12 + rand() * 0.1;
    const swirl = 0.8 + rand() * 0.7;

    for (let k = 0; k < perBundle && points.length < count; k += 1) {
      const t = k / perBundle;
      x += Math.cos(t * Math.PI * 2 * swirl) * drift + gaussian(rand) * 0.045;
      y += 0.055 * Math.sin(t * Math.PI * 1.6 + b) + gaussian(rand) * 0.045;
      z += Math.sin(t * Math.PI * 2 * swirl) * drift + gaussian(rand) * 0.045;
      points.push([x * 0.55, y * 1.5 - 0.3, z * 0.55]);
    }
  }
  while (points.length < count) points.push(points[points.length - 1].slice());
  return points;
}

/** Two communities joined by a thin bridge: the contagion picture. */
function twoCommunities(count, rand) {
  const coreA = [-1.05, 0.12, 0];
  const coreB = [1.05, -0.12, 0];
  const points = [];

  for (let i = 0; i < count; i += 1) {
    if (i % 9 === 0) {
      // The exposure channel between them: thin, and therefore fragile.
      const t = rand();
      points.push([
        coreA[0] + (coreB[0] - coreA[0]) * t,
        coreA[1] + (coreB[1] - coreA[1]) * t + gaussian(rand) * 0.16,
        gaussian(rand) * 0.16,
      ]);
      continue;
    }
    const core = i % 2 === 0 ? coreA : coreB;
    const spread = 0.3 + Math.cbrt(rand()) * 0.55;
    points.push([
      core[0] + gaussian(rand) * spread,
      core[1] + gaussian(rand) * spread,
      core[2] + gaussian(rand) * spread,
    ]);
  }
  return points;
}

/** A small-world ring: dense local neighbourhoods, a few long shortcuts. */
function smallWorld(count, rand) {
  const points = [];
  for (let i = 0; i < count; i += 1) {
    if (rand() < 0.14) {
      // The shortcuts that collapse the diameter of the network.
      const radius = Math.cbrt(rand()) * 1.05;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      points.push([
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta) * 0.7,
        radius * Math.cos(phi),
      ]);
      continue;
    }
    const angle = (i / count) * Math.PI * 2;
    const r = 1.55 + gaussian(rand) * 0.16;
    points.push([Math.cos(angle) * r, gaussian(rand) * 0.34, Math.sin(angle) * r]);
  }
  return points;
}

/** A dense core inside a thin shell: the shape of work held up as strongest. */
function corePeriphery(count, rand) {
  const points = [];
  for (let i = 0; i < count; i += 1) {
    // A third of the cloud forms the core; the rest is a diffuse halo.
    if (i % 3 === 0) {
      const radius = Math.cbrt(rand()) * 0.62;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      points.push([
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
      ]);
      continue;
    }
    const radius = 1.35 + Math.cbrt(rand()) * 0.85;
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    points.push([
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta) * 0.8,
      radius * Math.cos(phi),
    ]);
  }
  return points;
}

/** A branching growth process: one trajectory that keeps splitting. */
function branchingGrowth(count, rand) {
  const SEED = { p: [0, -1.7, 0], d: [0, 1, 0] };
  let frontier = [SEED];
  const points = [];

  while (points.length < count) {
    const next = [];
    for (const tip of frontier) {
      if (points.length >= count) break;
      const step = 0.26 + rand() * 0.12;
      const p = [
        tip.p[0] + tip.d[0] * step + gaussian(rand) * 0.06,
        tip.p[1] + tip.d[1] * step + gaussian(rand) * 0.06,
        tip.p[2] + tip.d[2] * step + gaussian(rand) * 0.06,
      ];
      points.push([p[0] * 0.9, p[1] * 0.85, p[2] * 0.9]);

      // Split or continue. The frontier is capped, and a tip that wanders too
      // far is retired: without both, the structure compounds out of frame.
      const children = rand() < 0.32 ? 2 : 1;
      for (let c = 0; c < children && next.length < 26; c += 1) {
        if (Math.hypot(p[0], p[1], p[2]) > 2.6) continue;
        const spread = children === 2 ? 0.55 : 0.16;
        const d = [
          tip.d[0] + gaussian(rand) * spread,
          tip.d[1] + gaussian(rand) * spread * 0.4 + 0.12,
          tip.d[2] + gaussian(rand) * spread,
        ];
        const length = Math.hypot(d[0], d[1], d[2]) || 1;
        next.push({ p, d: [d[0] / length, d[1] / length, d[2] / length] });
      }
    }
    // A frontier that dies out entirely would loop forever.
    frontier = next.length > 0 ? next : [SEED];
  }
  return points;
}

/** A percolation front: a cluster spreading outward from a seed. */
function percolationFront(count, rand) {
  const points = [];
  for (let i = 0; i < count; i += 1) {
    // Radius grows with index, so later particles sit further out and the
    // cluster reads as something that arrived rather than as a static shell.
    const progress = i / count;
    const radius = 0.35 + progress * 1.55 + gaussian(rand) * 0.12;
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    // Anisotropy keeps the front ragged instead of spherical.
    const ragged = 1 + Math.sin(theta * 5 + phi * 3) * 0.22;
    points.push([
      radius * ragged * Math.sin(phi) * Math.cos(theta),
      radius * ragged * Math.sin(phi) * Math.sin(theta) * 0.75,
      radius * ragged * Math.cos(phi),
    ]);
  }
  return points;
}

/**
 * Orders a structure's points so consecutive slots are spatial neighbours, then
 * hands contiguous blocks to each work. Without this a work's particles scatter
 * through the structure and its body dissolves.
 */
function assignByWedge(points, owner, count) {
  const order = points
    .map((p, i) => ({ i, key: Math.atan2(p[2], p[0]) + p[1] * 0.35 }))
    .sort((a, b) => a.key - b.key)
    .map((entry) => entry.i);

  const byWork = new Map();
  owner.forEach((w, i) => {
    if (!byWork.has(w)) byWork.set(w, []);
    byWork.get(w).push(i);
  });

  const positions = new Float32Array(count * 3);
  let cursor = 0;
  for (const members of byWork.values()) {
    for (const particle of members) {
      const p = points[order[cursor]];
      positions[particle * 3] = p[0];
      positions[particle * 3 + 1] = p[1];
      positions[particle * 3 + 2] = p[2];
      cursor += 1;
    }
  }
  return positions;
}

/**
 * The seven regions of the sky, in the order the journey visits them.
 *
 * Each destination gets a topology whose character suits it: hubs for the
 * research that fans out from a few ideas, stochastic trajectories for the
 * papers, a core and periphery for the projects, and so on. The pairing is a
 * judgement, not a derivation — but the *sizes* are not, and neither is the
 * wiring.
 */
const REGIONS = [
  { id: 'research', generator: scaleFree, weigh: (u) => u.nodes.length },
  { id: 'projects', generator: corePeriphery, weigh: (u) => u.nodes.filter((n) => n.kind === 'project').length },
  { id: 'publications', generator: trajectories, weigh: (u) => u.nodes.filter((n) => n.kind === 'publication').length },
  { id: 'experience', generator: branchingGrowth, weigh: (u) => u.education.length + u.experience.length },
  { id: 'network', generator: smallWorld, weigh: (u) => u.counts?.coauthors ?? 12 },
  { id: 'news', generator: percolationFront, weigh: (u) => u.counts?.posts ?? 7 },
  { id: 'contact', generator: twoCommunities, weigh: () => 4 },
];

/** How far the region centres sit from the origin. */
const SKY_RADIUS = 3.7;
/** Smallest share of the particles a region may get: below this it is a smudge. */
const MIN_SHARE = 0.06;
/** Proximity threshold for threads inside a region, relative to its own radius. */
const THREAD_REACH = 0.42;

/**
 * Region centres on a sphere, spread by the golden angle.
 *
 * Evenly spaced rather than random: two regions overlapping would read as one
 * misshapen blob, and the journey would have nowhere to travel between them.
 */
function regionCentres(count) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: count }, (unused, i) => {
    const y = 1 - (i / Math.max(1, count - 1)) * 2;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    // Flattened in y: the camera travels mostly sideways, and a sky that is as
    // tall as it is wide puts half of it above and below the frame.
    return [Math.cos(theta) * ring * SKY_RADIUS, y * SKY_RADIUS * 0.42, Math.sin(theta) * ring * SKY_RADIUS];
  });
}

/**
 * Seven complex systems, placed in one sky and wired to each other.
 *
 * @returns positions, per-particle region ownership, the thread pairs, and the
 *   regions themselves with their centres and radii — the journey needs those
 *   to know where it is going.
 */
/**
 * Where the regions are and how big, independent of particle count.
 *
 * The journey needs this and must get the same answer as the scene, which
 * builds at 350 particles on a desktop and 220 on a phone. Deriving the radius
 * from the share rather than from the realised count is what keeps the two in
 * agreement.
 */
export function regionLayout(universe) {
  const centres = regionCentres(REGIONS.length);
  const weights = REGIONS.map((region) => Math.max(1, region.weigh(universe)));
  const total = weights.reduce((sum, w) => sum + w, 0);
  const shares = weights.map((w) => Math.max(MIN_SHARE, w / total));
  const shareTotal = shares.reduce((sum, w) => sum + w, 0);

  return REGIONS.map((region, r) => ({
    id: region.id,
    index: r,
    centre: centres[r],
    share: shares[r] / shareTotal,
    radius: 0.58 + (shares[r] / shareTotal) * 1.65,
  }));
}

export function buildStructure(universe, count) {
  const rand = mulberry32(0x1d0c5);
  const layout = regionLayout(universe);

  const sizes = layout.map((region) => Math.max(6, Math.round(region.share * count)));
  // Rounding drifts; the last region absorbs it so the buffers stay exact.
  const drift = count - sizes.reduce((sum, n) => sum + n, 0);
  sizes[sizes.length - 1] += drift;

  const positions = new Float32Array(count * 3);
  const owner = new Int32Array(count);
  const regions = [];

  let cursor = 0;
  for (const [r, region] of REGIONS.entries()) {
    const size = sizes[r];
    // A region with more behind it is physically larger, so the sky is a
    // picture of the site rather than seven interchangeable blobs.
    const { centre, radius } = layout[r];

    const local = region.generator(size, rand);
    // Generators return clouds of differing natural extent; normalising makes
    // the radius above mean the same thing for all seven.
    let extent = 0;
    for (const p of local) extent = Math.max(extent, Math.hypot(p[0], p[1], p[2]));
    const scale = extent > 0 ? radius / extent : 1;

    const first = cursor;
    for (const p of local) {
      positions[cursor * 3] = centre[0] + p[0] * scale;
      positions[cursor * 3 + 1] = centre[1] + p[1] * scale;
      positions[cursor * 3 + 2] = centre[2] + p[2] * scale;
      owner[cursor] = r;
      cursor += 1;
    }

    regions.push({ id: region.id, index: r, centre, radius, size, first, last: cursor - 1 });
  }

  const pairs = [];
  const strengths = [];
  // 0 = a thread inside a region, 1 = a bridge between two of them.
  const kinds = [];

  // Threads inside each region only: a proximity pass over the whole sky would
  // be 60k comparisons and would web unrelated regions together anyway.
  for (const region of regions) {
    const reach = region.radius * THREAD_REACH;
    for (let i = region.first; i <= region.last; i += 1) {
      for (let j = i + 1; j <= region.last; j += 1) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d >= reach) continue;
        pairs.push(i, j);
        const strength = Math.max(0.3, 1 - d / reach);
        strengths.push(strength, strength);
        kinds.push(0, 0);
      }
    }
  }
  const webEdges = pairs.length / 2;

  // Bridges: each region reaches to the next, and to its nearest neighbour in
  // space. Without them the sky is seven separate objects rather than one
  // graph whose regions happen to be built differently — and the journey needs
  // something to travel along.
  const BRIDGES_PER_PAIR = 14;
  const linked = new Set();
  const bridge = (a, b) => {
    const key = a < b ? `${a}:${b}` : `${b}:${a}`;
    if (a === b || linked.has(key)) return;
    linked.add(key);

    const from = regions[a];
    const to = regions[b];
    for (let k = 0; k < BRIDGES_PER_PAIR; k += 1) {
      // Spread along each region's span rather than all from one point, so a
      // bridge reads as a sheaf of threads instead of a single wire.
      const i = from.first + Math.floor(((k + 0.5) / BRIDGES_PER_PAIR) * from.size);
      const j = to.first + Math.floor(((k + 0.5) / BRIDGES_PER_PAIR) * to.size);
      pairs.push(Math.min(i, from.last), Math.min(j, to.last));
      strengths.push(0.55, 0.55);
      kinds.push(1, 1);
    }
  };

  for (let r = 0; r < regions.length; r += 1) {
    bridge(r, (r + 1) % regions.length);

    let nearest = -1;
    let best = Infinity;
    for (let q = 0; q < regions.length; q += 1) {
      if (q === r) continue;
      const d = Math.hypot(
        regions[r].centre[0] - regions[q].centre[0],
        regions[r].centre[1] - regions[q].centre[1],
        regions[r].centre[2] - regions[q].centre[2],
      );
      if (d < best) {
        best = d;
        nearest = q;
      }
    }
    bridge(r, nearest);
  }

  return {
    positions,
    regions,
    pairs: Int32Array.from(pairs),
    strengths: Float32Array.from(strengths),
    kinds: Float32Array.from(kinds),
    owner,
    stats: {
      regions: regions.length,
      edges: pairs.length / 2,
      web: webEdges,
      bridges: pairs.length / 2 - webEdges,
    },
  };
}
