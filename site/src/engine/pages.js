import { SHAPE_COUNT } from './structure.js';

/**
 * The pages of the homepage: what each says, what shape the cloud takes, and
 * where the camera stands to watch it happen.
 *
 * Eight pages, eight shapes, one per page. Arriving at a page is the cloud
 * gathering into that page's topology; the camera only turns slowly around it,
 * because the event is the morph and a camera doing its own travelling
 * competes with it.
 */

const PAGES = [
  { kind: 'hero' },
  { kind: 'destination', label: 'Research', href: '/research/', cta: 'Four connected pillars' },
  { kind: 'destination', label: 'Projects', href: '/projects/', cta: 'Research, built' },
  {
    kind: 'destination',
    label: 'Publications',
    href: '/publications/',
    cta: 'Papers and proceedings',
  },
  { kind: 'destination', label: 'Experience', href: '/experience/', cta: 'The academic path' },
  {
    kind: 'destination',
    label: 'Network',
    href: '/network/',
    cta: 'Co-authors and collaborators',
  },
  { kind: 'destination', label: 'News', href: '/blog/', cta: 'Recent updates' },
  { kind: 'contact' },
];

/**
 * Three quarters of a turn across the whole journey, and a slow rise and fall
 * in height. Enough that no two pages are the same view of the same shape,
 * far less than the shape itself is doing.
 */
const SWEEP = Math.PI * 1.5;
const DISTANCE = 5.4;

function cameraFor(index, total) {
  const progress = total > 1 ? index / (total - 1) : 0;
  const azimuth = progress * SWEEP;
  const elevation = Math.sin(progress * Math.PI) * 0.34;
  // Closer in the middle of the journey, wider at the two ends, so the first
  // and last pages read as an establishing shot and a farewell.
  const distance = DISTANCE - Math.sin(progress * Math.PI) * 0.9;
  const planar = Math.cos(elevation) * distance;

  return {
    position: [Math.sin(azimuth) * planar, Math.sin(elevation) * distance, Math.cos(azimuth) * planar],
    target: [0, 0, 0],
  };
}

/**
 * @returns [{ kind, label?, href?, cta?, shape, tint, position, target }]
 */
export function buildPages() {
  if (PAGES.length !== SHAPE_COUNT) {
    throw new Error(`${PAGES.length} pages against ${SHAPE_COUNT} shapes: every page needs one`);
  }

  return PAGES.map((page, index) => ({
    ...page,
    shape: index,
    // One tint per page, in step with the shape it belongs to.
    tint: index,
    ...cameraFor(index, PAGES.length),
  }));
}

/** Straight-line interpolation between two pages' camera positions. */
export function interpolateCamera(pages, from, to, t) {
  const clamp = (i) => Math.max(0, Math.min(pages.length - 1, i | 0));
  const a = pages[clamp(from)];
  const b = pages[clamp(to)];
  // `a(1-t) + bt` rather than `a + (b-a)t`: the second drifts at the ends, and
  // a page must be exactly the composition it was built as.
  const mix = (p, q) => [
    p[0] * (1 - t) + q[0] * t,
    p[1] * (1 - t) + q[1] * t,
    p[2] * (1 - t) + q[2] * t,
  ];
  return { position: mix(a.position, b.position, t), target: mix(a.target, b.target, t) };
}
