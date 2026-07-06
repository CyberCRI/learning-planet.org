// Fetch self-hostable WOFF2 brand fonts (Archivo Narrow + Roboto, both OFL).
// Pulls the woff2 referenced by the Google Fonts CSS API (latin subset),
// which are the same files Google serves — free to self-host under the OFL.
// Run: node scripts/fetch-fonts.mjs
import { writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'src/assets/fonts');
await mkdir(outDir, { recursive: true });

// Each entry: a Google Fonts CSS2 URL (one family+weight) and the local filename.
const families = [
  ['Archivo+Narrow:wght@400', 'archivo-narrow-400.woff2'],
  ['Archivo+Narrow:wght@500', 'archivo-narrow-500.woff2'],
  ['Archivo+Narrow:wght@600', 'archivo-narrow-600.woff2'],
  ['Archivo+Narrow:wght@700', 'archivo-narrow-700.woff2'],
  ['Roboto:wght@400', 'roboto-400.woff2'],
  ['Roboto:wght@500', 'roboto-500.woff2'],
  ['Roboto:wght@700', 'roboto-700.woff2'],
];

// A modern UA so the API returns woff2.
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

let ok = 0,
  fail = 0;
for (const [spec, filename] of families) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${spec}&display=swap`;
  try {
    const css = await (await fetch(cssUrl, { headers: { 'User-Agent': UA } })).text();
    // Grab the FIRST woff2 url in the css (latin block is emitted last but any works for latin text;
    // prefer the latin subset block — match the url that follows a "latin" comment if present).
    const blocks = css.split('@font-face');
    let url = null;
    // prefer a block whose unicode-range covers basic latin (U+0000-00FF)
    for (const b of blocks) {
      if (/unicode-range:\s*U\+0000/i.test(b)) {
        const m = b.match(/url\((https:[^)]+\.woff2)\)/);
        if (m) {
          url = m[1];
          break;
        }
      }
    }
    if (!url) {
      const m = css.match(/url\((https:[^)]+\.woff2)\)/g);
      if (m) url = m[m.length - 1].slice(4, -1);
    }
    if (!url) throw new Error('no woff2 url in CSS');
    const buf = Buffer.from(await (await fetch(url, { headers: { 'User-Agent': UA } })).arrayBuffer());
    await writeFile(resolve(outDir, filename), buf);
    console.log(`OK   ${filename} (${buf.length} bytes)`);
    ok++;
  } catch (err) {
    console.log(`FAIL ${filename}  (${err.message})`);
    fail++;
  }
}
console.log(`\nDone: ${ok} ok, ${fail} failed.`);
if (fail) process.exitCode = 1;
