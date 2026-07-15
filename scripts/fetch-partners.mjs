// One-off data pipeline: scrapes the live WordPress partner directory
// (https://www.learning-planet.org/partners/), cross-checks against the WP
// REST API for canonical slugs, downloads + normalizes each partner's logo,
// and writes a committed dataset to src/data/partners.json + public/partners/.
// Uses Node's built-in fetch (Node 18+) and sharp (already a dependency).
// Run with: node scripts/fetch-partners.mjs
import { writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const root = resolve(import.meta.dirname, '..');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const SITE = 'https://www.learning-planet.org';
const OUT_JSON = resolve(root, 'src/data/partners.json');
const OUT_DIR = resolve(root, 'public/partners');

// ---------------------------------------------------------------------------
// HTML entity decoding (named + numeric) — no DOM lib available.
// ---------------------------------------------------------------------------
const NAMED_ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  laquo: '«',
  raquo: '»',
};

function decodeEntities(str) {
  if (!str) return str;
  return str.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, ent) => {
    if (ent[0] === '#') {
      const code = ent[1] === 'x' || ent[1] === 'X' ? parseInt(ent.slice(2), 16) : parseInt(ent.slice(1), 10);
      if (Number.isNaN(code)) return match;
      try {
        return String.fromCodePoint(code);
      } catch {
        return match;
      }
    }
    const key = ent.toLowerCase();
    return key in NAMED_ENTITIES ? NAMED_ENTITIES[key] : match;
  });
}

