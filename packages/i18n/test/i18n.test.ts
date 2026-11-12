import { parse } from '@formatjs/icu-messageformat-parser';
import { describe, expect, it } from 'vitest';
import {
  readCatalogues,
  readNaughtyList,
  type SourceCatalogue,
  type Translation,
} from '../build/catalogues.ts';
import { argumentNames, checkCatalogues, checkNaughtyList, literalText } from '../build/check.ts';
import { compile } from '../build/index.ts';
import { pseudoLocalise } from '../build/pseudo.ts';
import {
  LOCALES,
  format,
  formatCode,
  formatList,
  matchLocale,
  withoutIsolation,
  type MessageKey,
} from '../src/index.ts';

const { source, translations } = readCatalogues();
const terms = readNaughtyList();

const sourceOf = (messages: Record<string, string>): SourceCatalogue => ({
  locale: 'en-GB',
  status: 'source',
  messages: Object.fromEntries(
    Object.entries(messages).map(([k, message]) => [k, { message, description: 'A test.' }]),
  ),
});
const translation = (locale: string, messages: Record<string, string>): Translation => ({
  locale,
  status: 'test',
  messages,
});

describe('the catalogues', () => {
  it('pass every check', () => {
    expect(checkCatalogues(source, translations)).toEqual([]);
    expect(checkNaughtyList(source, terms)).toEqual([]);
  });

  it('cover every locale Doras ships', () => {
    expect(Object.keys(compile()).sort()).toEqual([...LOCALES].sort());
  });

  it('mark every translation as a test translation until it is reviewed', () => {
    for (const t of translations) expect(t.status, t.locale).toBe('test');
  });

  it('format every message in every locale', () => {
    for (const [key, entry] of Object.entries(source.messages)) {
      const values = Object.fromEntries(
        argumentNames(parse(entry.message))
          .filter((n) => !n.startsWith('<'))
          .map((n) => [n, n === 'minutes' ? 15 : 'Sample']),
      );
      for (const locale of LOCALES) {
        expect(format(locale, key as MessageKey, values), `${locale} ${key}`).not.toBe('');
      }
    }
  });
});

