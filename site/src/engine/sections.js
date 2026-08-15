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
