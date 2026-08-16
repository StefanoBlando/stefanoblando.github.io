import { clampDelta, damp } from './damping.js';

/**
 * Page-level smooth scrolling.
 *
 * The camera was already damped, but the text was not: it moved on the raw
 * scroll position while the scene glided, so the two obeyed different laws and
 * the page felt like two things bolted together. Here the content is moved by
 * a damped value and the scene reads its position from the resulting layout,
 * so both ride the same inertia.
 *
 * The document keeps a real scrollbar — a spacer holds the full height — so
 * the wheel, the keyboard, the scrollbar and anchor links all behave normally.
 * Only the painting is deferred.
 *
 * Roughly 6 per second: fast enough that dragging the scrollbar does not feel
 * disconnected from the page, slow enough to read as weight.
 */
const SCROLL_RATE = 6;

export function installSmoothScroll({ content, spacer }) {
  // Someone who has asked for less motion has asked for exactly this to stop.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

  let current = window.scrollY;
  let running = true;
  let last = performance.now();

  const measure = () => {
    spacer.style.height = `${content.scrollHeight}px`;
  };

  content.style.position = 'fixed';
  content.style.top = '0';
  content.style.left = '0';
  content.style.width = '100%';
  content.style.willChange = 'transform';
  measure();

  const observer = new ResizeObserver(measure);
  observer.observe(content);

  const frame = (now) => {
    if (!running) return;
    requestAnimationFrame(frame);

    const dt = clampDelta((now - last) / 1000);
    last = now;

    const target = window.scrollY;
    current = damp(current, target, SCROLL_RATE, dt);

    // Snap the last fraction of a pixel: without it the transform never
    // settles and the compositor repaints the whole page forever.
    if (Math.abs(target - current) < 0.05) current = target;

    content.style.transform = `translate3d(0, ${-current}px, 0)`;
  };
  requestAnimationFrame(frame);

  /**
   * Anchor links, by hand.
   *
   * The content sits in a fixed, transformed container, so the browser cannot
   * work out a target's document offset and a native hash jump lands nowhere.
   * `offsetTop` inside the container is that offset, so scrolling the document
   * to it puts the target where the browser would have.
   */
  const onAnchorClick = (event) => {
    const link = event.target.closest?.('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target || !content.contains(target)) return;

    event.preventDefault();
    window.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
    history.replaceState(null, '', `#${id}`);
  };
  document.addEventListener('click', onAnchorClick);

  return {
    /** The damped position, which is what the page is actually showing. */
    get position() {
      return current;
    },
    destroy() {
      running = false;
      observer.disconnect();
      document.removeEventListener('click', onAnchorClick);
      content.style.transform = '';
      content.style.position = '';
    },
  };
}
