// Visual QA: screenshot the running site. Assumes a server is already serving
// on http://localhost:4321 (run `npm run preview` or `npm run dev` first).
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'screenshots');
await mkdir(outDir, { recursive: true });

const BASE = process.env.BASE || 'http://localhost:4321';
const shots = [
  { name: 'home', path: '/', full: true },
  { name: 'home-mobile', path: '/', full: true, mobile: true },
  { name: 'who-we-are', path: '/who-we-are', full: true },
  { name: 'replays', path: '/replays', full: true },
  { name: 'programme-empty', path: '/programme', full: true },
  { name: 'stay-informed', path: '/stay-informed', full: true },
  { name: 'fr-home', path: '/fr/', full: true },
];

const browser = await chromium.launch();
let failures = 0;
for (const s of shots) {
  const ctx = await browser.newContext({
    viewport: s.mobile ? { width: 390, height: 844 } : { width: 1280, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  try {
    await page.goto(BASE + s.path, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(700); // let fonts + count-up settle
    await page.screenshot({ path: resolve(outDir, `${s.name}.png`), fullPage: s.full });
    console.log(`OK   ${s.name}  ${errors.length ? '⚠ console errors: ' + errors.join(' | ') : ''}`);
    if (errors.length) failures++;
  } catch (err) {
    console.log(`FAIL ${s.name}  ${err.message}`);
    failures++;
  }
  await ctx.close();
}
await browser.close();
console.log(failures ? `\n${failures} issue(s).` : '\nAll shots OK, no console errors.');
