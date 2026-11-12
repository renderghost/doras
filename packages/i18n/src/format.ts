// Formats catalogue messages. Copy is locked: there's no way to pass in
// other words, only the locale and the values for a message's placeholders.
import { IntlMessageFormat } from 'intl-messageformat';
import { catalogues, type MessageKey } from './generated/catalogues.ts';
import type { Locale } from './locales.ts';

export type { MessageKey };

export type MessageValues = Record<string, string | number | Date>;

// Unicode's first-strong isolate and pop directional isolate: the plain-text
// equivalent of <bdi>, which also works in attributes such as aria-label.
const FSI = '⁨';
const PDI = '⁩';

/** Isolates text so its direction can't mix with the sentence around it. */
export const isolate = (text: string): string => `${FSI}${text}${PDI}`;

/** Removes isolation marks, for comparing or copying text. */
export const withoutIsolation = (text: string): string => text.replace(/[⁨⁩]/g, '');

const cache = new Map<string, IntlMessageFormat>();

function formatter(locale: Locale, key: MessageKey): IntlMessageFormat {
  const id = `${locale}\u0000${key}`;
  let mf = cache.get(id);
  if (!mf) {
    mf = new IntlMessageFormat(catalogues[locale][key], locale);
    cache.set(id, mf);
  }
  return mf;
}

/**
 * A message in a locale. Text values, such as handles, domains, codes and
 * provider names, are isolated, so they read correctly inside Arabic text
 * and Arabic names read correctly inside English. Numbers and dates are
 * formatted for the locale by the message itself.
 */
export function format(locale: Locale, key: MessageKey, values: MessageValues = {}): string {
  const isolated = Object.fromEntries(
    Object.entries(values).map(([name, value]) => [
      name,
      typeof value === 'string' ? isolate(value) : value,
    ]),
  );
  return String(formatter(locale, key).format(isolated));
}

/**
 * A code grouped for reading, such as 123 456. Codes are never translated
 * and always use the digits people type.
 */
export function formatCode(code: string, groupSize = 3): string {
  const compact = code.replace(/\s+/g, '');
  const groups: string[] = [];
  for (let i = 0; i < compact.length; i += groupSize) groups.push(compact.slice(i, i + groupSize));
  return groups.join(' ');
}

/** A list joined for the locale, such as “Bluesky, Blacksky and Eurosky”. */
export function formatList(
  locale: Locale,
  items: string[],
  type: 'conjunction' | 'disjunction' = 'conjunction',
): string {
  return new Intl.ListFormat(locale, { style: 'long', type }).format(items.map(isolate));
}
