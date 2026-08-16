/**
 * Generates the social card and the icons.
 *
 * A shared link is often the first thing anyone sees of the site, and until
 * now it had nothing to show: the head carried no Open Graph tags at all, so
 * a link on LinkedIn rendered as a bare URL. This draws the card from the same
 * portrait, palette and type the site itself uses, so the two agree.
 *
 * Run through `npm run universe`; the outputs are committed.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(here, '../public');
const PORTRAIT = join(PUBLIC, 'media/portrait.png');

/** Read from the generated palette so the card cannot drift from the site. */
const palette = readFileSync(join(here, '../src/styles/palette.css'), 'utf8');
const token = (name) => palette.match(new RegExp(`--${name}:\\s*([^;]+);`))[1].trim();

const INK = token('ink');
const PAPER = token('paper');
const GOLD = token('gold');
const MUTED = token('muted');

const W = 1200;
const H = 630;

const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const NAME = 'Stefano Blando';
const ROLE = 'AI Researcher & PhD Candidate';
// Two lines, because one ran under the portrait and was cut in half.
const LINES = [
  'Adaptive multi-agent systems · Statistical verification',
  'Robust quantitative methods for economic systems',
];
const HOME = 'Scuola Superiore Sant’Anna · University of Pisa';

/**
 * The card, as SVG. Type is drawn with the generic families rather than the
 * site's webfonts: librsvg substitutes silently for a font it cannot load,
 * and a card that renders differently on the build machine than in the design
 * is worse than one that never claimed the face.
 */
const card = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="wash" cx="78%" cy="14%" r="78%">
      <stop offset="0%" stop-color="#2a3d5c" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${INK}" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="round"><circle cx="0" cy="0" r="96"/></clipPath>
  </defs>

  <rect width="${W}" height="${H}" fill="${INK}"/>
  <rect width="${W}" height="${H}" fill="url(#wash)"/>
  <rect x="0" y="0" width="${W}" height="6" fill="${GOLD}" opacity="0.85"/>

  <g font-family="Helvetica, Arial, sans-serif">
    <text x="82" y="232" fill="${GOLD}" font-size="22" font-weight="600"
          letter-spacing="4.4">${escape(ROLE.toUpperCase())}</text>
    <text x="80" y="312" fill="${PAPER}" font-size="76" font-weight="600"
          letter-spacing="-1.5">${escape(NAME)}</text>
    <text x="82" y="374" fill="${MUTED}" font-size="23">${escape(LINES[0])}</text>
    <text x="82" y="408" fill="${MUTED}" font-size="23">${escape(LINES[1])}</text>
    <line x1="82" y1="462" x2="300" y2="462" stroke="${GOLD}" stroke-opacity="0.4"/>
    <text x="82" y="510" fill="${PAPER}" font-size="23" opacity="0.7">${escape(HOME)}</text>
  </g>
</svg>`;

mkdirSync(join(PUBLIC, 'media'), { recursive: true });

const portrait = await sharp(PORTRAIT).resize(192, 192, { fit: 'cover' }).png().toBuffer();

// A circular mask for the portrait, composited at the right of the card.
const mask = Buffer.from(
  `<svg width="192" height="192"><circle cx="96" cy="96" r="96" fill="#fff"/></svg>`,
);
const round = await sharp(portrait)
  .composite([{ input: mask, blend: 'dest-in' }])
  .png()
  .toBuffer();

await sharp(Buffer.from(card))
  .composite([
    { input: round, left: 900, top: 219 },
    {
      input: Buffer.from(
        `<svg width="208" height="208"><circle cx="104" cy="104" r="102" fill="none"
           stroke="${GOLD}" stroke-opacity="0.55" stroke-width="1.5"/></svg>`,
      ),
      left: 892,
      top: 211,
    },
  ])
  .png()
  .toFile(join(PUBLIC, 'media/social-card.png'));

/*
 * The favicon is the wordmark's own mark: the initials and the full stop that
 * the site sets in gold. Drawn as SVG so it stays sharp, with a PNG for the
 * platforms that still refuse one.
 */
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="${INK}"/>
  <text x="32" y="42" text-anchor="middle" font-family="Helvetica, Arial, sans-serif"
        font-size="30" font-weight="700" letter-spacing="-0.5" fill="${PAPER}">SB<tspan fill="${GOLD}">.</tspan></text>
</svg>`;

writeFileSync(join(PUBLIC, 'favicon.svg'), `${icon}\n`);
await sharp(Buffer.from(icon)).resize(180, 180).png().toFile(join(PUBLIC, 'apple-touch-icon.png'));

console.log('brand written: media/social-card.png, favicon.svg, apple-touch-icon.png');