describe('checkCatalogues', () => {
  const base = sourceOf({ hello: 'Hello {name}', atmo: 'Continue with Atmosphere' });

  it('passes a good translation', () => {
    const de = translation('de', { hello: 'Hallo {name}', atmo: 'Weiter mit Atmosphere' });
    expect(checkCatalogues(base, [de])).toEqual([]);
  });

  it('catches missing and extra keys', () => {
    const de = translation('de', { hello: 'Hallo {name}', extra: 'Mehr' });
    expect(checkCatalogues(base, [de])).toEqual([
      'de atmo: is missing',
      "de extra: isn't in the UK English source",
    ]);
  });

  it('catches changed placeholders', () => {
    const de = translation('de', { hello: 'Hallo {nom}', atmo: 'Weiter mit Atmosphere' });
    expect(checkCatalogues(base, [de])).toEqual(['de hello: has placeholders nom, not name']);
  });

  it('catches a translated Atmosphere', () => {
    const de = translation('de', { hello: 'Hallo {name}', atmo: 'Weiter mit Atmosphäre' });
    expect(checkCatalogues(base, [de])[0]).toMatch(/must keep “Atmosphere”/);
  });

  it('catches plurals missing the locale’s plural forms', () => {
    const plural = sourceOf({ n: '{n, plural, one {# minute} other {# minutes}}' });
    const ar = translation('ar', { n: '{n, plural, one {دقيقة} other {# دقيقة}}' });
    expect(checkCatalogues(plural, [ar])).toEqual([
      'ar n: the {n} plural needs zero, two, few, many',
    ]);
  });

  it('catches broken syntax and missing descriptions', () => {
    const broken: SourceCatalogue = {
      locale: 'en-GB',
      status: 'source',
      messages: { bad: { message: 'Hello {name', description: '' } },
    };
    const problems = checkCatalogues(broken, []);
    expect(problems[0]).toBe('en-GB bad: has no description');
    expect(problems[1]).toMatch(/^en-GB bad: isn't valid ICU MessageFormat/);
  });
});

describe('the naughty-list check', () => {
  const problemsFor = (message: string) => checkNaughtyList(sourceOf({ key: message }), terms);

  it.each([
    ['Log in to Potluck', 'Log in'],
    ['Your login details', 'Log in'],
    ['Your PDS is down', 'PDS'],
    ['We sent a magic link', 'Magic link'],
    ['Your DID never changes', 'DID'],
    ['Move to another instance', 'Instance'],
    ['Allow these scopes', 'Scope'],
    ['Built on the AT Protocol', 'AT Protocol'],
    ['Welcome to the ATmosphere', 'ATmosphere'],
  ])('fails “%s” for %s', (message, term) => {
    expect(problemsFor(message)).toEqual([
      expect.stringContaining(`“${term}” is on the naughty list`),
    ]);
  });

  it.each([
    'We never put a sign-in link in an email.',
    'You did it.',
    'Sign in to Potluck',
    'Continue with Atmosphere',
  ])('passes “%s”', (message) => {
    expect(problemsFor(message)).toEqual([]);
  });

  it('checks the words people read, not placeholder names', () => {
    expect(literalText(parse('Hosted by {pds}'))).toBe('Hosted by ');
    expect(problemsFor('Hosted by {pds}')).toEqual([]);
  });
});

describe('the pseudo-locale', () => {
  const english = 'The code works for {minutes, plural, one {# minute} other {# minutes}}.';
  const pseudo = pseudoLocalise(english);

  it('is in brackets, accented and at least 40% longer', () => {
    expect(pseudo.startsWith('[')).toBe(true);
    expect(pseudo.endsWith(']')).toBe(true);
    expect(pseudo).toContain('Ţĥé çöðé');
    expect(literalText(parse(pseudo)).length).toBeGreaterThanOrEqual(
      literalText(parse(english)).length * 1.4,
    );
  });

  it('keeps placeholders and plurals working', () => {
    expect(argumentNames(parse(pseudo))).toEqual(['minutes']);
    expect(format('en-XA', 'email.recovery.codeLifetime', { minutes: 1 })).toContain('1 ɱíñüţé.');
  });

  it('never accents words that are never translated', () => {
    expect(pseudoLocalise('Continue with Atmosphere')).toContain(' Atmosphere ');
  });
});

describe('formatting', () => {
  it('isolates text values, so they keep their direction inside other scripts', () => {
    expect(format('ar', 'identity.hostedBy', { provider: 'Bluesky' })).toBe('يستضيفه ⁨Bluesky⁩');
    expect(withoutIsolation(format('en-GB', 'identity.hostedBy', { provider: 'Bluesky' }))).toBe(
      'Hosted by Bluesky',
    );
  });

  it('formats numbers with the locale’s plural rules', () => {
    expect(format('en-GB', 'email.recovery.codeLifetime', { minutes: 1 })).toBe(
      'The code works for 1 minute.',
    );
    expect(format('ar', 'email.recovery.codeLifetime', { minutes: 2 })).toContain('دقيقتين');
  });

  it('matches language tags to a Doras locale', () => {
    expect(matchLocale('de-AT')).toBe('de');
    expect(matchLocale('AR-eg')).toBe('ar');
    expect(matchLocale('en-US')).toBe('en-GB');
    expect(matchLocale('en-XA')).toBe('en-XA');
    expect(matchLocale('fr')).toBe('en-GB');
    expect(matchLocale(null)).toBe('en-GB');
  });

  it('groups codes for reading, without translating them', () => {
    expect(formatCode('123456')).toBe('123 456');
    expect(formatCode('123 456')).toBe('123 456');
    expect(formatCode('12345678', 4)).toBe('1234 5678');
  });

  it('joins lists for the locale', () => {
    expect(withoutIsolation(formatList('en-GB', ['Bluesky', 'Blacksky', 'Eurosky']))).toBe(
      'Bluesky, Blacksky and Eurosky',
    );
  });
});
