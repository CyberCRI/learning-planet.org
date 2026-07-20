#!/usr/bin/env node
/**
 * generate-posters.mjs
 *
 * Official LPF27 save-the-date posters in landscape / square / vertical,
 * composited in the brand system of the shipped OG card (generate-og.mjs
 * card C): festival artwork + radial cream feather + a column of
 * wordmark → gradient rule → SAVE THE DATE kicker → date → URL →
 * LPI + UNESCO lockup (LPI always first).
 *
 * Artwork is read from poster-art/ (local-only, not committed);
 * outputs land in posters/.
 *
 * Usage: node scripts/generate-posters.mjs [--only landscape|square|vertical-1|vertical-2]
 */

import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import satori from 'satori';
import { decompress } from 'wawoff2';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

const BRAND = path.join(REPO_ROOT, 'src/assets/brand');
const FONTS = path.join(REPO_ROOT, 'src/assets/fonts');
const ART_DIR = path.join(REPO_ROOT, 'poster-art');
const OUT_DIR = path.join(REPO_ROOT, 'posters');

const PATHS = {
  lpfColour: path.join(BRAND, 'lpf-colour.png'),
  lpiColour: path.join(BRAND, 'lpi-colour.png'),
  unesco: path.join(BRAND, 'unesco.svg'),
  fontSemibold: path.join(FONTS, 'archivo-narrow-600.woff2'),
  fontBold: path.join(FONTS, 'archivo-narrow-700.woff2'),
};

