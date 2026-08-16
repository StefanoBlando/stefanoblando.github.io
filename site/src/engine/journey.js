import { regionLayout } from './structure.js';

/**
 * The journey: a road between seven complex systems.
 *
 * Each destination of the site is its own region of the sky, with its own
 * topology, and the regions are wired to one another. The camera crosses the
 * bridges between them: two stops of travelling, then an arrival.
 *
 * Every position is derived from the region layout, which is derived from the
 * content. Nothing here is a coordinate somebody chose, which is what stops
 * two stops from framing the same place by accident.
 */

/** What each region is a link to. Order is the order the road visits them. */
const DESTINATIONS = [
  { region: 'research', label: 'Research', href: '/research/', cta: 'Four connected pillars' },
  { region: 'projects', label: 'Projects', href: '/projects/', cta: 'Research, built' },
  {
    region: 'publications',
    label: 'Publications',
    href: '/publications/',
    cta: 'Papers and proceedings',
  },
  { region: 'experience', label: 'Experience', href: '/experience/', cta: 'The academic path' },
  { region: 'network', label: 'Network', href: '/network/', cta: 'Co-authors and collaborators' },
  { region: 'news', label: 'News', href: '/blog/', cta: 'Recent updates' },
];

/** Stops of travelling between one destination and the next. */
const LEG_STOPS = 2;

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const length = (a) => Math.hypot(a[0], a[1], a[2]);
const mix = (a, b, t) => [
  a[0] * (1 - t) + b[0] * t,
  a[1] * (1 - t) + b[1] * t,
  a[2] * (1 - t) + b[2] * t,
];
const normalise = (a) => {
  const l = length(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

/**
 * Where to stand to see a region whole.
 *
 * Outside its body, on the side the camera is arriving from, so the approach
 * carries through the arrival instead of the camera swinging round to a fixed
 * vantage. Lifted a little above the line of travel: looking dead along the
 * bridge flattens the region into the one thread you came in on.
 */
function arrivalShot(region, previousCentre) {
  const from = previousCentre ?? add(region.centre, [0, region.radius * 2, region.radius * 3]);
  const back = normalise(sub(from, region.centre));
  const position = add(add(region.centre, scale(back, region.radius * 2.6)), [
    0,
    region.radius * 0.55,
    0,
  ]);
  return { position, target: region.centre };
}

/**
 * A stop partway along the bridge between two regions.
 *
 * Bowed outward from the straight line so the crossing arcs rather than
 * sliding, and aimed at where it is going: the point of a leg is that you can
 * see the destination coming.
 */
function travelShot(from, to, t) {
  const straight = mix(from.centre, to.centre, t);
  const outward = normalise(straight);
  const bow = Math.sin(t * Math.PI) * 1.4;
  return { position: add(straight, scale(outward, bow)), target: to.centre };
}

/**
 * Builds the road: an establishing shot, then each destination with the
 * travelling that leads to it, then a final shot pulling away.
 *
 * @returns [{ kind, region, label?, href?, cta?, tint, position, target }]
 */
export function buildJourney(universe) {
  const layout = regionLayout(universe);
  const byId = new Map(layout.map((region) => [region.id, region]));
  const stops = [];

  // The whole sky at once, so the seven regions register as one graph before
  // the road starts picking them off one at a time.
  const reach = Math.max(...layout.map((r) => length(r.centre) + r.radius));
  stops.push({
    kind: 'hero',
    region: null,
    position: [reach * 0.55, reach * 0.45, reach * 1.5],
    target: [0, 0, 0],
  });

  let previous = null;
  for (const destination of DESTINATIONS) {
    const region = byId.get(destination.region);
    if (!region) throw new Error(`no region for destination "${destination.region}"`);

    if (previous) {
      for (let k = 1; k <= LEG_STOPS; k += 1) {
        stops.push({
          kind: 'leg',
          region: null,
          ...travelShot(previous, region, k / (LEG_STOPS + 1)),
        });
      }
    }

    stops.push({
      kind: 'destination',
      region: region.index,
      label: destination.label,
      href: destination.href,
      cta: destination.cta,
      ...arrivalShot(region, previous?.centre ?? null),
    });
    previous = region;
  }

  const contact = byId.get('contact');
  for (let k = 1; k <= LEG_STOPS; k += 1) {
    stops.push({
      kind: 'leg',
      region: null,
      ...travelShot(previous, contact, k / (LEG_STOPS + 1)),
    });
  }
  stops.push({
    kind: 'contact',
    region: contact.index,
    ...arrivalShot(contact, previous.centre),
  });

  // A tint belongs to a destination and the travelling that leads to it, so
  // the colour changes on arrival — the moment the viewer is meant to notice.
  let zone = 0;
  for (const stop of stops) {
    if (stop.kind === 'destination' || stop.kind === 'contact') zone += 1;
    stop.tint = zone;
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
  return { position: mix(a.position, b.position, t), target: mix(a.target, b.target, t) };
}

/**
 * The stops that are pages — everything except the travelling.
 *
 * Returns their indices into the journey, so a page-to-page flight knows which
 * span of stops to fly through: the legs between two pages are the transition,
 * not destinations of their own.
 */
export function pagesOf(journey) {
  return journey.reduce((pages, stop, index) => {
    if (stop.kind !== 'leg') pages.push(index);
    return pages;
  }, []);
}
