/**
 * The site's colour identity, in one place.
 *
 * The scene and the stylesheet must agree, so both read from here: the CSS
 * custom properties below are written to mirror the active preset exactly.
 * Switching palette is changing `ACTIVE`, not recolouring the project.
 *
 * `smoke` is deliberately a desaturated, darkened relative of the primary. The
 * reference does the same — its nebula sits several steps duller than the
 * constellation, which is what keeps the atmosphere behind the subject instead
 * of competing with it.
 */

export const PRESETS = {
  /**
   * The reference's own scene colours and transition order, extracted from its
   * bundle. Kept as a comparison preset.
   *
   * Note the base colours are near-black. They are the *line* colour, and under
   * additive blending a near-black line contributes almost nothing — which is
   * precisely why the reference's threads read as a whisper. Expect the web to
   * all but vanish under this preset; that is faithful, not broken.
   */
  'reference-scene': {
    ink: '#08090b',
    paper: '#e8eef0',
    primary: '#22363e',
    accent: '#ffffff',
    smoke: '#5a8aa2',
    pale: '#ffffff',
    muted: '#6d7c85',
    dim: '#9aa39f',
    raised: '#0e1114',
    tints: [
      { primary: '#22363e', accent: '#ffffff', smoke: '#5a8aa2', scrim: '34, 54, 62' },
      { primary: '#1c2f52', accent: '#a8c3f0', smoke: '#5a8aa2', scrim: '28, 47, 82' },
      { primary: '#141416', accent: '#ffffff', smoke: '#5a8aa2', scrim: '20, 20, 22' },
      { primary: '#402d18', accent: '#ecc78e', smoke: '#5a8aa2', scrim: '64, 45, 24' },
      { primary: '#163a28', accent: '#93d9ac', smoke: '#5a8aa2', scrim: '22, 58, 40' },
    ],
  },
  /**
   * Tonal: one hue family throughout. The accent is not a contrasting colour
   * but a lighter step of the same blue, which is why nothing in the scene can
   * clash — there is only one hue to clash with.
   */
  'tonal-night': {
    ink: '#060a14',
    paper: '#dfe6f2',
    primary: '#6b8ab8', // the constellation and its threads
    accent: '#9dbbe8', // links and highlights: lighter, same family
    smoke: '#2a3d5c',
    pale: '#dfe6f2',
    muted: '#5a6b85',
    dim: '#93a2bc',
    raised: '#0c1222',
    /**
     * One pair per section, in scroll order: threads and points shift as the
     * document moves, the way the reference retints its object per chapter.
     * All stay inside the one hue family, so the shift reads as a change of
     * light rather than as a change of subject.
     */
    /**
     * A full set per section: threads and points, the smoke behind them, and
     * the page scrim. Tinting only the constellation left the background
     * unchanged and the shift read as a glitch rather than as a change of light.
     */
    tints: [
      { primary: '#6b8ab8', accent: '#9dbbe8', smoke: '#2a3d5c', scrim: '6, 10, 20' },
      { primary: '#8f83c8', accent: '#b6aef0', smoke: '#383457', scrim: '10, 8, 22' },
      { primary: '#4f9fc4', accent: '#8ad0ea', smoke: '#23485c', scrim: '4, 13, 22' },
      { primary: '#5a6fbe', accent: '#8f9fe8', smoke: '#2a3358', scrim: '7, 8, 24' },
      { primary: '#56a99b', accent: '#8fd8c6', smoke: '#204f49', scrim: '4, 15, 16' },
      // Selected work and selected publications, held across both bands.
      { primary: '#7b8fd0', accent: '#a9b8f2', smoke: '#2b3560', scrim: '8, 10, 26' },
      // The academic path.
      { primary: '#4c93b0', accent: '#86c6dc', smoke: '#1f4351', scrim: '4, 12, 18' },
      // News and contact, held across both bands.
      { primary: '#8a86c4', accent: '#b3aeea', smoke: '#332f52', scrim: '9, 8, 21' },
    ],
  },
  /** No chromatic accent at all; warmth lives only in the whites. */
  'mono-ivory': {
    ink: '#07070a',
    paper: '#efeae0',
    primary: '#b6b3ab',
    accent: '#efeae0',
    smoke: '#3a3a3d',
    pale: '#efeae0',
    muted: '#6f6d68',
    dim: '#9d9a93',
    raised: '#101014',
  },
  'ink-copper': {
    ink: '#060910',
    paper: '#ece7df',
    primary: '#7f9c92', // sage — the constellation and its wiring
    accent: '#c9704f', // copper — hubs, highlights, links
    smoke: '#4f6b63',
    pale: '#ece7df',
    muted: '#6d7c85',
    dim: '#9aa39f',
    raised: '#0b1019',
  },
  'graphite-prussian': {
    ink: '#0b0d10',
    paper: '#eef2f7',
    primary: '#7f9bc0',
    accent: '#3d6fb4',
    smoke: '#3c5170',
    pale: '#dce6f2',
    muted: '#6b7a8c',
    dim: '#9aa8ba',
    raised: '#11161d',
  },
  'night-amber': {
    ink: '#040a0a',
    paper: '#efe8da',
    primary: '#6f9481',
    accent: '#e0a458',
    smoke: '#40615a',
    pale: '#efe8da',
    muted: '#75837c',
    dim: '#9ba79c',
    raised: '#0a1211',
  },
};

export const ACTIVE = 'tonal-night';

export const palette = PRESETS[ACTIVE];