const PALETTE = {
  paper: '#fbfaf7',
  ink: '#0b2b33',
  inkSoft: '#3f5a60',
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

const URL_TEXT = 'www.learning-planet.org';

/**
 * Poster copy per language. FR wording is a PROPOSAL pending editorial
 * confirmation — do not circulate FR posters without sign-off.
 * Usage: node scripts/generate-posters.mjs --lang fr
 */
const COPY = {
  en: {
    kicker: 'SAVE THE DATE',
    dateMain: '25–29 JANUARY ',
    year: '2027',
    poweredBy: 'POWERED BY',
    suffix: '',
  },
  fr: {
    kicker: null, // user-confirmed: no save-the-date line on FR posters
    dateMain: '25–29 JANVIER ',
    year: '2027',
    poweredBy: 'INITIÉ PAR', // user-confirmed poster wording (site lockup says "Avec le soutien de")
    suffix: '-fr',
  },
};

/**
 * Per-format layout. All px values are in OUTPUT pixels; the renderer
 * multiplies by `scale` internally (scale chosen so the working canvas
 * never exceeds the source artwork's native resolution).
 *
 * `feather` is the radial cream gradient centred on each artwork's
 * clearing; `col` anchors the text column inside that clearing.
 */
const FORMATS = {
  landscape: {
    art: 'LPF27_LANDSCAPE.png',
    out: 'lpf27-poster-landscape.png',
    w: 1920,
    h: 1080,
    scale: 1.5, // 2880x1620 working canvas ≤ 2944x1648 source
    feather: { cx: '21%', cy: '46%', r: '74%', midStop: 0.42 },
    col: {
      x: 120,
      wordmarkW: 760,
      wordmarkY: 150,
      ruleW: 300,
      ruleH: 10,
      gapWmRule: 44,
      kicker: 36,
      gapRuleKicker: 30,
      date: 84,
      gapKickerDate: 18,
      creditsBlock: true,
      url: 30,
      gapUrlLabel: 30,
      poweredBy: 22,
      gapLabelLogos: 24,
      lpiH: 104,
      unescoH: 48,
      logoGap: 56,
      logosBottom: 960,
    },
  },
  square: {
    art: 'LPF27_9_1_1_4.png',
    out: 'lpf27-poster-square.png',
    w: 1080,
    h: 1080,
    scale: 1.8, // 1944x1944 ≤ 2048x2048
    feather: { cx: '26%', cy: '62%', r: '62%', midStop: 0.35 },
    col: {
      x: 88,
      wordmarkW: 520,
      wordmarkY: 350,
      ruleW: 230,
      ruleH: 9,
      gapWmRule: 34,
      kicker: 28,
      gapRuleKicker: 24,
      date: 60,
      gapKickerDate: 14,
      creditsBlock: true,
      url: 25,
      gapUrlLabel: 24,
      poweredBy: 19,
      gapLabelLogos: 20,
      lpiH: 80,
      unescoH: 38,
      logoGap: 44,
      logosBottom: 1014,
    },
  },
  'vertical-1': {
    art: 'LPF27_9_16_1.png',
    out: 'lpf27-poster-vertical-1.png',
    w: 1080,
    h: 1920,
    scale: 1.5, // 1620x2880 ≤ 1648x2944
    feather: { cx: '30%', cy: '36%', r: '66%', midStop: 0.42 },
    col: {
      x: 90,
      wordmarkW: 600,
      wordmarkY: 330,
      ruleW: 260,
      ruleH: 10,
      gapWmRule: 40,
      kicker: 32,
      gapRuleKicker: 28,
      date: 68,
      gapKickerDate: 16,
      // credits block (bottom-anchored): URL → powered-by label → logos
      creditsBlock: true,
      url: 28,
      gapUrlLabel: 34,
      poweredBy: 23,
      gapLabelLogos: 26,
      lpiH: 98,
      unescoH: 46,
      logoGap: 48,
      logosBottom: 1545, // credits stay on clean ground above the bottom-left foliage
    },
  },
  'vertical-2': {
    art: 'LPF27_9_16_3.png',
    out: 'lpf27-poster-vertical-2.png',
    w: 1080,
    h: 1920,
    scale: 1.5,
    feather: { cx: '28%', cy: '38%', r: '60%', midStop: 0.45 },
    col: {
      x: 90,
      wordmarkW: 620,
      wordmarkY: 340,
      ruleW: 260,
      ruleH: 10,
      gapWmRule: 40,
      kicker: 32,
      gapRuleKicker: 28,
      date: 68,
      gapKickerDate: 16,
      creditsBlock: true,
      url: 28,
      gapUrlLabel: 34,
      poweredBy: 23,
      gapLabelLogos: 26,
      lpiH: 98,
      unescoH: 46,
      logoGap: 48,
      logosBottom: 1810, // bottom-left is clean all the way down in this artwork
    },
  },
};

/**
 * Positioning alternatives, merged over each format's base config.
 * a — anchored column (refined baseline; base config as-is)
 * b — column centre-aligned on the optical axis of the artwork's clearing
 * c — bottom-weighted: message low in the clearing, credits as ONE bar
 * Filenames: lpf27-poster-{format}-{alt}{-fr}.png
 */
const ALTS = {
  a: {},
  b: {
    landscape: {
      align: 'center',
      centerX: 0.26,
      feather: { cx: '26%', cy: '46%', r: '70%', midStop: 0.44 },
      col: { wordmarkY: 160, wordmarkW: 700, logosBottom: 944 },
    },
    square: {
      align: 'center',
      centerX: 0.3,
      feather: { cx: '30%', cy: '58%', r: '64%', midStop: 0.38 },
      col: { wordmarkY: 330, wordmarkW: 500, logosBottom: 1012 },
    },
    'vertical-1': {
      align: 'center',
      centerX: 0.33,
      feather: { cx: '33%', cy: '36%', r: '66%', midStop: 0.42 },
      col: { wordmarkY: 370, wordmarkW: 590, logosBottom: 1500 },
    },
    'vertical-2': {
      align: 'center',
      centerX: 0.32,
      feather: { cx: '32%', cy: '40%', r: '62%', midStop: 0.44 },
      col: { wordmarkY: 430, wordmarkW: 590, logosBottom: 1780 },
    },
  },
  c: {
    landscape: {
      feather: { cx: '22%', cy: '54%', r: '72%', midStop: 0.42 },
      col: {
        wordmarkY: 300,
        wordmarkW: 700,
        creditsLayout: 'row',
        urlInline: true,
        gapDateUrl: 26,
        url: 27,
        poweredBy: 21,
        lpiH: 84,
        unescoH: 40,
        logosBottom: 990,
      },
    },
    square: {
      feather: { cx: '25%', cy: '68%', r: '64%', midStop: 0.38 },
      col: {
        wordmarkY: 460,
        wordmarkW: 490,
        date: 56,
        creditsLayout: 'row',
        urlInline: true,
        gapDateUrl: 22,
        url: 23,
        poweredBy: 18,
        lpiH: 70,
        unescoH: 34,
        logosBottom: 1030,
      },
    },
    'vertical-1': {
      // this artwork's lower-left is foliage — C uses the mid-clearing with a
      // stronger feather instead of sitting on the leaves
      feather: { cx: '30%', cy: '48%', r: '66%', midStop: 0.48 },
      col: {
        wordmarkY: 760,
        wordmarkW: 600,
        creditsLayout: 'row',
        urlInline: true,
        gapDateUrl: 26,
        url: 26,
        poweredBy: 20,
        lpiH: 80,
        unescoH: 38,
        logosBottom: 1500,
      },
    },
    'vertical-2': {
      feather: { cx: '28%', cy: '52%', r: '62%', midStop: 0.48 },
      col: {
        wordmarkY: 1020,
        wordmarkW: 620,
        creditsLayout: 'row',
        urlInline: true,
        gapDateUrl: 26,
        url: 26,
        poweredBy: 20,
        lpiH: 80,
        unescoH: 38,
        logosBottom: 1800,
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Helpers (from generate-og.mjs)
// ---------------------------------------------------------------------------

async function loadTrimmedPng(p) {
  return sharp(p).trim().png().toBuffer();
}

async function getSize(input) {
  const meta = await sharp(input).metadata();
  return { width: meta.width, height: meta.height };
}

async function resizeToWidth(buf, width) {
  return sharp(buf).resize({ width: Math.round(width) }).png().toBuffer();
}

async function resizeToHeight(buf, height) {
  return sharp(buf).resize({ height: Math.round(height) }).png().toBuffer();
}

async function unescoAt(height, color) {
  const raw = await fs.readFile(PATHS.unesco, 'utf8');
  const tinted = raw.replaceAll('fill="#FFF"', `fill="${color}"`);
  return sharp(Buffer.from(tinted), { density: 300 })
    .resize({ height: Math.round(height) })
    .png()
    .toBuffer();
}

async function gradientRule(width, height) {
  const stops = PALETTE.gradientStops
    .map((s) => `<stop offset="${s.offset}" stop-color="${s.color}"/>`)
    .join('');
  const rx = height / 2;
  const svg = `<svg width="${Math.round(width)}" height="${Math.round(height)}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="rule" x1="0%" y1="0%" x2="100%" y2="0%">${stops}</linearGradient></defs>
    <rect x="0" y="0" width="${Math.round(width)}" height="${Math.round(height)}" rx="${rx}" ry="${rx}" fill="url(#rule)"/>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

function toArrayBuffer(u8) {
  return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
}

// wawoff2 shares one WASM instance — decompress sequentially, never Promise.all.
async function loadFonts() {
  const semiboldWoff2 = await fs.readFile(PATHS.fontSemibold);
  const boldWoff2 = await fs.readFile(PATHS.fontBold);
  const semibold = toArrayBuffer(await decompress(semiboldWoff2));
  const bold = toArrayBuffer(await decompress(boldWoff2));
  return [
    { name: 'Archivo Narrow', data: semibold, weight: 600, style: 'normal' },
    { name: 'Archivo Narrow', data: bold, weight: 700, style: 'normal' },
  ];
}

async function renderTextTrimmed(node, fonts, { width = 2600, height = 300 } = {}) {
  const svg = await satori(node, { width, height, fonts });
  const rasterised = await sharp(Buffer.from(svg)).png().toBuffer();
  const trimmed = await sharp(rasterised).trim().png().toBuffer();
  const size = await getSize(trimmed);
  return { buffer: trimmed, width: size.width, height: size.height };
}

function textNode(text, { fontSize, color, weight = 600, letterSpacing = '0em' }) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        fontFamily: 'Archivo Narrow',
        fontWeight: weight,
        fontSize,
        letterSpacing,
        color,
        whiteSpace: 'nowrap',
      },
      children: text,
    },
  };
}

function dateNode({ fontSize, mainColor, coral, copy }) {
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
        { type: 'span', props: { style: { color: mainColor }, children: copy.dateMain } },
        // explicit margin: satori collapses the trailing space of the previous span
        { type: 'span', props: { style: { color: coral, marginLeft: '0.24em' }, children: copy.year } },
      ],
    },
  };
}

// ---------------------------------------------------------------------------
// Poster builder
// ---------------------------------------------------------------------------

async function buildPoster(fmt, fonts, copy) {
  const S = fmt.scale;
  const W = Math.round(fmt.w * S);
  const H = Math.round(fmt.h * S);
  const c = fmt.col;
  const px = (v) => Math.round(v * S);

  // Background artwork, cover-cropped to the working canvas.
  const artPath = path.join(ART_DIR, fmt.art);
  const art = await sharp(artPath)
    .resize(W, H, { fit: 'cover', position: 'centre' })
    .png()
    .toBuffer();

  const composites = [];

  // Radial cream feather over the artwork's clearing.
  const f = fmt.feather;
  // Three-stop falloff with a soft shoulder — a hard mid→0 jump reads as a
  // visible halo ring on portrait canvases.
  const featherSvg = `<svg width="${W}" height="${H}"><defs><radialGradient id="g" cx="${f.cx}" cy="${f.cy}" r="${f.r}"><stop offset="0%" stop-color="${PALETTE.paper}" stop-opacity="1"/><stop offset="${Math.round(f.midStop * 100)}%" stop-color="${PALETTE.paper}" stop-opacity="0.92"/><stop offset="${Math.round(((f.midStop + 0.78) / 2) * 100)}%" stop-color="${PALETTE.paper}" stop-opacity="0.45"/><stop offset="78%" stop-color="${PALETTE.paper}" stop-opacity="0"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/></svg>`;
  composites.push({ input: await sharp(Buffer.from(featherSvg)).png().toBuffer(), left: 0, top: 0 });

  // Horizontal placement: left-anchored column, or centre-aligned on the
  // optical axis of the artwork's clearing (alt B).
  const colX = px(c.x);
  const xFor = (elWidth) =>
    fmt.align === 'center' ? Math.round(fmt.centerX * W - elWidth / 2) : colX;

  // Wordmark
  const wordmark = await resizeToWidth(await loadTrimmedPng(PATHS.lpfColour), px(c.wordmarkW));
  const wmSize = await getSize(wordmark);
  const wmY = px(c.wordmarkY);
  composites.push({ input: wordmark, left: xFor(wmSize.width), top: wmY });

  // Gradient rule
  const rule = await gradientRule(px(c.ruleW), px(c.ruleH));
  const ruleY = wmY + wmSize.height + px(c.gapWmRule);
  composites.push({ input: rule, left: xFor(px(c.ruleW)), top: ruleY });

  // Kicker — optional (FR posters carry no save-the-date line); when absent
  // the date takes the kicker's slot.
  let dateY = ruleY + px(c.ruleH) + px(c.gapRuleKicker);
  if (copy.kicker) {
    const kicker = await renderTextTrimmed(
      textNode(copy.kicker, { fontSize: px(c.kicker), color: PALETTE.coral, weight: 600, letterSpacing: '0.34em' }),
      fonts
    );
    composites.push({ input: kicker.buffer, left: xFor(kicker.width), top: dateY });
    dateY += kicker.height + px(c.gapKickerDate);
  }

  // Date
  const date = await renderTextTrimmed(
    dateNode({ fontSize: px(c.date), mainColor: PALETTE.ink, coral: PALETTE.coral, copy }),
    fonts
  );
  composites.push({ input: date.buffer, left: xFor(date.width), top: dateY });

  // Credits: URL + powered-by label + LPI & UNESCO (LPI first — locked order),
  // bottom-anchored on clean ground. 'stack' = three lines; 'row' = one bar.
  const url = await renderTextTrimmed(
    textNode(URL_TEXT, { fontSize: px(c.url), color: PALETTE.inkSoft, weight: 600, letterSpacing: '0.06em' }),
    fonts
  );
  const label = await renderTextTrimmed(
    textNode(copy.poweredBy, {
      fontSize: px(c.poweredBy),
      color: PALETTE.inkSoft,
      weight: 600,
      letterSpacing: '0.18em',
    }),
    fonts
  );
  const lpi = await resizeToHeight(await loadTrimmedPng(PATHS.lpiColour), px(c.lpiH));
  const lpiSize = await getSize(lpi);
  const unesco = await unescoAt(px(c.unescoH), PALETTE.ink);
  const unescoSize = await getSize(unesco);
  const rowBottomY = px(c.logosBottom);

  // Inline URL directly under the date (alt C — keeps the credits bar short
  // so it never reaches the artwork).
  if (c.urlInline) {
    composites.push({ input: url.buffer, left: xFor(url.width), top: dateY + date.height + px(c.gapDateUrl) });
  }

  if (c.creditsLayout === 'row') {
    // One bar: LABEL · [LPI] · [UNESCO] (· URL unless inline), centre-aligned.
    const gap = px(c.logoGap);
    const urlGap = px(c.logoGap) + px(24);
    const withUrl = !c.urlInline;
    const rowW =
      label.width + gap + lpiSize.width + gap + unescoSize.width + (withUrl ? urlGap + url.width : 0);
    const rowH = Math.max(label.height, lpiSize.height, unescoSize.height, withUrl ? url.height : 0);
    const rowLeft = xFor(rowW);
    const centerY = rowBottomY - rowH / 2;
    let cx2 = rowLeft;
    const place = (el, h) => {
      composites.push({ input: el, left: Math.round(cx2), top: Math.round(centerY - h / 2) });
    };
    place(label.buffer, label.height);
    cx2 += label.width + gap;
    place(lpi, lpiSize.height);
    cx2 += lpiSize.width + gap;
    place(unesco, unescoSize.height);
    if (withUrl) {
      cx2 += unescoSize.width + urlGap;
      place(url.buffer, url.height);
    }
  } else {
    const tallest = Math.max(lpiSize.height, unescoSize.height);
    const rowCenterY = rowBottomY - tallest / 2;
    const logosRowW = lpiSize.width + px(c.logoGap) + unescoSize.width;
    const logosLeft = xFor(logosRowW);
    composites.push({ input: lpi, left: logosLeft, top: Math.round(rowCenterY - lpiSize.height / 2) });
    composites.push({
      input: unesco,
      left: logosLeft + lpiSize.width + px(c.logoGap),
      top: Math.round(rowCenterY - unescoSize.height / 2),
    });
    const labelY = rowBottomY - tallest - px(c.gapLabelLogos) - label.height;
    composites.push({ input: label.buffer, left: xFor(label.width), top: labelY });
    const urlY = labelY - px(c.gapUrlLabel) - url.height;
    composites.push({ input: url.buffer, left: xFor(url.width), top: urlY });
  }

  const full = await sharp(art)
    .ensureAlpha()
    .composite(composites)
    .flatten({ background: PALETTE.paper })
    .png()
    .toBuffer();

  // Materialize, then resize down in a fresh pipeline (sharp composite/resize
  // interaction — see generate-og.mjs writePng note).
  return sharp(full).resize(fmt.w, fmt.h).png({ compressionLevel: 9 }).toBuffer();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/** Montage the three alternatives (EN) side by side per format for review. */
async function buildSheets(dir) {
  const H = 640;
  const G = 24;
  for (const [id, fmt] of Object.entries(FORMATS)) {
    const bufs = [];
    for (const al of Object.keys(ALTS)) {
      const f = path.join(dir, fmt.out.replace(/\.png$/, `-${al}.png`));
      bufs.push(await sharp(f).resize({ height: H }).png().toBuffer());
    }
    const sizes = [];
    for (const b of bufs) sizes.push(await getSize(b));
    const totalW = sizes.reduce((s, x) => s + x.width, 0) + G * (bufs.length + 1);
    let x = G;
    const comps = bufs.map((b, i) => {
      const comp = { input: b, left: x, top: G };
      x += sizes[i].width + G;
      return comp;
    });
    const outPath = path.join(dir, `sheet-${id}.png`);
    const sheet = sharp({
      create: { width: totalW, height: H + 2 * G, channels: 4, background: '#ffffff' },
    })
      .composite(comps)
      .flatten({ background: '#ffffff' });
    await fs.writeFile(outPath, await sheet.png().toBuffer());
    console.log(`${outPath}  (a | b | c)`);
  }
}

function argValue(flag, fallback = null) {
  const i = process.argv.indexOf(flag);
  return i > -1 ? process.argv[i + 1] : fallback;
}

async function main() {
  const only = argValue('--only');
  const lang = argValue('--lang', 'en');
  const alt = argValue('--alt');
  const outdir = argValue('--outdir') ? path.resolve(argValue('--outdir')) : alt ? path.join(OUT_DIR, 'alternatives') : OUT_DIR;
  const copy = COPY[lang];
  if (!copy) throw new Error(`--lang must be one of ${Object.keys(COPY).join('|')}, got "${lang}"`);
  if (alt && !ALTS[alt]) throw new Error(`--alt must be one of ${Object.keys(ALTS).join('|')}, got "${alt}"`);

  await fs.mkdir(outdir, { recursive: true });

  if (process.argv.includes('--sheets')) {
    await buildSheets(outdir);
    return;
  }

  const fonts = await loadFonts();

  for (const [id, fmt] of Object.entries(FORMATS)) {
    if (only && id !== only) continue;
    const o = alt ? (ALTS[alt][id] ?? {}) : {};
    const merged = {
      ...fmt,
      align: o.align,
      centerX: o.centerX,
      feather: o.feather ?? fmt.feather,
      col: { ...fmt.col, ...(o.col ?? {}) },
    };
    const buf = await buildPoster(merged, fonts, copy);
    const name = alt
      ? fmt.out.replace(/\.png$/, `-${alt}${copy.suffix}.png`)
      : fmt.out.replace(/\.png$/, `${copy.suffix}.png`);
    const outPath = path.join(outdir, name);
    await fs.writeFile(outPath, buf);
    const meta = await sharp(buf).metadata();
    const stat = await fs.stat(outPath);
    console.log(`${outPath}  ${meta.width}x${meta.height}  ${(stat.size / 1024 / 1024).toFixed(2)} MB`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
