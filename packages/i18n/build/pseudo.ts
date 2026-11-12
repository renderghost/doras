// The pseudo-locale: every letter accented, about 40% longer, and in
// brackets, so untranslated or truncated text stands out.
import { TYPE, parse, type MessageFormatElement } from '@formatjs/icu-messageformat-parser';
import { printAST } from '@formatjs/icu-messageformat-parser/printer.js';
import { NEVER_TRANSLATED, walk } from './check.ts';

const ACCENTS: Record<string, string> = Object.fromEntries(
  [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'].map((c, i) => [
    c,
    [...'áƀçðéƒĝĥíĵķĺɱñöþǫŕšţüṽŵẋýžÁƁÇÐÉƑĜĤÍĴĶĹṀÑÖƤǪŔŠŢÜṼŴẊÝŽ'][i] ?? c,
  ]),
);

const FILLER = 'one two three four five six seven eight nine ten'.split(' ');

const protectedPattern = new RegExp(`(${NEVER_TRANSLATED.join('|')})`, 'u');

/** Accents every letter, except in words that are never translated. */
export function accent(text: string): string {
  return text
    .split(protectedPattern)
    .map((part) =>
      NEVER_TRANSLATED.includes(part) ? part : part.replace(/[a-z]/gi, (c) => ACCENTS[c] ?? c),
    )
    .join('');
}

function filler(length: number): string {
  const words: string[] = [];
  let total = 0;
  for (let i = 0; total < length; i++) {
    const word = FILLER[i % FILLER.length] ?? 'one';
    words.push(word);
    total += word.length + 1;
  }
  return words.join(' ');
}

/** The pseudo-locale version of an ICU message. */
export function pseudoLocalise(message: string): string {
  const ast: MessageFormatElement[] = parse(message);
  let length = 0;
  for (const el of walk(ast)) {
    if (el.type === TYPE.literal) {
      length += el.value.length;
      el.value = accent(el.value);
    }
  }
  const extra = Math.max(1, Math.round(length * 0.4));
  return printAST([
    { type: TYPE.literal, value: '[' },
    ...ast,
    { type: TYPE.literal, value: ` ${filler(extra)}]` },
  ]);
}
