// The locales Doras ships, and how a page's lang attribute picks one.

/** UK English is the source. The others are test locales until professional translations exist. */
export const LOCALES = ['en-GB', 'en-XA', 'ar', 'de', 'ja'] as const;
export type Locale = (typeof LOCALES)[number];

export const SOURCE_LOCALE: Locale = 'en-GB';

/** en-XA is the pseudo-locale: accented, about 40% longer, and in brackets. */
export const PSEUDO_LOCALE: Locale = 'en-XA';

export const DIRECTIONS: Record<Locale, 'ltr' | 'rtl'> = {
  'en-GB': 'ltr',
  'en-XA': 'ltr',
  ar: 'rtl',
  de: 'ltr',
  ja: 'ltr',
};

/**
 * The best Doras locale for a language tag: an exact match, then the same
 * language (de-AT → de, ar-EG → ar, en-US → en-GB), then UK English.
 */
export function matchLocale(tag: string | null | undefined): Locale {
  if (!tag) return SOURCE_LOCALE;
  const lower = tag.toLowerCase();
  const exact = LOCALES.find((l) => l.toLowerCase() === lower);
  if (exact) return exact;
  const language = lower.split('-')[0];
  if (language === 'en') return SOURCE_LOCALE;
  return LOCALES.find((l) => l.toLowerCase() === language) ?? SOURCE_LOCALE;
}

/**
 * The locale an element is in: the nearest lang attribute, looking out
 * through shadow roots, as the browser does.
 */
export function localeOf(element: Element): Locale {
  let node: Element | null = element;
  while (node) {
    const withLang: Element | null = node.closest('[lang]');
    if (withLang) return matchLocale(withLang.getAttribute('lang'));
    const root = node.getRootNode();
    node = root instanceof ShadowRoot ? root.host : null;
  }
  return SOURCE_LOCALE;
}
