// One-off asset fetcher: downloads the curated images the site uses from the
// live WordPress media library into src/assets. Run with: node scripts/fetch-assets.mjs
// Uses Node's built-in fetch (Node 18+). Records what it pulled.
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const BASE = 'https://www.learning-planet.org/wp-content/uploads/';

const assets = [
  // team headshots
  ['olivier-brechard-circle.jpg', 'src/assets/team/olivier-brechard.jpg'],
  ['katherine-brown-circle.jpg', 'src/assets/team/katherine-brown.jpg'],
  ['claire-gaide-circle.jpg', 'src/assets/team/claire-gaide.jpg'],
  ['image_WISE_converted.jpg', 'src/assets/team/ikya-kondapolu.jpg'],
  ['1517396040249-circle.jpeg', 'src/assets/team/ilia-lysenko.jpeg'],
  ['ed-stevenette-circle.jpg', 'src/assets/team/edward-stevenette.jpg'],
  ['damien-sueur-circle.jpg', 'src/assets/team/damien-sueur.jpg'],
  // hero / structural
  ['main-hero-1.webp', 'src/assets/brand/main-hero.webp'],
  ['icon-festival.png', 'src/assets/brand/icon-festival.png'],
];

let ok = 0,
  fail = 0;
for (const [name, dest] of assets) {
  const url = BASE + name;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (LPF27 asset fetch)' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const out = resolve(root, dest);
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, buf);
    console.log(`OK   ${dest} (${buf.length} bytes)`);
    ok++;
  } catch (err) {
    console.log(`FAIL ${dest}  <- ${url}  (${err.message})`);
    fail++;
  }
}
console.log(`\nDone: ${ok} ok, ${fail} failed.`);
if (fail) process.exitCode = 1;
