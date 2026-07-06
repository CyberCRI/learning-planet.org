// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { show } from './src/config.ts';

// Production site URL — update to the final deploy domain before launch.
const SITE = 'https://festival.learning-planet.org';

// Held routes are noindexed while their flag is OFF — keep them out of the
// sitemap too, so search engines aren't pointed at "to be announced" pages.
const heldRoutes = [];
if (!show.programme) heldRoutes.push('programme', 'event');
if (!show.speakers) heldRoutes.push('speakers', 'speaker');
if (!show.partners) heldRoutes.push('partners');
const heldRe = heldRoutes.length
  ? new RegExp(`/(?:fr/)?(?:${heldRoutes.join('|')})(?:/|$)`)
  : null;

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
      filter: (page) => (heldRe ? !heldRe.test(new URL(page).pathname) : true),
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
