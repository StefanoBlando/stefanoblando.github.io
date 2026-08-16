/**
 * One cloud of particles that takes a different shape for every page.
 *
 * Each page has its own complex-system topology — scale-free hubs, an
 * ensemble of stochastic trajectories, a two-community contagion network, a
 * small-world ring, a core and its periphery, a branching growth, a spreading
 * front. Arriving at a page is the cloud gathering into that shape.
 *
 * These same topologies were briefly scattered across the sky as separate
 * clusters with a camera travelling between them. That gave confusing jumps
 * and seven small bodies that read as debris; the shapes are worth more when
 * one cloud becomes each of them in turn, which is also what the reference
 * does. The earlier objection — that a road needs a world that holds still —
 * does not apply once there is no road.
 *
 * The wiring is computed once, from the resting layout, and holds through
 * every shape: a morph redraws the same relationships from a new geometry.
 * Works occupy contiguous wedges, so a work stays a recognisable body.
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

/** The shapes, in page order: hero, the six destinations, contact. */
const GENERATORS = [
  randomNetwork,
  scaleFree,
  corePeriphery,
  trajectories,
  branchingGrowth,
  smallWorld,
  percolationFront,
  twoCommunities,
];

export const SHAPE_COUNT = GENERATORS.length;

export function buildStructure(universe, count) {
  const works = universe.nodes;
  const rand = mulberry32(0x1d0c5);

  const owner = new Int32Array(count);
  const membersOf = works.map(() => []);
  for (let i = 0; i < count; i += 1) {
    const w = i % works.length;
    owner[i] = w;
    membersOf[w].push(i);
  }

  // Every shape normalised to the same extent, so a morph changes the figure
  // without the cloud lurching nearer or further from the camera.
  const layouts = GENERATORS.map((generator) => {
    const points = generator(count, rand);
    let extent = 0;
    for (const p of points) extent = Math.max(extent, Math.hypot(p[0], p[1], p[2]));
    const scale = extent > 0 ? 2.1 / extent : 1;
    return assignByWedge(
      points.map((p) => [p[0] * scale, p[1] * scale, p[2] * scale]),
      owner,
      count,
    );
  });

  const pairs = [];
  const strengths = [];
  // 0 = ambient thread, 1 = a real shared-topic relationship.
  const kinds = [];

  // Proximity threads over the resting shape. They are drawn across every
  // other shape too, which is what makes a morph read as one body moving
  // rather than as a new cloud appearing.
  const base = layouts[0];
  const PROXIMITY = 0.72;
  for (let i = 0; i < count; i += 1) {
    for (let j = i + 1; j < count; j += 1) {
      const dx = base[i * 3] - base[j * 3];
      const dy = base[i * 3 + 1] - base[j * 3 + 1];
      const dz = base[i * 3 + 2] - base[j * 3 + 2];
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d >= PROXIMITY) continue;
      pairs.push(i, j);
      const strength = Math.max(0.3, 1 - d / PROXIMITY);
      strengths.push(strength, strength);
      kinds.push(0, 0);
    }
  }
  const webEdges = pairs.length / 2;

  // Between works: only where they genuinely share a research topic.
  //
  // The tag vocabulary mixes three axes — research topics, the project
  // category taxonomy, and tooling. Only the first describes an intellectual
  // relationship, so the other two are excluded: a shared programming language
  // is not a shared idea, and an edge drawn from one would make the graph
  // assert something false.
  const NOT_A_TOPIC = new Set([
    'research', 'hackathon', 'side quest', 'python', 'r', 'matlab', 'streamlit',
    'xgboost', 'stable diffusion', 'azure openai', 'microsoft agent framework', 'mesa',
  ]);

  const tagsOf = works.map(
    (w) => new Set((w.tags ?? []).map((t) => t.toLowerCase()).filter((t) => !NOT_A_TOPIC.has(t))),
  );

  let bridges = 0;
  for (let a = 0; a < works.length; a += 1) {
    for (let b = a + 1; b < works.length; b += 1) {
      let shared = 0;
      for (const tag of tagsOf[a]) if (tagsOf[b].has(tag)) shared += 1;
      if (shared === 0) continue;

      const strength = Math.min(1, 0.5 + shared * 0.2);
      const spokes = Math.min(shared, 2);
      for (let s = 0; s < spokes; s += 1) {
        pairs.push(
          membersOf[a][(s * 7) % membersOf[a].length],
          membersOf[b][(s * 5) % membersOf[b].length],
        );
        strengths.push(strength, strength);
        kinds.push(1, 1);
        bridges += 1;
      }
    }
  }

  return {
    layouts,
    pairs: Int32Array.from(pairs),
    strengths: Float32Array.from(strengths),
    kinds: Float32Array.from(kinds),
    owner,
    stats: { shapes: layouts.length, works: works.length, edges: pairs.length / 2, web: webEdges, bridges },
  };
}
