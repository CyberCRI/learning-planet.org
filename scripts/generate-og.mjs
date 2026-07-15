#!/usr/bin/env node
/**
 * generate-og.mjs
 *
 * Composites three Open Graph card candidates (1200x630) for the
 * LearningPlanet Festival site.
 *
 * Usage:
 *   node scripts/generate-og.mjs [--outdir DIR] [--ship a|b|c]
 *
 * --outdir DIR   Directory to write the three candidate PNGs into.
 *                Defaults to `.og-preview` under the repo root.
 * --ship a|b|c   Additionally writes the chosen card to public/og-card.png
 *                (cards a/b) or public/og-card.jpg (card c — the hero
 *                illustration compresses far better as JPEG, keeping the
 *                file under the ~300 KB limit some messengers enforce).
 */

import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import satori from 'satori';
import { decompress } from 'wawoff2';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const ASSETS = path.join(REPO_ROOT, 'src/assets');
const BRAND = path.join(ASSETS, 'brand');
const FONTS = path.join(ASSETS, 'fonts');

const PATHS = {
  lpfColour: path.join(BRAND, 'lpf-colour.png'),
  lpfFestivalColour: path.join(BRAND, 'lpf-festival-colour.png'),
  lpiColour: path.join(BRAND, 'lpi-colour.png'),
  lpiWhite: path.join(BRAND, 'lpi-white.png'),
  unesco: path.join(BRAND, 'unesco.svg'),
  hero: path.join(ASSETS, 'LPF27_Hero1.png'),
  fontSemibold: path.join(FONTS, 'archivo-narrow-600.woff2'),
  fontBold: path.join(FONTS, 'archivo-narrow-700.woff2'),
};

const PALETTE = {
  paper: '#fbfaf7',
  ink: '#0b2b33',
  coral: '#ff9473',
  gradientStops: [
    { offset: '0%', color: '#00dba7' },
    { offset: '24%', color: '#2bc0ce' },
    { offset: '40%', color: '#6cd5ff' },
    { offset: '58%', color: '#d6a2ff' },
    { offset: '80%', color: '#ff9473' },
    { offset: '100%', color: '#ffcc00' },
  ],
};

const SCALE = 2;
const CANVAS_W = 1200 * SCALE; // 2400
const CANVAS_H = 630 * SCALE; // 1260

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = { outdir: path.join(REPO_ROOT, '.og-preview'), ship: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--outdir') {
      args.outdir = path.resolve(argv[++i]);
    } else if (a === '--ship') {
      args.ship = argv[++i];
    }
  }
  return args;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Load a PNG, trim its transparent margins, return the trimmed Buffer. */
async function loadTrimmedPng(p) {
  return sharp(p).trim().png().toBuffer();
}

/** Get {width, height} of a buffer/path via sharp metadata. */
async function getSize(input) {
  const meta = await sharp(input).metadata();
  return { width: meta.width, height: meta.height };
}

/** Resize an image buffer to an explicit width (keeping aspect ratio). */
async function resizeToWidth(buf, width) {
  return sharp(buf).resize({ width }).png().toBuffer();
}

/** Resize an image buffer to an explicit height (keeping aspect ratio). */
async function resizeToHeight(buf, height) {
  return sharp(buf).resize({ height }).png().toBuffer();
}

/** Rasterise the UNESCO SVG tinted to `color`, at pixel `height`. */
async function unescoAt(height, color) {
  const raw = await fs.readFile(PATHS.unesco, 'utf8');
  const tinted = raw.replaceAll('fill="#FFF"', `fill="${color}"`);
  const buf = await sharp(Buffer.from(tinted), { density: 300 })
    .resize({ height })
    .png()
    .toBuffer();
  return buf;
}

