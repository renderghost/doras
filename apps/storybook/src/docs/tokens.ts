// Reads the tokens' docs JSON, built by @doras/tokens, for the token tables.
import data from '@doras/tokens/tokens.json';

export type ThemeKey = 'light' | 'lightHighContrast' | 'dark' | 'darkHighContrast';

export interface ThemeValue {
  value: unknown;
  original: unknown;
  css: string | null;
  aliasOf: string | null;
}

export interface Token {
  name: string;
  tier: 'primitive' | 'semantic' | 'component';
  type: string;
  description: string | null;
  cssVar: string | null;
  forcedColor: string | null;
  code: { web: string; ios: string; android: string } | null;
  values: Record<ThemeKey, ThemeValue>;
}

/** The four themes, in the order they're shown, with their data-doras-theme names. */
export const THEMES: { key: ThemeKey; title: string; attribute: string }[] = [
  { key: 'light', title: 'Light', attribute: 'light' },
  { key: 'lightHighContrast', title: 'Light, high contrast', attribute: 'light-high-contrast' },
  { key: 'dark', title: 'Dark', attribute: 'dark' },
  { key: 'darkHighContrast', title: 'Dark, high contrast', attribute: 'dark-high-contrast' },
];

/** Every token apps can use: semantic and component tokens. Primitives stay inside the package. */
export const tokens: Token[] = (data as { tokens: Token[] }).tokens.filter(
  (t) => t.tier !== 'primitive',
);

/** The tokens whose names start with any of the prefixes. */
export function tokensWith(...prefixes: string[]): Token[] {
  return tokens.filter((t) => prefixes.some((p) => t.name === p || t.name.startsWith(`${p}.`)));
}

/** Finds a token by name, or throws, so a typo in a spec or page fails loudly. */
export function token(name: string): Token {
  const found = tokens.find((t) => t.name === name);
  if (!found) throw new Error(`There's no public token called ${name}`);
  return found;
}

/** Whether a token has the same CSS in every theme. */
export function sameInEveryTheme(t: Token): boolean {
  const first = t.values.light.css;
  return THEMES.every(({ key }) => t.values[key].css === first);
}
