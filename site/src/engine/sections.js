/**
 * Which topology the constellation should hold, decided by the document.
 *
 * This is the reference's own mechanism: every section carries a shape, and the
 * one nearest the centre of the viewport wins. The page scrolls normally and
 * the scene comments on whatever you are reading — rather than the page being a
 * blank scroll track that only drives a camera.
 *
 * The weight curve is the reference's too: a dead zone of 40% of the viewport
 * where a section counts as fully centred, then a linear falloff over another
 * 50%. Keeping the dead zone wide is what stops the shape flickering between
 * two topologies while a section slides past.
 */

const DEAD_ZONE = 0.4;
const FALLOFF = 0.5;

/**
 * @param sections  [{ shape, center }] with `center` in viewport pixels
 * @param viewport  viewport length along the scroll axis, in pixels
 * @returns { shape, weight } weight in [0,1]: how centred the winner is
 */
export function pickActiveShape(sections, viewport) {
  let shape = 0;
  let weight = 0;

  if (viewport <= 0) return { shape, weight };

  const dead = viewport * DEAD_ZONE;
  const range = viewport * FALLOFF;

  for (const section of sections) {
    const distance = Math.abs(section.center - viewport / 2);
    const candidate = Math.max(0, 1 - Math.max(0, distance - dead) / range);
    if (candidate > weight) {
      weight = candidate;
      shape = section.shape;
    }
  }

  return { shape, weight };
}

/**
 * How far the document sits between two topologies.
 *
 * A fraction of the gap at each end is held flat, so while a band is centred
 * the constellation is a resolved, motionless structure that can be read as
 * one. Between the plateaus the blend tracks the scroll exactly: scrolling
 * fast passes through the intermediate states instead of chasing a target it
 * never reaches, which is what the earlier snap-and-damp could not do.
 */
const PLATEAU = 0.3;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smoothstep = (t) => t * t * (3 - 2 * t);

/**
 * @param sections  [{ shape, center }] in document order, `center` in viewport pixels
 * @param viewport  viewport length along the scroll axis, in pixels
 * @returns { from, to, t, weight } with `t` in [0,1] between the two shapes
 */
export function pickActiveBlend(sections, viewport) {
  const { weight } = pickActiveShape(sections, viewport);
  if (viewport <= 0 || sections.length === 0) return { from: 0, to: 0, t: 0, weight: 0 };

  const mid = viewport / 2;
  if (sections.length === 1) {
    return { from: sections[0].shape, to: sections[0].shape, t: 0, weight };
  }

  // The last pair whose opening centre is at or above the centre line, so `a`
  // and `a + 1` bracket it. The loop bound caps it at the final pair.
  let a = 0;
  for (let i = 0; i < sections.length - 1; i += 1) {
    if (sections[i].center <= mid) a = i;
  }

  const A = sections[a];
  const B = sections[a + 1];

  // Outside the span of the centres there is no pair to bracket with: hold the
  // nearest end rather than extrapolating past it.
  if (mid <= A.center) return { from: A.shape, to: A.shape, t: 0, weight };
  if (mid >= B.center) return { from: B.shape, to: B.shape, t: 0, weight };

  const span = B.center - A.center;
  if (span <= 0) return { from: A.shape, to: A.shape, t: 0, weight };

  const u = (mid - A.center) / span;
  const t = smoothstep(clamp01((u - PLATEAU) / (1 - 2 * PLATEAU)));
  return { from: A.shape, to: B.shape, t, weight };
}

/** Reads section centres from the DOM. Elements carry `data-shape`. */
export function readSections(elements) {
  const sections = [];
  for (const element of elements) {
    const box = element.getBoundingClientRect();
    sections.push({
      shape: Number(element.dataset.shape) || 0,
      center: box.top + box.height / 2,
      element,
    });
  }
  return sections;
}
