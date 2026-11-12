// The built outputs: CSS, docs JSON, the typed entry, Swift and Kotlin.
import { beforeAll, describe, expect, it } from 'vitest';
import { cssName, renderCss } from '../build/css.ts';
import { renderDocs, renderEntry, type DocTokens } from '../build/docs.ts';
import { renderKotlin, renderSwift } from '../build/mobile.ts';
import { resolveAll, type ResolvedToken } from '../build/resolve.ts';

let themes: Map<string, ResolvedToken[]>;
let css: string;
let docs: DocTokens;
beforeAll(async () => {
  themes = await resolveAll();
  css = renderCss(themes);
  docs = renderDocs(themes);
});

const light = (): ResolvedToken[] => themes.get('light') ?? [];
const publicTokens = (): ResolvedToken[] => light().filter((t) => t.tier !== 'primitive');

/** The declarations inside the first block whose selector line contains `selector`. */
function blockAfter(selector: string): string {
  const start = css.indexOf(selector);
  if (start < 0) throw new Error(`No block for ${selector}`);
  return css.slice(start, css.indexOf('}', start));
}

describe('CSS', () => {
  it('never contains primitives, so components can only use semantic tokens', () => {
    expect(css).not.toMatch(/--doras-primitive/);
  });

  it('declares every semantic and component token', () => {
    for (const t of publicTokens()) {
      const name = cssName(t.path);
      const declared = t.type === 'typography' ? `${name}-font-size:` : `${name}:`;
      expect(css, t.name).toContain(declared);
    }
  });

  it('keeps dimensions in rem, except borders and focus, which stay in px', () => {
    expect(css).toContain('--doras-space-inset-lg: 1rem;');
    expect(css).toContain('--doras-size-target-min: 2.75rem;');
    expect(css).toContain('--doras-border-width-focus: 2px;');
    expect(css).toContain('--doras-focus-offset: 2px;');
  });

  it('lets the system choose dark, high contrast or both', () => {
    expect(css).toContain('@media (prefers-color-scheme: dark)');
    expect(css).toContain('@media (prefers-contrast: more)');
    expect(css).toContain('@media (prefers-color-scheme: dark) and (prefers-contrast: more)');
  });

  it.each(['light', 'light-high-contrast', 'dark', 'dark-high-contrast'])(
    'can force the %s theme with data-doras-theme',
    (theme) => {
      const block = blockAfter(`[data-doras-theme='${theme}']`);
      expect(block).toContain(`color-scheme: ${theme.startsWith('dark') ? 'dark' : 'light'};`);
      expect(block).toContain('--doras-color-text-default:');
    },
  );

  it('gives every semantic colour a system colour in forced colours, and drops shadows', () => {
    const block = blockAfter('@media (forced-colors: active)');
    for (const t of publicTokens().filter((x) => x.tier === 'semantic' && x.type === 'color')) {
      expect(block, t.name).toMatch(new RegExp(`${cssName(t.path)}: [A-Za-z]+;`));
    }
    expect(block).toContain('--doras-shadow-overlay: none;');
  });

  it('sets every duration to 0 for reduced motion', () => {
    const block = blockAfter('@media (prefers-reduced-motion: reduce)');
    const durations = publicTokens().filter((t) => t.type === 'duration');
    expect(durations.length).toBeGreaterThan(0);
    for (const t of durations) expect(block).toContain(`${cssName(t.path)}: 0ms;`);
  });

  it('keeps component tokens as references, so themes flow through them', () => {
    expect(css).toContain(
      '--doras-atmosphere-button-surface: var(--doras-color-action-primary-surface);',
    );
  });
});

describe('docs JSON and the typed entry', () => {
  it('lists every token with a value for every theme', () => {
    expect(docs.themes).toEqual(['light', 'lightHighContrast', 'dark', 'darkHighContrast']);
    expect(docs.tokens.length).toBe(light().length);
    for (const t of docs.tokens) expect(Object.keys(t.values), t.name).toEqual(docs.themes);
  });

  it('gives primitives no CSS variable', () => {
    for (const t of docs.tokens.filter((x) => x.tier === 'primitive')) expect(t.cssVar).toBeNull();
  });

  it('types every public token name', () => {
    const { dts } = renderEntry(docs);
    for (const t of publicTokens()) expect(dts).toContain(`'${t.name}'`);
    expect(dts).not.toContain("'primitive.");
  });
});

describe('Swift and Kotlin', () => {
  it('include every public token, and no primitives', () => {
    const swift = renderSwift(themes).core;
    const kotlin = renderKotlin(themes).core;
    for (const t of publicTokens()) {
      expect(swift, t.name).toContain(`Token: \`${t.name}\``);
      expect(kotlin, t.name).toContain(`Token: \`${t.name}\``);
    }
    expect(swift).not.toContain('Token: `primitive.');
    expect(kotlin).not.toContain('Token: `primitive.');
  });

  it('escape names that are keywords', () => {
    expect(renderSwift(themes).core).toContain('public static let `default`: Double');
  });

  it('give every colour all four themes', () => {
    const swift = renderSwift(themes).core;
    expect(swift).toMatch(
      /textDefault: DorasThemedColor = DorasThemedColor\(light: .+, lightHighContrast: .+, dark: .+, darkHighContrast: .+\)/,
    );
  });

  it('keep SwiftUI and Compose out of the core files', () => {
    expect(renderSwift(themes).core).not.toContain('import SwiftUI');
    expect(renderKotlin(themes).core).not.toContain('androidx.');
  });
});
