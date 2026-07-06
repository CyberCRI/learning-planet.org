/**
 * Deploy-base helpers. CI injects the base via `astro build --base <path>`
 * (GitHub Pages project path: "/learning-planet.org"); locally and at the
 * custom domain the base is "/". BASE_URL is verbatim config.base under
 * trailingSlash:'ignore' — tolerate both slash forms anyway.
 */
const raw: string = import.meta.env.BASE_URL; // '/', '/learning-planet.org', or '/learning-planet.org/'

/** Deploy base without trailing slash: '' at root, '/learning-planet.org' on a sub-path. */
export const BASE = raw.replace(/\/+$/, '');

/** Prefix a bare or root-absolute path with the deploy base. Always returns a leading slash. */
export function withBase(path: string): string {
  return `${BASE}/${path.replace(/^\/+/, '')}`;
}

/**
 * Strip the deploy base from a pathname if present. Astro.url.pathname INCLUDES
 * the base in static builds but EXCLUDES it in `astro dev` — so stripping
 * must be conditional.
 */
export function stripBase(pathname: string): string {
  if (BASE && (pathname === BASE || pathname.startsWith(BASE + '/'))) {
    return pathname.slice(BASE.length) || '/';
  }
  return pathname;
}
