// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { show } from './src/config.ts';
import { LEGACY_REDIRECTS } from './src/data/legacyRedirects.ts';

// Production site URL — used for local builds. In CI, GitHub's Pages workflow
// overrides both site and base via CLI flags (astro build --site <pages origin>
// --base <base_path>), so this stays in sync with the Pages custom-domain
// setting automatically. The custom domain is LIVE at the apex (2026-07):
// https://learning-planet.org/ (www + github.io redirect to it), base "/".
const SITE = 'https://learning-planet.org';

// Held routes are noindexed while their flag is OFF — keep them out of the
// sitemap too, so search engines aren't pointed at "to be announced" pages.
const heldRoutes = [];
if (!show.programme) heldRoutes.push('programme', 'event');
if (!show.speakers) heldRoutes.push('speakers', 'speaker');
if (!show.partners) heldRoutes.push('partners');
// Temporary team-review previews — always out of the sitemap (pages are also
// noindexed). Remove together with src/pages/design-lab/.
heldRoutes.push('design-lab');
const heldRe = heldRoutes.length
  ? new RegExp(`/(?:fr/)?(?:${heldRoutes.join('|')})(?:/|$)`)
  : null;

// Meta-refresh stubs for moved/dropped WordPress URLs (src/pages/[...legacy].astro)
// are noindexed and must never appear in the sitemap.
const legacyRe = new RegExp(`^/(?:${Object.keys(LEGACY_REDIRECTS).join('|')})/?$`);

// https://astro.build/config
export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'ignore',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    routing: {
      prefixDefaultLocale: false, // EN at /, FR at /fr/
      redirectToDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      filter: (page) => {
        const pathname = new URL(page).pathname;
        if (legacyRe.test(pathname)) return false;
        return heldRe ? !heldRe.test(pathname) : true;
      },
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', fr: 'fr' },
      },
    }),
  ],
  image: {
    // allow optimizing the brand SVGs/PNGs in src/assets via astro:assets
    responsiveStyles: true,
  },
});
