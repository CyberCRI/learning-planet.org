import type { Locale } from '~/i18n/utils';
import { localizedPath, locales } from '~/i18n/utils';

export type SeoProps = {
  title: string;
  description: string;
  /** bare path without locale prefix, e.g. "who-we-are" or "" for home */
  path?: string;
  locale: Locale;
  /** absolute or site-relative image for og:image */
  image?: string;
  noindex?: boolean;
};

const og: Record<Locale, string> = { en: 'en_GB', fr: 'fr_FR' };

/** Build the data a <head> needs: canonical, hreflang alternates, og locale. */
export function buildSeo(props: SeoProps, site: URL | undefined) {
  const origin = site?.origin ?? '';
  const bare = (props.path ?? '').replace(/^\/+/, '');
  const canonical = origin + localizedPath(bare, props.locale);

  const alternates: { hreflang: string; href: string }[] = locales.map((l) => ({
    hreflang: l as string,
    href: origin + localizedPath(bare, l),
  }));
  // x-default points at the default-locale URL
  alternates.push({ hreflang: 'x-default', href: origin + localizedPath(bare, 'en') });

  return {
    canonical,
    alternates,
    ogLocale: og[props.locale],
    ogLocaleAlternate: og[props.locale === 'en' ? 'fr' : 'en'],
  };
}
