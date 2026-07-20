// Shoot the hero area (viewport-height crop) of given paths, desktop + mobile.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const BASE = process.env.BASE || 'http://localhost:4321';
const outDir = process.env.OUT || resolve(process.cwd(), 'screenshots/hero-lab');
await mkdir(outDir, { recursive: true });

// args: name=path pairs, e.g. current=/ g=/design-lab/hero/g
const pairs = process.argv.slice(2).map((a) => a.split('='));

const browser = await chromium.launch();
for (const [name, path] of pairs) {
  for (const mobile of [false, true]) {
    const ctx = await browser.newContext({
      viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
      deviceScaleFactor: mobile ? 2 : 1.5,
    });
    const page = await ctx.newPage();
    await page.addInitScript(() => localStorage.setItem('lpf_cookie_choice', 'declined'));
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(900);
    const suffix = mobile ? 'mobile' : 'desktop';
    await page.screenshot({ path: resolve(outDir, `${name}-${suffix}.png`) });
    console.log(`OK ${name}-${suffix}${errors.length ? '  ⚠ ' + errors.join(' | ') : ''}`);
    await ctx.close();
  }
}
await browser.close();