/** Build a rounded-end horizontal gradient bar SVG and rasterise it. */
async function gradientRule(width, height) {
  const stops = PALETTE.gradientStops
    .map((s) => `<stop offset="${s.offset}" stop-color="${s.color}"/>`)
    .join('');
  const rx = height / 2;
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="rule" x1="0%" y1="0%" x2="100%" y2="0%">
        ${stops}
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${width}" height="${height}" rx="${rx}" ry="${rx}" fill="url(#rule)"/>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/**
 * satori/opentype.js requires a genuine ArrayBuffer (it does
 * `new DataView(buffer, 0)`), not a Node Buffer/Uint8Array view. wawoff2's
 * decompress() returns a Uint8Array, so slice out its backing ArrayBuffer.
 */
function toArrayBuffer(u8) {
  return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
}

/**
 * Load & decompress the two Archivo Narrow weights for satori.
 *
 * NOTE: wawoff2's decompress() is backed by a single shared WASM instance,
 * so running two decompress() calls concurrently (Promise.all) corrupts
 * their outputs (observed: garbled OpenType signature bytes). Decompress
 * sequentially instead.
 */
async function loadFonts() {
  const [semiboldWoff2, boldWoff2] = await Promise.all([
    fs.readFile(PATHS.fontSemibold),
    fs.readFile(PATHS.fontBold),
  ]);
  const semibold = toArrayBuffer(await decompress(semiboldWoff2));
  const bold = toArrayBuffer(await decompress(boldWoff2));
  return [
    { name: 'Archivo Narrow', data: semibold, weight: 600, style: 'normal' },
    { name: 'Archivo Narrow', data: bold, weight: 700, style: 'normal' },
  ];
}

/**
 * Render a single-line text node with satori onto a wide transparent canvas,
 * rasterise with sharp, then trim to a tight bitmap.
 * `node` is a satori element tree (a plain div with text or spans inside).
 */
async function renderTextTrimmed(node, fonts, { width = 2200, height = 220 } = {}) {
  const svg = await satori(node, {
    width,
    height,
    fonts,
  });
  const rasterised = await sharp(Buffer.from(svg)).png().toBuffer();
  const trimmed = await sharp(rasterised).trim().png().toBuffer();
  const size = await getSize(trimmed);
  return { buffer: trimmed, width: size.width, height: size.height };
}

function kickerNode(text, { fontSize, color }) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        fontFamily: 'Archivo Narrow',
        fontWeight: 600,
        fontSize,
        letterSpacing: '0.34em',
        color,
        whiteSpace: 'nowrap',
      },
      children: text,
    },
  };
}

/**
 * Two-colour date line: "25–29 JANUARY " in `mainColor` + "2027" in coral.
 * One satori div, two spans, flex row, baseline aligned.
 */
function dateNode({ fontSize, mainColor, coral }) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'baseline',
        fontFamily: 'Archivo Narrow',
        fontWeight: 700,
        fontSize,
        whiteSpace: 'nowrap',
      },
      children: [
        {
          type: 'span',
          props: {
            style: { color: mainColor },
            children: '25–29 JANUARY ',
          },
        },
        {
          type: 'span',
          props: {
            style: { color: coral },
            children: '2027',
          },
        },
      ],
    },
  };
}

/** Composite `overlay` centered horizontally over the canvas at explicit y. */
function centerLeft(canvasWidth, overlayWidth) {
  return Math.round((canvasWidth - overlayWidth) / 2);
}

/**
 * Render the full-size (2400x1260) composited pipeline to a buffer first,
 * THEN resize that buffer down to 1200x630 in a fresh sharp() call.
 *
 * NOTE: chaining .resize() directly onto a pipeline that still has pending
 * .composite() operations makes sharp validate those composite inputs
 * against the post-resize canvas size, which throws "Image to composite
 * must have same dimensions or smaller" even though every composite input
 * fits comfortably within the original 2400x1260 canvas. Materializing the
 * full-size image to a buffer before resizing avoids that.
 */
async function writePng(fullSizePipeline, outPath, format = 'png') {
  const fullBuf = await fullSizePipeline.png().toBuffer();
  const resized = sharp(fullBuf).resize(1200, 630);
  const buf =
    format === 'jpg'
      ? await resized.jpeg({ quality: 85, mozjpeg: true }).toBuffer()
      : await resized.png({ compressionLevel: 9, palette: true, quality: 90 }).toBuffer();
  await fs.writeFile(outPath, buf);
  const meta = await sharp(buf).metadata();
  const stat = await fs.stat(outPath);
  return {
    path: outPath,
    width: meta.width,
    height: meta.height,
    hasAlpha: meta.hasAlpha,
    bytes: stat.size,
  };
}

