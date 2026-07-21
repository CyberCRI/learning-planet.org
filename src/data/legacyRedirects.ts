/**
 * Old WordPress URLs (inventory: the legacy sitemaps in _sources/sitemaps/)
 * that moved or were dropped in the 2027 rebuild. Each entry becomes a static
 * meta-refresh page via src/pages/[...legacy].astro so indexed links keep
 * resolving — GitHub Pages has no server-side redirects.
 *
 * Old URLs whose path is unchanged (/replays, /partners, the legal pages,
 * /speakers, /programme) need no entry. The large speaker/event/organisation/
 * taxonomy trees (~15k URLs) are handled by the pattern redirector in
 * src/pages/404.astro instead of per-URL stubs.
 *
 * Keys are old paths without leading/trailing slash; values are new
 * root-absolute targets (made base-aware at render time).
 * Kept dependency-free: astro.config.mjs imports it to exclude these paths
 * from the sitemap.
 */
export const LEGACY_REDIRECTS: Record<string, string> = {
  // renamed page
  'who-are-we': '/who-we-are/',
  'fr/who-are-we': '/fr/who-we-are/',

  // past events → the replays archive
  'past-events': '/replays/',
  'fr/past-events': '/fr/replays/',

  // old home-instance slug → home
  'learning-planet-festival-3': '/',
  'fr/learning-planet-festival-3': '/fr/',

  // stay-informed is a homepage section on the new site
  'stay-informed': '/#stay-informed',
  'fr/stay-informed': '/fr/#stay-informed',

  // held section with no page on the new site yet
  calendar: '/',

  // FR regional "festival de l'apprendre" pages → French home
  'festival-de-lapprendre': '/fr/',
  'fr/festival-de-lapprendre': '/fr/',
  'festival-de-lapprendre-brest': '/fr/',
  'fr/festival-de-lapprendre-brest': '/fr/',
  'festival-de-lapprendre-lyon-2': '/fr/',
  'fr/festival-de-lapprendre-lyon-2': '/fr/',
  'festival-de-lapprendre-nouvelle-aquitaine': '/fr/',
  'fr/festival-de-lapprendre-nouvelle-aquitaine': '/fr/',
  'festival-de-lapprendre-paris': '/fr/',
  'fr/festival-de-lapprendre-paris': '/fr/',
  'festival-de-lapprendre-saint-etienne': '/fr/',
  'fr/festival-de-lapprendre-saint-etienne': '/fr/',

  // dropped WordPress operational pages (no equivalent) → home
  'create-an-account': '/',
  'fr/create-an-account': '/fr/',
  'your-dashboard': '/',
  'fr/your-dashboard': '/fr/',
  'submit-your-event': '/',
  'fr/submit-your-event': '/fr/',
  'edit-an-event': '/',
  'fr/edit-an-event': '/fr/',
  'edit-a-speaker': '/',
  'fr/edit-a-speaker': '/fr/',
  'generate-your-design': '/',
  'fr/generate-your-design': '/fr/',
};
