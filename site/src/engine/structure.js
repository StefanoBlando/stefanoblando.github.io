/**
 * The constellation as the site's actual structure.
 *
 * Every particle belongs to one real work, and the wiring is real too:
 * proximity threads through the network, plus bridges between works that
 * genuinely share a research topic.
 *
 * There is one structure and it does not change. Earlier builds morphed
 * between several, which cannot coexist with a camera that travels: if the
 * world reshapes as you move through it, nothing you fly toward stays where
 * it was, and there is no journey. The other generators were deleted rather
 * than left dormant; git holds them.
 *
 * Works occupy contiguous wedges of the structure, so each work reads as a
 * body and its bridges keep their meaning.
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

  const positions = assignByWedge(randomNetwork(count, rand), owner, count);

  const pairs = [];
  const strengths = [];
  // 0 = ambient thread, 1 = a real shared-topic relationship.
  const kinds = [];

  // Proximity threads over the structure itself, so the wiring is exactly
  // true to the geometry it is drawn across.
  const base = positions;
  const PROXIMITY = 0.72;
  // No cap on connections, as in the reference: the web reads because faint
  // threads accumulate where they overlap, not because any one of them is bright.
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
  // The tag vocabulary mixes three axes — research topics, the project category
  // taxonomy, and tooling. Only the first describes an intellectual
  // relationship, so the other two are excluded: a shared programming language
  // is not a shared idea, and an edge drawn from one would make the graph
  // assert something false.
  const NOT_A_TOPIC = new Set([
    'research',
    'hackathon',
    'side quest',
    'python',
    'r',
    'matlab',
    'streamlit',
    'xgboost',
    'stable diffusion',
    'azure openai',
    'microsoft agent framework',
    'mesa',
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
    positions,
    pairs: Int32Array.from(pairs),
    strengths: Float32Array.from(strengths),
    kinds: Float32Array.from(kinds),
    owner,
    stats: { works: works.length, edges: pairs.length / 2, web: webEdges, bridges },
  };
}
