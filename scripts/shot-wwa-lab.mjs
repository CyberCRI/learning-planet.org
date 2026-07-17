// DESIGN LAB (temporary) — screenshot the who-we-are variants + current baseline.
// Assumes `npm run preview` serving on http://localhost:4321.
// Delete together with src/pages/design-lab/.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const outDir = resolve(import.meta.dirname, '../screenshots/wwa-lab');
await mkdir(outDir, { recursive: true });

const BASE = process.env.BASE || 'http://localhost:4321';
const shots = [
  { name: 'baseline-desktop', path: '/who-we-are' },
  { name: 'baseline-mobile', path: '/who-we-are', mobile: true },
  { name: 'a-desktop', path: '/design-lab/who-we-are/a' },
  { name: 'a-mobile', path: '/design-lab/who-we-are/a', mobile: true },
  { name: 'b-desktop', path: '/design-lab/who-we-are/b' },
  { name: 'b-mobile', path: '/design-lab/who-we-are/b', mobile: true },
  { name: 'c-desktop', path: '/design-lab/who-we-are/c', openFirstGoal: true },
  { name: 'c-mobile', path: '/design-lab/who-we-are/c', mobile: true },
  { name: 'hub-desktop', path: '/design-lab/who-we-are/' },
];

const browser = await chromium.launch();
let failures = 0;
for (const s of shots) {
  const ctx = await browser.newContext({
    viewport: s.mobile ? { width: 390, height: 844 } : { width: 1280, height: 900 },
    deviceScaleFactor: 1,
  });
  // Pre-dismiss the cookie banner so it doesn't overlap the page mid-scroll.
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem('lpf_cookie_choice', 'declined');
    } catch {}
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  try {
    await page.goto(BASE + s.path, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(600); // fonts settle
    // Scroll through the page so IntersectionObservers (count-up) fire and
    // lazy images load, then wait for every image to finish decoding.
    await page.evaluate(async () => {
      // html has scroll-behavior:smooth — force instant jumps so each step
      // actually lands and IntersectionObservers get their dwell time.
      const step = window.innerHeight * 0.8;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo({ top: y, behavior: 'instant' });
        await new Promise((r) => setTimeout(r, 200));
      }
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
      await Promise.all(
        Array.from(document.images)
          .filter((img) => !img.complete)
          .map((img) => new Promise((r) => ((img.onload = r), (img.onerror = r))))
      );
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    await page.waitForTimeout(2000); // count-up animation completes (~1.4s)
    // Belt and braces: confirm the stat counters actually landed.
    await page
      .waitForFunction(
        () =>
          Array.from(document.querySelectorAll('.impact-num')).every(
            (n) => n.textContent && n.textContent !== '0'
          ),
        { timeout: 5000 }
      )
      .catch(() => console.log(`     note: ${s.name} counters did not settle`));
    if (s.openFirstGoal) {
      await page.evaluate(() => {
        const d = document.querySelector('.goals-wall details');
        if (d) d.open = true;
      });
      await page.waitForTimeout(200);
    }
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    await page.screenshot({ path: resolve(outDir, `${s.name}.png`), fullPage: true });
    const notes = [];
    if (errors.length) notes.push('console errors: ' + errors.join(' | '));
    if (overflow > 0) notes.push(`H-OVERFLOW ${overflow}px`);
    console.log(`OK   ${s.name}${notes.length ? '  ⚠ ' + notes.join(' ; ') : ''}`);
    if (notes.length) failures++;
  } catch (err) {
    console.log(`FAIL ${s.name}  ${err.message}`);
    failures++;
  }
  await ctx.close();
}
await browser.close();
console.log(failures ? `\n${failures} issue(s).` : '\nAll shots OK, no console errors, no overflow.');
