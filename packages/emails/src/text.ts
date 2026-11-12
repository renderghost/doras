// Strings for email (#17), from the catalogues. In HTML, values such as
// handles, codes and addresses are marked up with their own direction, as
// email apps don't all honour the isolation characters the catalogues use.
// Plain text keeps those characters, which every plain-text reader shows.
import { format, formatCode, withoutIsolation, type Locale, type MessageKey } from '@doras/i18n';
import { colour } from './tokens.ts';

export const escape = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** A value and how it's written: left to right (handles, codes, addresses) or by its own words (names). */
export type Value =
  string | number | { text: string; ltr?: boolean; strong?: boolean; href?: string };

const textOf = (v: Value): string | number => (typeof v === 'object' ? v.text : v);

/** A catalogue string as plain text. */
export const plain = (
  locale: Locale,
  key: MessageKey,
  values: Record<string, Value> = {},
): string =>
  format(locale, key, Object.fromEntries(Object.entries(values).map(([k, v]) => [k, textOf(v)])));

/** A catalogue string as HTML, each value escaped and given its direction. */
export function html(locale: Locale, key: MessageKey, values: Record<string, Value> = {}): string {
  const names = Object.keys(values);
  // Private-use markers stand in for the values, so the string can be escaped first.
  const marked = Object.fromEntries(
    names.map((name, i) =>
      typeof values[name] === 'number' ? [name, values[name] as number] : [name, `${i}`],
    ),
  );
  const escaped = escape(withoutIsolation(format(locale, key, marked)));
  return escaped.replace(/(\d+)/g, (_, i: string) => {
    const v = values[names[Number(i)] ?? ''] as Value;
    const text = escape(String(textOf(v)));
    const ltr = typeof v === 'object' && v.ltr;
    const strong = typeof v === 'object' && v.strong;
    const href = typeof v === 'object' && v.href;
    if (href) {
      return `<a href="${escape(href)}" dir="ltr" style="color:${colour('link.text')};word-break:break-all">${text}</a>`;
    }
    const span = `<span dir="${ltr ? 'ltr' : 'auto'}">${text}</span>`;
    return strong ? `<strong>${span}</strong>` : span;
  });
}

/**
 * A code, digit by digit, so screen readers read “4 8 2”, not “four
 * hundred and eighty-two”, in groups of three, so it's easy to check.
 */
export const spokenCode = (code: string): string =>
  formatCode(code)
    .split(' ')
    .map((group) => [...group].join(' '))
    .join('\u2003');
