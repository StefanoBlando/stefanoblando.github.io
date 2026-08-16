/**
 * The homepage's stations: what each stop of the journey says and where it
 * goes. The camera composition for each lives in `engine/waypoints.js`, keyed
 * by the same index.
 *
 * Data rather than markup so the two lists can be checked against each other —
 * a station without a waypoint would silently reuse its neighbour's camera.
 */
export const STATIONS = [
  { shape: 0, kind: 'hero' },
  { shape: 1, label: 'Research', href: '/research/', cta: 'Four connected pillars' },
  { shape: 2, label: 'Projects', href: '/projects/', cta: 'Research, built' },
  { shape: 3, label: 'Publications', href: '/publications/', cta: 'Papers and proceedings' },
  { shape: 4, label: 'Experience', href: '/experience/', cta: 'The academic path' },
  { shape: 5, label: 'Network', href: '/network/', cta: 'Co-authors and collaborators' },
  { shape: 6, label: 'News', href: '/blog/', cta: 'Recent updates' },
  { shape: 7, kind: 'contact' },
];