// ---------------------------------------------------------------------------
// Card builders
// ---------------------------------------------------------------------------

async function buildCardA(fonts) {
  const composites = [];

  // Background
  let canvas = sharp({
    create: {
      width: CANVAS_W,
      height: CANVAS_H,
      channels: 4,
      background: PALETTE.paper,
    },
  });

  // Wordmark (full-colour, trimmed) scaled to width 680*2, centered, top y=64*2
  const wordmarkTrimmed = await loadTrimmedPng(PATHS.lpfColour);
  const wordmark = await resizeToWidth(wordmarkTrimmed, 680 * SCALE);
  const wmSize = await getSize(wordmark);
  const wmX = centerLeft(CANVAS_W, wmSize.width);
  const wmY = 64 * SCALE;
  composites.push({ input: wordmark, left: wmX, top: wmY });

  // Gradient rule 220x6, centered, y = 64 + wordmarkHeight + 36
  const ruleW = 220 * SCALE;
  const ruleH = 6 * SCALE;
  const rule = await gradientRule(ruleW, ruleH);
  const ruleX = centerLeft(CANVAS_W, ruleW);
  const ruleY = wmY + wmSize.height + 36 * SCALE;
  composites.push({ input: rule, left: ruleX, top: ruleY });

  // Kicker, 26px, centered, y = rule bottom + 22
  const kicker = await renderTextTrimmed(
    kickerNode('SAVE THE DATE', { fontSize: 26 * SCALE, color: PALETTE.coral }),
    fonts
  );
  const kickerY = ruleY + ruleH + 22 * SCALE;
  const kickerX = centerLeft(CANVAS_W, kicker.width);
  composites.push({ input: kicker.buffer, left: kickerX, top: kickerY });

  // Date, 60px, ink (+coral 2027), centered, y = kicker bottom + 14
  const date = await renderTextTrimmed(
    dateNode({ fontSize: 60 * SCALE, mainColor: PALETTE.ink, coral: PALETTE.coral }),
    fonts
  );
  const dateY = kickerY + kicker.height + 14 * SCALE;
  const dateX = centerLeft(CANVAS_W, date.width);
  composites.push({ input: date.buffer, left: dateX, top: dateY });

  // Bottom logo row: LPI colour @ height 84, gap 44, UNESCO ink @ height 40
  // vertical centers aligned; bottom of tallest element at y=566
  const lpiTrimmed = await loadTrimmedPng(PATHS.lpiColour);
  const lpiH = 84 * SCALE;
  const lpi = await resizeToHeight(lpiTrimmed, lpiH);
  const lpiSize = await getSize(lpi);

  const unescoH = 40 * SCALE;
  const unesco = await unescoAt(unescoH, PALETTE.ink);
  const unescoSize = await getSize(unesco);

  const gap = 44 * SCALE;
  const rowBottomY = 566 * SCALE;
  const tallest = Math.max(lpiSize.height, unescoSize.height);
  const rowTopY = rowBottomY - tallest;
  const rowCenterY = rowTopY + tallest / 2;

  const rowWidth = lpiSize.width + gap + unescoSize.width;
  const rowLeft = centerLeft(CANVAS_W, rowWidth);

  const lpiY = Math.round(rowCenterY - lpiSize.height / 2);
  const unescoY = Math.round(rowCenterY - unescoSize.height / 2);

  composites.push({ input: lpi, left: rowLeft, top: lpiY });
  composites.push({
    input: unesco,
    left: rowLeft + lpiSize.width + gap,
    top: unescoY,
  });

  canvas = canvas.composite(composites).flatten({ background: PALETTE.paper });
  return canvas;
}

