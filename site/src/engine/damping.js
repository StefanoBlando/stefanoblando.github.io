/**
 * Frame-rate independent exponential damping.
 *
 * The prototype in portfolio-v2 used `x += (target - x) * k` every frame, which
 * makes motion twice as fast on a 120 Hz display as on a 60 Hz one. Folding the
 * real elapsed time into the exponent removes that dependency: damping for one
 * second gives the same result whether it arrived in one step or sixty.
 *
 * `lambda` is a rate, not a per-frame fraction: higher converges faster.
 */
export function damp(current, target, lambda, dt) {
  return target + (current - target) * Math.exp(-lambda * dt);
}

/** Applies `damp` component-wise to any {x,y,z}-shaped target, in place. */
export function dampVector(current, target, lambda, dt) {
  current.x = damp(current.x, target.x, lambda, dt);
  current.y = damp(current.y, target.y, lambda, dt);
  current.z = damp(current.z, target.z, lambda, dt);
  return current;
}

/** Clamps a delta time so a backgrounded tab does not resume with a huge jump. */
export function clampDelta(dt, max = 0.05) {
  return Math.min(Math.max(dt, 0), max);
}
