// Initials in any script: whole graphemes, so emoji, accented letters and
// Japanese or Arabic names come out whole.

const graphemes = (text: string): string[] =>
  [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)].map(
    (s) => s.segment,
  );

/** Up to two initials: the first and last words' first graphemes, or one for a single word. */
export function initialsFor(name: string, locale?: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0];
  if (!first) return '';
  const last = words.length > 1 ? words[words.length - 1] : undefined;
  return [first, last]
    .filter((w): w is string => Boolean(w))
    .map((w) => graphemes(w)[0] ?? '')
    .join('')
    .toLocaleUpperCase(locale);
}
