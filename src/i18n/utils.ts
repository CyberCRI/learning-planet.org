import en from './en.json';
import fr from './fr.json';

export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

const dictionaries: Record<Locale, Record<string, unknown>> = { en, fr };

/** Read a dotted key (e.g. "nav.whoWeAre") from a nested dictionary. */
function lookup(dict: Record<string, unknown>, key: string): string | undefined {
  const value = key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, dict);
  return typeof value === 'string' ? value : undefined;
}

/**
 * Translation helper. Returns t(key, vars?) bound to a locale.
 * Falls back to the default locale (EN) when a key is missing — so /fr/
 * routes render cleanly even while fr.json is only partially translated.
 */
export function useTranslations(locale: Locale) {
  return function t(key: string, vars?: Record<string, string | number>): string {
    let str = lookup(dictionaries[locale], key) ?? lookup(dictionaries[defaultLocale], key) ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return str;
  };
}

/** Pull the locale out of a URL pathname (Astro also exposes Astro.currentLocale). */
export function getLocaleFromPath(pathname: string): Locale {
  const seg = pathname.split('/').filter(Boolean)[0];
  return (locales as readonly string[]).includes(seg) ? (seg as Locale) : defaultLocale;
}

/**
 * Build a locale-aware path. EN has no prefix (prefixDefaultLocale: false);
 * FR is prefixed with /fr. Always returns a leading-slash absolute path.
 */
export function localizedPath(path: string, locale: Locale): string {
  const clean = '/' + path.replace(/^\/+/, '').replace(/\/+$/, '');
  const base = clean === '/' ? '' : clean;
  return locale === defaultLocale ? base || '/' : `/${locale}${base || ''}` || `/${locale}`;
}

/** Map the current path to its equivalent in the other locale (for the switcher). */
export function alternatePath(pathname: string, target: Locale): string {
  // strip a leading /fr (or other locale) segment, then re-localize
  const segments = pathname.split('/').filter(Boolean);
  if ((locales as readonly string[]).includes(segments[0])) segments.shift();
  const bare = segments.join('/');
  return localizedPath(bare, target);
}

/** The opposite locale, for a two-language switcher. */
export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'fr' : 'en';
}