async function buildCardB(fonts) {
  const composites = [];

  let canvas = sharp({
    create: {
      width: CANVAS_W,
      height: CANVAS_H,
      channels: 4,
      background: PALETTE.ink,
    },
  });

  // Wordmark (dark-ground / white variant, trimmed) scaled to width 680*2
  const wordmarkTrimmed = await loadTrimmedPng(PATHS.lpfFestivalColour);
  const wordmark = await resizeToWidth(wordmarkTrimmed, 680 * SCALE);
  const wmSize = await getSize(wordmark);
  const wmX = centerLeft(CANVAS_W, wmSize.width);
  const wmY = 64 * SCALE;
  composites.push({ input: wordmark, left: wmX, top: wmY });

  const ruleW = 220 * SCALE;
  const ruleH = 6 * SCALE;
  const rule = await gradientRule(ruleW, ruleH);
  const ruleX = centerLeft(CANVAS_W, ruleW);
  const ruleY = wmY + wmSize.height + 36 * SCALE;
  composites.push({ input: rule, left: ruleX, top: ruleY });

  const kicker = await renderTextTrimmed(
    kickerNode('SAVE THE DATE', { fontSize: 26 * SCALE, color: PALETTE.coral }),
    fonts
  );
  const kickerY = ruleY + ruleH + 22 * SCALE;
  const kickerX = centerLeft(CANVAS_W, kicker.width);
  composites.push({ input: kicker.buffer, left: kickerX, top: kickerY });

  const date = await renderTextTrimmed(
    dateNode({ fontSize: 60 * SCALE, mainColor: '#ffffff', coral: PALETTE.coral }),
    fonts
  );
  const dateY = kickerY + kicker.height + 14 * SCALE;
  const dateX = centerLeft(CANVAS_W, date.width);
  composites.push({ input: date.buffer, left: dateX, top: dateY });

  // Bottom logo row: LPI white @ height 84, gap 44, UNESCO white @ height 40
  const lpiTrimmed = await loadTrimmedPng(PATHS.lpiWhite);
  const lpiH = 84 * SCALE;
  const lpi = await resizeToHeight(lpiTrimmed, lpiH);
  const lpiSize = await getSize(lpi);

  const unescoH = 40 * SCALE;
  const unesco = await unescoAt(unescoH, '#ffffff');
  const unescoSize = await getSize(unesco);

  const gap = 44 * SCALE;
  const rowBottomY = 566 * SCALE;
  const tallest = Math.max(lpiSize.height, unescoSize.height);
  const rowTopY = rowBottomY - tallest;
  const rowCenterY = rowTopY + tallest / 2;

  const rowWidth = lpiSize.width + gap + unescoSize.width;
  const rowLeft = centerLeft(CANVAS_W, rowWidth);

  const lpiY = Math.round(rowCenterY - lpiSize.height / 2);
  const unescoY = Math.round(rowCenterY - unescoSize.height / 2);

  composites.push({ input: lpi, left: rowLeft, top: lpiY });
  composites.push({
    input: unesco,
    left: rowLeft + lpiSize.width + gap,
    top: unescoY,
  });

  canvas = canvas.composite(composites).flatten({ background: PALETTE.ink });
  return canvas;
}

