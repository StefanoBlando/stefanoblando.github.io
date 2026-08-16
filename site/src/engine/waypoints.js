/**
 * The eight stations of the homepage, as camera compositions.
 *
 * The field no longer changes shape, so these are what make one station
 * different from the next: where you stand in the world, and what you are
 * looking at. A waypoint is a composition rather than a coordinate — the
 * region it frames, how full the frame is, and which side stays clear for the
 * text that sits over it.
 *
 * The numbers below are a starting point to be judged on screen, not derived.
 * `scripts/shoot.mjs` renders all eight; tune against those, not by reasoning
 * about the arithmetic.
 *
 * The field spans roughly a radius of 2.25 around the origin, so a position
 * beyond about 3 is outside looking in, and one under about 2 is inside it.
 */

export const WAYPOINTS = [
  // 1 Hero — outside the field, the whole body in view, text on the left.
  { id: 'hero', position: [1.6, 0.4, 5.6], target: [0.6, 0.0, 0.0] },
  // 2 Research — closing in, the body swinging toward frame right.
  { id: 'research', position: [2.6, 0.9, 3.4], target: [0.3, 0.1, 0.2] },
  // 3 Projects — inside the near edge, looking back across the field.
  { id: 'projects', position: [1.4, -0.7, 1.9], target: [-0.4, 0.2, -0.6] },
  // 4 Publications — low and wide, the field passing overhead.
  { id: 'publications', position: [-1.7, -1.1, 2.4], target: [0.2, 0.3, -0.2] },
  // 5 Experience — a long diagonal through the middle of the structure.
  { id: 'experience', position: [-2.7, 0.6, 0.4], target: [0.4, -0.1, 0.3] },
  // 6 Network — above it, looking down into the wiring.
  { id: 'network', position: [-1.1, 2.4, -1.6], target: [0.1, -0.2, 0.1] },
  // 7 News — coming back out on the far side.
  { id: 'news', position: [1.2, 1.0, -3.3], target: [-0.2, 0.0, 0.4] },
  // 8 Contact — pulled back, the whole body again, mirrored from the hero.
  { id: 'contact', position: [3.4, -0.3, -4.6], target: [0.0, 0.0, 0.0] },
];

const clampIndex = (i) => Math.max(0, Math.min(WAYPOINTS.length - 1, i | 0));

/**
 * The `a(1-t) + bt` form rather than `a + (b-a)t`.
 *
 * The second drifts at the ends — interpolating to t = 1 between -0.7 and 2.4
 * returns 2.4000000000000004 — and a station has to be exactly the composition
 * that was authored for it, not a float that nearly is.
 */
const lerp3 = (a, b, t) => [
  a[0] * (1 - t) + b[0] * t,
  a[1] * (1 - t) + b[1] * t,
  a[2] * (1 - t) + b[2] * t,
];

/**
 * Straight-line interpolation between two stations.
 *
 * Straight rather than curved on purpose: the scroll curve already shapes the
 * pacing, and easing the path as well made the two ease against each other.
 */
export function interpolateWaypoint(from, to, t) {
  const a = WAYPOINTS[clampIndex(from)];
  const b = WAYPOINTS[clampIndex(to)];
  return {
    position: lerp3(a.position, b.position, t),
    target: lerp3(a.target, b.target, t),
  };
}
