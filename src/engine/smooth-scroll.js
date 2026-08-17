import Lenis from 'lenis';

/**
 * Smooth scrolling, with the reference's own settings.
 *
 * These three numbers were read out of the reference's shipped bundle rather
 * than guessed: `duration: 1.1`, an exponential ease-out, and smooth wheel
 * handling. Two hand-rolled attempts at this — a damped transform, then a
 * stepper that advanced a page at a time — both missed, because the feel comes
 * from the easing curve and not from the mechanism.
 *
 * The important discovery is what the reference does *not* do: it never snaps
 * to a section. The scroll stays free and continuous, and the impression that
 * two or three gestures carry you to the next section comes from this easing
 * over tall sections. Building discrete pages was imitating the wrong thing.
 *
 * Lenis drives the window's real scroll, so `window.scrollY` is already the
 * smoothed value and the engine needs no wiring to it at all.
 */
export function installSmoothScroll() {
  // Someone who has asked for less motion has asked for exactly this to stop.
  // The reference makes the same check before constructing anything.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  const frame = (time) => {
    lenis.raf(time);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  return lenis;
}
