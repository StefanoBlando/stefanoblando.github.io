/**
 * Stepped navigation: two or three gestures advance one page.
 *
 * Free scrolling hands the pace of the animation to the input device. A
 * trackpad flick crosses three stops in a moment, so the journey reads as
 * chaos however carefully the path was built. Here the input only decides
 * *when* to advance; the transition itself always takes the same time, and
 * that time belongs to the site.
 *
 * The value this exposes is continuous — 3.4 means "forty per cent of the way
 * from page three to page four" — so the camera has something to interpolate
 * along rather than a sequence of jumps.
 */

/** Accumulated wheel distance that commits to the next page. */
const THRESHOLD = 260;

/** How long one page-to-page flight takes, in seconds. */
const DURATION = 1.7;

/** Input during a flight is ignored: the animation is not a scrubber. */
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export function createStepper({ pages, onChange, reducedMotion = false }) {
  let index = 0;
  let position = 0;
  let from = 0;
  let elapsed = 0;
  let flying = false;
  let accumulated = 0;

  const clamp = (i) => Math.max(0, Math.min(pages - 1, i));

  const goTo = (next) => {
    const target = clamp(next);
    if (flying || target === index) return;
    from = index;
    index = target;
    elapsed = 0;
    flying = !reducedMotion;
    if (reducedMotion) {
      position = index;
      onChange?.(position, index);
    }
    accumulated = 0;
  };

  const onWheel = (event) => {
    event.preventDefault();
    if (flying) return;

    // Sign changes mean a change of mind, not more of the same push.
    if (Math.sign(event.deltaY) !== Math.sign(accumulated)) accumulated = 0;
    accumulated += event.deltaY;

    if (Math.abs(accumulated) >= THRESHOLD) goTo(index + Math.sign(accumulated));
  };

  const KEYS = {
    ArrowDown: 1, PageDown: 1, ' ': 1,
    ArrowUp: -1, PageUp: -1,
  };

  const onKey = (event) => {
    if (event.key === 'Home') return goTo(0);
    if (event.key === 'End') return goTo(pages - 1);
    const direction = KEYS[event.key];
    if (direction === undefined) return;
    event.preventDefault();
    goTo(index + direction);
  };

  // Touch: one deliberate swipe is one page, which is what a phone expects.
  let touchStart = null;
  const onTouchStart = (event) => {
    touchStart = event.touches[0].clientY;
  };
  const onTouchMove = (event) => event.preventDefault();
  const onTouchEnd = (event) => {
    if (touchStart === null || flying) return;
    const moved = touchStart - (event.changedTouches[0]?.clientY ?? touchStart);
    if (Math.abs(moved) > 60) goTo(index + Math.sign(moved));
    touchStart = null;
  };

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('keydown', onKey);
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd);

  return {
    get position() {
      return position;
    },
    get index() {
      return index;
    },
    get flying() {
      return flying;
    },
    goTo,

    /** Advances the flight. Call once per frame with the frame's delta. */
    update(dt) {
      if (!flying) return position;
      elapsed += dt;
      const t = Math.min(1, elapsed / DURATION);
      position = from + (index - from) * easeInOut(t);
      if (t >= 1) {
        position = index;
        flying = false;
      }
      onChange?.(position, index);
      return position;
    },

    destroy() {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    },
  };
}
