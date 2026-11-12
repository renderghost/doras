// The rules between tiers and themes.
import { beforeAll, describe, expect, it } from 'vitest';
import { resolveAll, themeNames, type ResolvedToken } from '../build/resolve.ts';
import { aliasOf } from '../build/values.ts';

let themes: Map<string, ResolvedToken[]>;
beforeAll(async () => {
  themes = await resolveAll();
});

const names = (theme: string): string[] => (themes.get(theme) ?? []).map((t) => t.name).sort();
const light = (): ResolvedToken[] => themes.get('light') ?? [];

/** Every reference anywhere in a token's value, including inside composites. */
function references(value: unknown): string[] {
  if (typeof value === 'string') return [...value.matchAll(/\{([^{}]+)\}/g)].map((m) => m[1] ?? '');
  if (Array.isArray(value)) return value.flatMap(references);
  if (value && typeof value === 'object') return Object.values(value).flatMap(references);
  return [];
}

describe('themes', () => {
  it('are the four from the resolver, light first', () => {
    expect(themeNames()).toEqual(['light', 'lightHighContrast', 'dark', 'darkHighContrast']);
  });

  it('all have exactly the same tokens', () => {
    const base = names('light');
    for (const theme of themeNames()) expect(names(theme), theme).toEqual(base);
  });

  it('give every semantic colour a value in every theme', () => {
    const colours = light().filter((t) => t.tier === 'semantic' && t.type === 'color');
    expect(colours.length).toBeGreaterThan(40);
    for (const theme of themeNames()) {
      const map = new Map((themes.get(theme) ?? []).map((t) => [t.name, t]));
      for (const c of colours) expect(map.get(c.name)?.value, `${theme} ${c.name}`).toBeTruthy();
    }
  });
});

describe('tiers', () => {
  it('semantic tokens are built only from primitives or other semantic tokens', () => {
    const bad = light()
      .filter((t) => t.tier === 'semantic')
      .flatMap((t) =>
        references(t.original)
          .filter((r) => r.startsWith('component.'))
          .map((r) => `${t.name} → ${r}`),
      );
    expect(bad).toEqual([]);
  });

  it('component tokens use semantic tokens, never primitives', () => {
    const component = light().filter((t) => t.tier === 'component');
    expect(component.length).toBeGreaterThan(0);
    for (const t of component) {
      const target = aliasOf(t.original);
      expect(target, `${t.name} must refer to a semantic token`).toBeDefined();
      expect(target?.startsWith('primitive.'), `${t.name} refers to ${target}`).toBe(false);
    }
  });

  it('every semantic colour describes its forced-colours system colour', () => {
    const missing = light()
      .filter((t) => t.tier === 'semantic' && t.type === 'color')
      .filter(
        (t) => !(t.extensions?.['org.doras'] as { forcedColor?: string } | undefined)?.forcedColor,
      )
      .map((t) => t.name);
    expect(missing).toEqual([]);
  });
});
