// Runtime QA for the partners directory (run from repo root: node <this file>)
import { chromium } from 'playwright';

const BASE = 'http://localhost:4321';
const results = [];
const check = (label, ok, detail = '') =>
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);

const browser = await chromium.launch();

// --- EN page, JS enabled ---
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const failedRequests = [];
page.on('requestfailed', (r) => failedRequests.push(r.url()));
await page.goto(`${BASE}/partners/`, { waitUntil: 'networkidle' });

const liCount = await page.locator('.partner-grid li').count();
check('507 cards rendered (EN)', liCount === 507, `got ${liCount}`);

const toolbarHidden = await page.locator('.directory-toolbar').isHidden();
check('toolbar revealed by JS', !toolbarHidden);

// Force every lazy image to load, then look for broken ones
await page.evaluate(async () => {
  document.querySelectorAll('.partner-grid img').forEach((img) => (img.loading = 'eager'));
  await Promise.all(
    [...document.querySelectorAll('.partner-grid img')].map((img) =>
      img.complete ? Promise.resolve() : new Promise((res) => { img.onload = img.onerror = res; })
    )
  );
});
const broken = await page.evaluate(() =>
  [...document.querySelectorAll('.partner-grid img')]
    .filter((img) => img.naturalWidth === 0)
    .map((img) => img.src)
);
check('zero broken logos (all 507 decoded)', broken.length === 0, broken.slice(0, 5).join(', '));
check('zero failed network requests', failedRequests.length === 0, failedRequests.slice(0, 5).join(', '));

// Search narrows
await page.fill('#partner-search', 'unesco');
const afterSearch = await page.locator('.partner-grid li:visible').count();
const statusText = await page.locator('.directory-status').textContent();
check('search "unesco" narrows results', afterSearch >= 1 && afterSearch < 20, `${afterSearch} visible, status="${statusText?.trim()}"`);

// Letter tab "2"
await page.fill('#partner-search', '');
await page.click('.letter-tabs button[data-letter="2"]');
const letter2Visible = await page.locator('.partner-grid li:visible').count();
const letter2Names = await page.locator('.partner-grid li:visible .partner-name').allTextContents();
check('tab "2" shows only digit-2 partners', letter2Visible > 0 && letter2Names.every((n) => n.trim().startsWith('2')), letter2Names.join(' | '));

// Diacritics-insensitive search: "7eme" should match "7ème Génération"
await page.click('.letter-tabs button[data-letter=""]');
await page.fill('#partner-search', '7eme');
const accentNames = await page.locator('.partner-grid li:visible .partner-name').allTextContents();
check('diacritic-insensitive search (7eme → 7ème)', accentNames.some((n) => n.includes('7ème')), accentNames.join(' | '));

// Clear -> all visible again
await page.fill('#partner-search', '');
const allAgain = await page.locator('.partner-grid li:visible').count();
check('clearing search restores all', allAgain === 507, `got ${allAgain}`);

// External link attributes
const firstLink = page.locator('.partner-grid li a').first();
check(
  'links open externally with rel',
  (await firstLink.getAttribute('target')) === '_blank' &&
    (await firstLink.getAttribute('rel')) === 'noopener noreferrer'
);

// Screenshots (desktop EN)
await page.screenshot({ path: 'screenshots/qa-partners.png', fullPage: false });

// --- FR page ---
await page.goto(`${BASE}/fr/partners/`, { waitUntil: 'networkidle' });
const frCount = await page.locator('.partner-grid li').count();
check('507 cards rendered (FR)', frCount === 507, `got ${frCount}`);
const frPlaceholder = await page.locator('#partner-search').getAttribute('placeholder');
check('FR search placeholder', frPlaceholder === 'Rechercher un partenaire', `got "${frPlaceholder}"`);
await page.fill('#partner-search', 'zzzznope');
const frStatus = (await page.locator('.directory-status').textContent())?.trim();
check('FR no-results message', frStatus === 'Aucun partenaire ne correspond à votre recherche.', `got "${frStatus}"`);
await page.fill('#partner-search', '');
await page.screenshot({ path: 'screenshots/qa-fr-partners.png', fullPage: false });

// Mobile EN screenshot
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(`${BASE}/partners/`, { waitUntil: 'networkidle' });
await mobile.screenshot({ path: 'screenshots/qa-partners-mobile.png', fullPage: false });
await mobile.close();

// --- No-JS progressive enhancement ---
const noJsCtx = await browser.newContext({ javaScriptEnabled: false });
const noJs = await noJsCtx.newPage();
await noJs.goto(`${BASE}/partners/`, { waitUntil: 'load' });
const noJsToolbarHidden = await noJs.locator('.directory-toolbar').isHidden();
const noJsCards = await noJs.locator('.partner-grid li').count();
check('no-JS: toolbar stays hidden', noJsToolbarHidden);
check('no-JS: all 507 cards visible', noJsCards === 507, `got ${noJsCards}`);
await noJsCtx.close();

await browser.close();
console.log(results.join('\n'));
process.exitCode = results.some((r) => r.startsWith('FAIL')) ? 1 : 0;
