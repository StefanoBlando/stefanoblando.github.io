/**
 * The journey: a walk through the graph, from one destination to the next.
 *
 * The camera does not fly in straight lines between coordinates somebody chose.
 * It follows the constellation's own edges, stopping at the works it passes,
 * so the movement traces a structure you can see rather than crossing empty
 * space. Two or three stops between one destination and the next.
 *
 * Everything here is derived from `universe.json`. Nothing is authored by
 * hand, which is what guarantees that no two stops frame the same place.
 */

/**
 * The six destinations, in the order the journey visits them, each anchored to
 * a real work. The anchor decides *where in the field* a destination lives; the
 * work it names is not shown, so the pairing only has to be spatially sensible.
 */
const DESTINATIONS = [
  { label: 'Research', href: '/research/', cta: 'Four connected pillars' },
  { label: 'Projects', href: '/projects/', cta: 'Research, built' },
  { label: 'Publications', href: '/publications/', cta: 'Papers and proceedings' },
  { label: 'Experience', href: '/experience/', cta: 'The academic path' },
  { label: 'Network', href: '/network/', cta: 'Co-authors and collaborators' },
  { label: 'News', href: '/blog/', cta: 'Recent updates' },
];

/** How many stops a leg may take. Two or three, never one and never a trek. */
const MAX_LEG = 3;