async function buildCardC(fonts) {
  const composites = [];

  // Background: hero illustration, crop full width 2944 x height 1546
  // starting at top y=51, then resize to 2400x1260.
  const heroCropped = await sharp(PATHS.hero)
    .extract({ left: 0, top: 51, width: 2944, height: 1546 })
    .resize(CANVAS_W, CANVAS_H)
    .png()
    .toBuffer();

  let canvas = sharp(heroCropped).ensureAlpha();

  // Radial cream feather overlay
  const featherSvg = `<svg width="${CANVAS_W}" height="${CANVAS_H}"><defs><radialGradient id="g" cx="20%" cy="46%" r="72%"><stop offset="0%" stop-color="#fbfaf7" stop-opacity="1"/><stop offset="42%" stop-color="#fbfaf7" stop-opacity="0.94"/><stop offset="72%" stop-color="#fbfaf7" stop-opacity="0"/></radialGradient></defs><rect width="${CANVAS_W}" height="${CANVAS_H}" fill="url(#g)"/></svg>`;
  const feather = await sharp(Buffer.from(featherSvg)).png().toBuffer();
  composites.push({ input: feather, left: 0, top: 0 });

  // Left-aligned column at x=72
  const colX = 72 * SCALE;

  // Wordmark (full-colour, trimmed) width 520*2, y=88*2
  const wordmarkTrimmed = await loadTrimmedPng(PATHS.lpfColour);
  const wordmark = await resizeToWidth(wordmarkTrimmed, 520 * SCALE);
  const wmSize = await getSize(wordmark);
  const wmY = 88 * SCALE;
  composites.push({ input: wordmark, left: colX, top: wmY });

  // Gradient rule 200x6 at y = 88 + wordmarkHeight + 30
  const ruleW = 200 * SCALE;
  const ruleH = 6 * SCALE;
  const rule = await gradientRule(ruleW, ruleH);
  const ruleY = wmY + wmSize.height + 30 * SCALE;
  composites.push({ input: rule, left: colX, top: ruleY });

  // Kicker 24px at y = rule bottom + 20
  const kicker = await renderTextTrimmed(
    kickerNode('SAVE THE DATE', { fontSize: 24 * SCALE, color: PALETTE.coral }),
    fonts
  );
  const kickerY = ruleY + ruleH + 20 * SCALE;
  composites.push({ input: kicker.buffer, left: colX, top: kickerY });

  // Date 54px ink at y = kicker bottom + 12
  const date = await renderTextTrimmed(
    dateNode({ fontSize: 54 * SCALE, mainColor: PALETTE.ink, coral: PALETTE.coral }),
    fonts
  );
  const dateY = kickerY + kicker.height + 12 * SCALE;
  composites.push({ input: date.buffer, left: colX, top: dateY });

  // Logo row (left-aligned at x=72): LPI colour height 76, gap 40,
  // UNESCO ink height 36; bottom of tallest at y=574.
  const lpiTrimmed = await loadTrimmedPng(PATHS.lpiColour);
  const lpiH = 76 * SCALE;
  const lpi = await resizeToHeight(lpiTrimmed, lpiH);
  const lpiSize = await getSize(lpi);

  const unescoH = 36 * SCALE;
  const unesco = await unescoAt(unescoH, PALETTE.ink);
  const unescoSize = await getSize(unesco);

  const gap = 40 * SCALE;
  const rowBottomY = 574 * SCALE;
  const tallest = Math.max(lpiSize.height, unescoSize.height);
  const rowTopY = rowBottomY - tallest;
  const rowCenterY = rowTopY + tallest / 2;

  const lpiY = Math.round(rowCenterY - lpiSize.height / 2);
  const unescoY = Math.round(rowCenterY - unescoSize.height / 2);

  composites.push({ input: lpi, left: colX, top: lpiY });
  composites.push({
    input: unesco,
    left: colX + lpiSize.width + gap,
    top: unescoY,
  });

  canvas = canvas.composite(composites).flatten({ background: PALETTE.paper });
  return canvas;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv.slice(2));
  await fs.mkdir(args.outdir, { recursive: true });

  const fonts = await loadFonts();

  const cards = {
    a: { name: 'og-a-paper.png', build: buildCardA, shipFormat: 'png' },
    b: { name: 'og-b-dark.png', build: buildCardB, shipFormat: 'png' },
    c: { name: 'og-c-hero.png', build: buildCardC, shipFormat: 'jpg' },
  };

  const results = [];

  for (const key of ['a', 'b', 'c']) {
    const { name, build } = cards[key];
    const canvas = await build(fonts);
    const outPath = path.join(args.outdir, name);
    const info = await writePng(canvas, outPath);
    results.push({ key, ...info });
  }

  for (const r of results) {
    console.log(
      `${r.path}  ${r.width}x${r.height}  hasAlpha=${r.hasAlpha}  ${r.bytes} bytes`
    );
  }

  if (args.ship) {
    const key = args.ship.toLowerCase();
    if (!cards[key]) {
      throw new Error(`--ship must be one of a|b|c, got "${args.ship}"`);
    }
    const shipDir = path.join(REPO_ROOT, 'public');
    await fs.mkdir(shipDir, { recursive: true });
    const { shipFormat } = cards[key];
    const shipPath = path.join(shipDir, `og-card.${shipFormat}`);
    const canvas = await cards[key].build(fonts);
    const info = await writePng(canvas, shipPath, shipFormat);
    console.log(
      `${info.path}  ${info.width}x${info.height}  hasAlpha=${info.hasAlpha}  ${info.bytes} bytes  (shipped: ${key})`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