// ---------------------------------------------------------------------------
// Name normalization for scraped<->REST cross-matching, and slugify fallback.
// ---------------------------------------------------------------------------
function normalizeName(name) {
  return decodeEntities(name)
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/^["'‘’“”.,;:!?()[\]«»\s]+/u, '')
    .replace(/["'‘’“”.,;:!?()[\]«»\s]+$/u, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(name) {
  const base = decodeEntities(name)
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'partner';
}

// `letter` for the A-Z index: first char after decoding + stripping leading
// quotes/punctuation/whitespace. Digits stay as-is; letters uppercased with
// diacritics stripped; anything else -> "#".
function firstLetter(name) {
  const decoded = decodeEntities(name);
  const stripped = decoded.replace(/^["'‘’“”.,;:!?()[\]«»\s]+/u, '');
  const ch = stripped.charAt(0);
  if (!ch) return '#';
  if (/\d/.test(ch)) return ch;
  const plain = ch.normalize('NFD').replace(/\p{M}/gu, '');
  if (/[a-zA-Z]/.test(plain)) return plain.toUpperCase();
  return '#';
}

// ---------------------------------------------------------------------------
// 1. Scrape the paged archive.
// ---------------------------------------------------------------------------
async function fetchHtml(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function extractCards(html) {
  const articles = html.match(/<article class="[^"]*\bpartner-card\b[^"]*">[\s\S]*?<\/article>/g) || [];
  const cards = [];
  for (const art of articles) {
    const nameMatch = art.match(/partner__name">([\s\S]*?)<\/h3>/);
    if (!nameMatch) continue;
    const name = decodeEntities(nameMatch[1].trim());

    let website;
    const linkMatch = art.match(/\bpartner__link\b[^"]*"[^>]*\shref="([^"]+)"/);
    if (linkMatch) {
      website = decodeEntities(linkMatch[1]);
      // Some live-site hrefs are scheme-less ("www.example.org") and would
      // resolve as relative links — normalise them to absolute https URLs.
      if (!/^https?:\/\//i.test(website)) website = `https://${website}`;
    }

    let logoUrl;
    const figureMatch = art.match(/<figure class="[^"]*\bpartner__media\b[^"]*">([\s\S]*?)<\/figure>/);
    if (figureMatch) {
      const img = figureMatch[1];
      const dataSrcMatch = img.match(/\bdata-src="([^"]+)"/);
      const srcMatch = img.match(/(?<!data-)\bsrc="([^"]+)"/);
      if (dataSrcMatch) {
        logoUrl = decodeEntities(dataSrcMatch[1]);
      } else if (srcMatch && !srcMatch[1].startsWith('data:')) {
        logoUrl = decodeEntities(srcMatch[1]);
      }
    }

    cards.push({ name, website, logoUrl });
  }
  return cards;
}

async function scrapeArchive() {
  const page1 = await fetchHtml(`${SITE}/partners/`);
  const maxPagesMatch = page1.match(/data-max-pages="(\d+)"/);
  const maxPages = maxPagesMatch ? parseInt(maxPagesMatch[1], 10) : 1;

  const allCards = extractCards(page1);
  const pageCounts = [allCards.length];

  for (let p = 2; p <= maxPages; p++) {
    const html = await fetchHtml(`${SITE}/partners/page/${p}/`);
    const cards = extractCards(html);
    pageCounts.push(cards.length);
    allCards.push(...cards);
  }

  return { cards: allCards, maxPages, pageCounts };
}

// ---------------------------------------------------------------------------
// 2. Cross-check against the WP REST API.
// ---------------------------------------------------------------------------
async function fetchRestPartners() {
  const first = await fetch(`${SITE}/wp-json/wp/v2/partner?per_page=100&page=1&_fields=slug,title`, {
    headers: { 'User-Agent': UA },
  });
  if (!first.ok) throw new Error(`REST HTTP ${first.status}`);
  const totalPages = parseInt(first.headers.get('x-wp-totalpages') || '1', 10);
  const totalItems = parseInt(first.headers.get('x-wp-total') || '0', 10);

  let all = await first.json();
  for (let p = 2; p <= totalPages; p++) {
    const res = await fetch(`${SITE}/wp-json/wp/v2/partner?per_page=100&page=${p}&_fields=slug,title`, {
      headers: { 'User-Agent': UA },
    });
    if (!res.ok) throw new Error(`REST HTTP ${res.status} (page ${p})`);
    all = all.concat(await res.json());
  }

  return {
    items: all.map((item) => ({ slug: item.slug, name: decodeEntities(item.title.rendered) })),
    totalPages,
    totalItems,
  };
}

// ---------------------------------------------------------------------------
// 3. Download + normalize logos.
// ---------------------------------------------------------------------------
async function fetchBuffer(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

function isSvg(url, buf) {
  if (/\.svg(\?|#|$)/i.test(url)) return true;
  const head = buf.subarray(0, 512).toString('utf8').trimStart();
  return head.startsWith('<?xml') || head.startsWith('<svg');
}

async function downloadLogo(partner) {
  const { slug, logoUrl } = partner;
  let lastErr;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const buf = await fetchBuffer(logoUrl);
      if (isSvg(logoUrl, buf)) {
        const dest = resolve(OUT_DIR, `${slug}.svg`);
        await writeFile(dest, buf);
        return { logo: `partners/${slug}.svg`, width: undefined, height: undefined };
      }
      const pipeline = sharp(buf).resize({ width: 320, withoutEnlargement: true }).webp({ quality: 80 });
      const outBuf = await pipeline.toBuffer();
      const dest = resolve(OUT_DIR, `${slug}.webp`);
      await writeFile(dest, outBuf);
      const meta = await sharp(outBuf).metadata();
      return { logo: `partners/${slug}.webp`, width: meta.width, height: meta.height };
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

async function mapConcurrent(items, concurrency, fn) {
  const results = new Array(items.length);
  let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('Fetching partner archive pages...');
  const { cards, maxPages, pageCounts } = await scrapeArchive();
  console.log(`Scraped ${cards.length} cards across ${maxPages} pages.`);

  console.log('Fetching WP REST API partner list...');
  const rest = await fetchRestPartners();
  console.log(`REST reports ${rest.totalItems} total partners across ${rest.totalPages} pages (fetched ${rest.items.length}).`);

  // Build normalized-name -> REST record index.
  const restByNorm = new Map();
  for (const item of rest.items) {
    const key = normalizeName(item.name);
    if (!restByNorm.has(key)) restByNorm.set(key, []);
    restByNorm.get(key).push(item);
  }
  const restMatched = new Set(); // normalized keys matched at least once

  const usedSlugs = new Set();
  const scrapedUnmatched = [];
  const noWebsite = [];
  const noLogo = [];
  const slugCollisions = [];

  const partners = [];
  for (const card of cards) {
    const norm = normalizeName(card.name);
    const restMatches = restByNorm.get(norm);
    let slug;
    if (restMatches && restMatches.length) {
      // WP slugs can be percent-encoded UTF-8 (accents, emoji) — decode and
      // re-slugify so filenames stay plain ASCII.
      let restSlug = restMatches[0].slug;
      try {
        restSlug = decodeURIComponent(restSlug);
      } catch {
        /* keep raw slug if malformed */
      }
      slug = slugify(restSlug);
      restMatched.add(norm);
    } else {
      scrapedUnmatched.push(card.name);
      slug = slugify(card.name);
    }

    if (usedSlugs.has(slug)) {
      let n = 2;
      let candidate = `${slug}-${n}`;
      while (usedSlugs.has(candidate)) {
        n++;
        candidate = `${slug}-${n}`;
      }
      slugCollisions.push({ name: card.name, original: slug, resolved: candidate });
      slug = candidate;
    }
    usedSlugs.add(slug);

    if (!card.website) noWebsite.push(card.name);
    if (!card.logoUrl) {
      noLogo.push(card.name);
      continue; // logo wall: omit partners with no logo from the JSON
    }

    partners.push({
      slug,
      name: card.name,
      website: card.website,
      logoUrl: card.logoUrl,
      letter: firstLetter(card.name),
    });
  }

  // REST records that were never matched by any scraped card.
  const restUnmatched = rest.items
    .filter((item) => !restMatched.has(normalizeName(item.name)))
    .map((item) => item.name);

  console.log(`Downloading ${partners.length} logos (concurrency 8)...`);
  await mkdir(OUT_DIR, { recursive: true });

  const downloadFailures = [];
  const finalRecords = [];
  await mapConcurrent(partners, 8, async (p) => {
    try {
      const { logo, width, height } = await downloadLogo(p);
      finalRecords.push({
        slug: p.slug,
        name: p.name,
        ...(p.website ? { website: p.website } : {}),
        logo,
        ...(width ? { width } : {}),
        ...(height ? { height } : {}),
        letter: p.letter,
      });
    } catch (err) {
      downloadFailures.push({ name: p.name, url: p.logoUrl, error: err.message });
    }
  });

  // Note: V8's native Array#sort (TimSort) can produce a non-deterministic,
  // non-adjacent-consistent order here because localeCompare with
  // { sensitivity: 'base' } is not a transitive comparator across mixed
  // digit-leading/letter-leading strings (observed: ~160 adjacent inversions
  // and a different result on repeated sorts of the same array). Decorating
  // with the original index and using it as a tiebreak forces a stable,
  // reproducible sort that matches the live site's digit-then-A–Z order with
  // zero inversions.
  const sorted = finalRecords
    .map((rec, i) => [rec, i])
    .sort(([a, ai], [b, bi]) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }) || ai - bi)
    .map(([rec]) => rec);
  finalRecords.length = 0;
  finalRecords.push(...sorted);

  await mkdir(resolve(root, 'src/data'), { recursive: true });
  await writeFile(OUT_JSON, JSON.stringify(finalRecords, null, 2) + '\n');

  // -------------------------------------------------------------------
  // Reconciliation report
  // -------------------------------------------------------------------
  console.log('\n===== Reconciliation report =====');
  console.log(`Pages fetched: ${maxPages} (counts: ${pageCounts.join(', ')})`);
  console.log(`Cards scraped: ${cards.length}`);
  console.log(`REST total: ${rest.totalItems} (fetched ${rest.items.length})`);
  console.log(`Delta scraped-REST: ${cards.length - rest.totalItems}`);

  console.log(`\nScraped cards with no REST match (${scrapedUnmatched.length}):`);
  for (const n of scrapedUnmatched) console.log(`  - ${n}`);

  console.log(`\nREST records with no scraped match (${restUnmatched.length}):`);
  for (const n of restUnmatched) console.log(`  - ${n}`);

  console.log(`\nOmitted (no logo) (${noLogo.length}):`);
  for (const n of noLogo) console.log(`  - ${n}`);

  console.log(`\nNo website (${noWebsite.length}):`);
  for (const n of noWebsite) console.log(`  - ${n}`);

  console.log(`\nSlug collisions (${slugCollisions.length}):`);
  for (const c of slugCollisions) console.log(`  - ${c.name}: ${c.original} -> ${c.resolved}`);

  console.log(`\nDownload failures after retry (${downloadFailures.length}):`);
  for (const f of downloadFailures) console.log(`  - ${f.name} <- ${f.url} (${f.error})`);

  console.log(`\nFinal JSON entries: ${finalRecords.length}`);
  console.log(`Written to: ${OUT_JSON}`);
  console.log(`Logos written to: ${OUT_DIR}`);

  const deltaOk = Math.abs(cards.length - rest.totalItems) <= 5;
  const downloadsOk = downloadFailures.length === 0;
  if (!deltaOk || !downloadsOk) {
    console.log('\nFAILED: reconciliation thresholds exceeded.');
    process.exitCode = 1;
  } else {
    console.log('\nOK: within reconciliation thresholds.');
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exitCode = 1;
});