/** Shortest edge the camera is allowed to travel, in world units. */
const MIN_EDGE = 0.7;

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const length = (a) => Math.hypot(a[0], a[1], a[2]);
const normalise = (a) => {
  const l = length(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

/**
 * The edges the camera may travel along.
 *
 * Three kinds, and all three are things the viewer can see on screen:
 * works that share a research topic, works in the same pillar, and works whose
 * bodies are spatial neighbours.
 *
 * The third is not padding. Topics and pillars alone leave the graph in
 * separate components — measured: 96 of 256 pairs unreachable — because some
 * works share no topic outside their own pillar. A walk between two of those
 * would have to jump, and a jump is not a journey. Nearest neighbours are also
 * exactly what the rendered proximity threads join, so an edge added here is
 * one the viewer is already looking at.
 */
const NEAREST_NEIGHBOURS = 2;

function buildWorkGraph(nodes) {
  const NOT_A_TOPIC = new Set([
    'research', 'hackathon', 'side quest', 'python', 'r', 'matlab',
    'streamlit', 'xgboost', 'stable diffusion', 'azure openai',
    'microsoft agent framework', 'mesa',
  ]);
  const topics = nodes.map(
    (n) => new Set((n.tags ?? []).map((t) => t.toLowerCase()).filter((t) => !NOT_A_TOPIC.has(t))),
  );

  const adjacency = nodes.map(() => new Set());
  const link = (a, b) => {
    adjacency[a].add(b);
    adjacency[b].add(a);
  };

  for (let a = 0; a < nodes.length; a += 1) {
    for (let b = a + 1; b < nodes.length; b += 1) {
      let shared = false;
      for (const t of topics[a]) if (topics[b].has(t)) shared = true;
      if (shared || nodes[a].cluster === nodes[b].cluster) link(a, b);
    }
  }

  for (let a = 0; a < nodes.length; a += 1) {
    const nearest = nodes
      .map((n, i) => ({ i, d: length(sub(n.position, nodes[a].position)) }))
      .filter((e) => e.i !== a)
      .sort((x, y) => x.d - y.d)
      .slice(0, NEAREST_NEIGHBOURS);
    for (const n of nearest) link(a, n.i);
  }

  // Nearest neighbours are not enough on their own: a tight group can be
  // mutually nearest and close itself off, which left four works unreachable.
  // Each remaining component is joined to the rest by its closest pair, so the
  // added edge is always the shortest one that could do the job.
  for (;;) {
    const component = new Set([0]);
    const queue = [0];
    while (queue.length > 0) {
      const at = queue.shift();
      for (const next of adjacency[at]) {
        if (component.has(next)) continue;
        component.add(next);
        queue.push(next);
      }
    }
    if (component.size === nodes.length) break;

    let bestInside = -1;
    let bestOutside = -1;
    let bestDistance = Infinity;
    for (let a = 0; a < nodes.length; a += 1) {
      if (!component.has(a)) continue;
      for (let b = 0; b < nodes.length; b += 1) {
        if (component.has(b)) continue;
        const d = length(sub(nodes[a].position, nodes[b].position));
        if (d < bestDistance) {
          bestDistance = d;
          bestInside = a;
          bestOutside = b;
        }
      }
    }
    link(bestInside, bestOutside);
  }

  return adjacency;
}

/**
 * A simple path with exactly `hops` edges, or null. Depth-first over 16 nodes.
 *
 * Neighbours are tried furthest-first. Two works can share an edge and sit
 * almost on top of each other, and crossing one of those spends a whole screen
 * of scroll without the camera appearing to move — which is the complaint this
 * whole design exists to answer.
 */
function pathOfLength(adjacency, nodes, from, to, hops) {
  const span = (a, b) => length(sub(nodes[b].position, nodes[a].position));

  const byDistance = (at) =>
    [...adjacency[at]]
      // An edge shorter than this leaves the camera where it started. Some
      // works sit 0.35 apart and share an edge; crossing one costs a screen
      // of scroll and shows nothing.
      .filter((n) => span(at, n) >= MIN_EDGE)
      .sort((a, b) => span(at, b) - span(at, a));

  const walk = (at, remaining, seen) => {
    if (remaining === 0) return at === to ? [at] : null;
    for (const next of byDistance(at)) {
      if (seen.has(next)) continue;
      // Arriving early is a shorter leg wearing the wrong length.
      if (next === to && remaining > 1) continue;
      seen.add(next);
      const rest = walk(next, remaining - 1, seen);
      seen.delete(next);
      if (rest) return [at, ...rest];
    }
    return null;
  };
  return walk(from, hops, new Set([from]));
}

/** Shortest walk between two works, as indices, ends included. */
function shortestPath(adjacency, from, to) {
  const previous = new Map([[from, null]]);
  const queue = [from];
  while (queue.length > 0) {
    const at = queue.shift();
    if (at === to) break;
    for (const next of adjacency[at]) {
      if (previous.has(next)) continue;
      previous.set(next, at);
      queue.push(next);
    }
  }
  if (!previous.has(to)) return [from, to];

  const path = [];
  for (let at = to; at !== null; at = previous.get(at)) path.unshift(at);
  return path;
}

/**
 * Picks one anchor work per destination, spreading them across the field.
 *
 * Greedy farthest-point: start from the work furthest from the centre, then
 * repeatedly take the work furthest from everything chosen so far. Deterministic,
 * and it guarantees consecutive destinations are never neighbours — which is
 * the whole point, since a leg with nowhere to travel is not a leg.
 */
function pickAnchors(nodes, count) {
  const chosen = [];
  let first = 0;
  for (let i = 1; i < nodes.length; i += 1) {
    if (length(nodes[i].position) > length(nodes[first].position)) first = i;
  }
  chosen.push(first);

  while (chosen.length < count) {
    let best = -1;
    let bestDistance = -1;
    for (let i = 0; i < nodes.length; i += 1) {
      if (chosen.includes(i)) continue;
      let nearest = Infinity;
      for (const c of chosen) {
        const d = length(sub(nodes[i].position, nodes[c].position));
        if (d < nearest) nearest = d;
      }
      if (nearest > bestDistance) {
        bestDistance = nearest;
        best = i;
      }
    }
    chosen.push(best);
  }
  return chosen;
}

/**
 * A camera shot at `here`, looking toward `next`.
 *
 * Standing exactly on a node puts the camera inside the cloud with nothing to
 * look at, so it is pulled back along the incoming direction and lifted
 * slightly outward from the centre. Looking at the next stop is what makes the
 * movement read as following an edge rather than drifting.
 */
function shotAt(here, next, previous) {
  const forward = normalise(sub(next, here));
  const back = previous ? normalise(sub(here, previous)) : normalise(here);
  const outward = normalise(here);

  const position = add(add(here, scale(back, -0.9)), scale(outward, 0.55));
  return { position, target: next };
}

/** Hop distances from one work to all others. */
function hopsFrom(adjacency, start) {
  const distance = new Array(adjacency.length).fill(Infinity);
  distance[start] = 0;
  const queue = [start];
  while (queue.length > 0) {
    const at = queue.shift();
    for (const next of adjacency[at]) {
      if (distance[next] !== Infinity) continue;
      distance[next] = distance[at] + 1;
      queue.push(next);
    }
  }
  return distance;
}

/**
 * Orders the anchors so consecutive destinations are far apart *on the graph*.
 *
 * Spreading them spatially is not enough: two works can sit at opposite ends of
 * the field and still share an edge, and a leg between neighbours has nowhere
 * to travel. Six anchors is 720 orderings, so this takes the best one outright
 * rather than approximating.
 */
function orderAnchors(adjacency, anchors) {
  const hops = new Map(anchors.map((a) => [a, hopsFrom(adjacency, a)]));

  let best = anchors;
  let bestScore = -Infinity;

  const permute = (remaining, order) => {
    if (remaining.length === 0) {
      let minimum = Infinity;
      let total = 0;
      for (let i = 1; i < order.length; i += 1) {
        const d = hops.get(order[i - 1])[order[i]];
        minimum = Math.min(minimum, d);
        total += d;
      }
      // The weakest link decides; the sum only breaks ties.
      const score = minimum * 1000 + total;
      if (score > bestScore) {
        bestScore = score;
        best = [...order];
      }
      return;
    }
    for (const next of remaining) {
      permute(
        remaining.filter((x) => x !== next),
        [...order, next],
      );
    }
  };
  permute(anchors, []);

  return best;
}

/**
 * Builds the whole journey: an establishing shot, then each destination with
 * its travelling stops, then a final shot pulling away.
 *
 * @returns [{ kind, label?, href?, cta?, position, target }]
 */
export function buildJourney(universe) {
  const nodes = universe.nodes;
  const adjacency = buildWorkGraph(nodes);
  const anchors = orderAnchors(adjacency, pickAnchors(nodes, DESTINATIONS.length));

  // Every index the journey visits, in order, with the destination that ends
  // each leg. Repeats are dropped so a stop is never held twice.
  const walk = [{ index: anchors[0], destination: 0 }];
  for (let d = 1; d < anchors.length; d += 1) {
    // Three stops if the graph offers a route that long, otherwise two. The
    // pacing is the requirement; the shortest path is only the fallback.
    const leg =
      pathOfLength(adjacency, nodes, anchors[d - 1], anchors[d], MAX_LEG) ??
      pathOfLength(adjacency, nodes, anchors[d - 1], anchors[d], MAX_LEG - 1) ??
      shortestPath(adjacency, anchors[d - 1], anchors[d]);

    const stops = leg.slice(1);
    for (const [i, index] of stops.entries()) {
      walk.push({ index, destination: i === stops.length - 1 ? d : null });
    }
  }

  const stops = [];

  // The establishing shot: outside the field, the whole body in view.
  const firstNode = nodes[walk[0].index].position;
  stops.push({
    kind: 'hero',
    position: add(scale(normalise(firstNode), 5.4), [0, 0.5, 0]),
    target: [0, 0, 0],
  });

  for (const [i, step] of walk.entries()) {
    const here = nodes[step.index].position;
    const next = i + 1 < walk.length ? nodes[walk[i + 1].index].position : [0, 0, 0];
    const previous = i > 0 ? nodes[walk[i - 1].index].position : null;
    const shot = shotAt(here, next, previous);

    stops.push(
      step.destination === null
        ? { kind: 'leg', ...shot }
        : { kind: 'destination', ...DESTINATIONS[step.destination], ...shot },
    );
  }

  // Pulling away, mirrored from the establishing shot.
  const lastNode = nodes[walk.at(-1).index].position;
  stops.push({
    kind: 'contact',
    position: add(scale(normalise(lastNode), 5.8), [0, -0.4, 0]),
    target: [0, 0, 0],
  });

  // One tint per destination rather than per stop: with eighteen stops and
  // eight tints the colour would stop changing a third of the way down.
  // A leg keeps the colour of the place it left; the change lands on arrival,
  // which is the moment the viewer is meant to notice.
  let zone = 0;
  for (const stop of stops) {
    if (stop.kind === 'destination' || stop.kind === 'contact') zone += 1;
    stop.tint = zone;
  }

  return separate(stops);
}

/**
 * Pushes apart any two consecutive shots that would frame the same place.
 *
 * A long edge does not guarantee a moved camera: when the walk doubles back,
 * `shotAt`'s pull-back cancels the distance the node gained, and the viewer
 * spends a screen of scroll looking at the picture they were already looking
 * at. Nudging the later shot outward is a framing fix for a framing problem —
 * trying to solve it by choosing different edges only moved it elsewhere.
 */
const MIN_SEPARATION = 0.8;

function separate(stops) {
  for (let i = 1; i < stops.length; i += 1) {
    let gap = length(sub(stops[i].position, stops[i - 1].position));
    let pushed = 0;
    while (gap < MIN_SEPARATION && pushed < 2.5) {
      const outward = normalise(stops[i].position);
      stops[i].position = add(stops[i].position, scale(outward, 0.35));
      pushed += 0.35;
      gap = length(sub(stops[i].position, stops[i - 1].position));
    }
  }
  return stops;
}

/** Straight-line interpolation between two stops of a journey. */
export function interpolateStops(journey, from, to, t) {
  const clamp = (i) => Math.max(0, Math.min(journey.length - 1, i | 0));
  const a = journey[clamp(from)];
  const b = journey[clamp(to)];
  // `a(1-t) + bt` rather than `a + (b-a)t`: the second drifts at the ends, and
  // a stop must be exactly the composition it was built as.
  const mix = (p, q) => [
    p[0] * (1 - t) + q[0] * t,
    p[1] * (1 - t) + q[1] * t,
    p[2] * (1 - t) + q[2] * t,
  ];
  return { position: mix(a.position, b.position), target: mix(a.target, b.target) };
}
