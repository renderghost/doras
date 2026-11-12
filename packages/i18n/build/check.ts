// The checks every catalogue must pass. The build stops on any problem.
import { TYPE, parse, type MessageFormatElement } from '@formatjs/icu-messageformat-parser';
import type { NaughtyTerm, SourceCatalogue, Translation } from './catalogues.ts';

/** Words that are never translated. Handles, domains, codes and provider names are values, not copy. */
export const NEVER_TRANSLATED = ['Atmosphere'];

/** CLDR's plural categories, in their usual order. */
const PLURAL_ORDER = ['zero', 'one', 'two', 'few', 'many', 'other'];

/** Every element in a message, depth first, through plural, select and tag branches. */
export function* walk(elements: MessageFormatElement[]): Generator<MessageFormatElement> {
  for (const el of elements) {
    yield el;
    if (el.type === TYPE.plural || el.type === TYPE.select) {
      for (const option of Object.values(el.options)) yield* walk(option.value);
    } else if (el.type === TYPE.tag) {
      yield* walk(el.children);
    }
  }
}

/** The names of a message's placeholders and tags. */
export function argumentNames(elements: MessageFormatElement[]): string[] {
  const names = new Set<string>();
  for (const el of walk(elements)) {
    if (el.type === TYPE.tag) names.add(`<${el.value}>`);
    else if (el.type !== TYPE.literal && el.type !== TYPE.pound) names.add(el.value);
  }
  return [...names].sort();
}

/** The text people read, without placeholders. */
export function literalText(elements: MessageFormatElement[]): string {
  const parts: string[] = [];
  for (const el of walk(elements)) if (el.type === TYPE.literal) parts.push(el.value);
  return parts.join(' ');
}

function parseOrProblem(
  locale: string,
  key: string,
  message: string,
  problems: string[],
): MessageFormatElement[] | null {
  try {
    return parse(message, { requiresOtherClause: true });
  } catch (error) {
    problems.push(`${locale} ${key}: isn't valid ICU MessageFormat (${(error as Error).message})`);
    return null;
  }
}

/** Problems with the source and translations: syntax, keys, placeholders, plurals and protected words. */
export function checkCatalogues(source: SourceCatalogue, translations: Translation[]): string[] {
  const problems: string[] = [];
  const parsed = new Map<string, MessageFormatElement[]>();
  for (const [key, entry] of Object.entries(source.messages)) {
    if (!entry.description?.trim()) problems.push(`${source.locale} ${key}: has no description`);
    const ast = parseOrProblem(source.locale, key, entry.message, problems);
    if (ast) parsed.set(key, ast);
  }

  for (const t of translations) {
    const keys = Object.keys(t.messages);
    for (const key of Object.keys(source.messages)) {
      if (!(key in t.messages)) problems.push(`${t.locale} ${key}: is missing`);
    }
    for (const key of keys) {
      if (!(key in source.messages))
        problems.push(`${t.locale} ${key}: isn't in the UK English source`);
    }
    const categories = [...new Intl.PluralRules(t.locale).resolvedOptions().pluralCategories].sort(
      (a, b) => PLURAL_ORDER.indexOf(a) - PLURAL_ORDER.indexOf(b),
    );

    for (const [key, message] of Object.entries(t.messages)) {
      const sourceAst = parsed.get(key);
      const ast = parseOrProblem(t.locale, key, message, problems);
      if (!ast || !sourceAst) continue;

      const want = argumentNames(sourceAst).join(', ');
      const got = argumentNames(ast).join(', ');
      if (want !== got)
        problems.push(
          `${t.locale} ${key}: has placeholders ${got || 'none'}, not ${want || 'none'}`,
        );

      for (const el of walk(ast)) {
        if (el.type !== TYPE.plural || el.pluralType !== 'cardinal') continue;
        const missing = categories.filter((c) => !(c in el.options));
        if (missing.length) {
          problems.push(`${t.locale} ${key}: the {${el.value}} plural needs ${missing.join(', ')}`);
        }
      }

      const sourceText = source.messages[key]?.message ?? '';
      for (const term of NEVER_TRANSLATED) {
        if (sourceText.includes(term) && !message.includes(term)) {
          problems.push(`${t.locale} ${key}: must keep “${term}”, which is never translated`);
        }
      }
    }
  }
  return problems;
}

/** Naughty-list words in the UK English source. */
export function checkNaughtyList(source: SourceCatalogue, terms: NaughtyTerm[]): string[] {
  const problems: string[] = [];
  for (const [key, entry] of Object.entries(source.messages)) {
    let text: string;
    try {
      text = literalText(parse(entry.message));
    } catch {
      continue; // Reported by checkCatalogues.
    }
    for (const t of terms) {
      const found = t.patterns.some((p) => new RegExp(p, t.caseSensitive ? 'u' : 'iu').test(text));
      if (found)
        problems.push(
          `${source.locale} ${key}: “${t.term}” is on the naughty list. Use ${t.useInstead}.`,
        );
    }
  }
  return problems;
}
