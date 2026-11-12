// WCAG contrast for every pairing the components use, in every theme.
//   Text: 4.5:1 (AA), and 7:1 (AAA, 1.4.6) in the high-contrast themes.
//   Non-text (field edges, focus rings, meaningful icons): 3:1 (1.4.11).
import { beforeAll, describe, expect, it } from 'vitest';
import { resolveAll, themeNames, type ResolvedToken } from '../build/resolve.ts';
import { contrast, rgba, type Rgba } from '../build/values.ts';

let themes: Map<string, ResolvedToken[]>;
beforeAll(async () => {
  themes = await resolveAll();
});

const SURFACES = ['color.surface.default', 'color.surface.subtle', 'color.surface.raised'];
const PAGE = ['color.surface.default', 'color.surface.raised'];

/** [foreground, background] pairs where the foreground is text. */
const TEXT: [string, string][] = [
  ...['default', 'subtle', 'error', 'automated'].flatMap((t) =>
    SURFACES.map((s): [string, string] => [`color.text.${t}`, s]),
  ),
  ...PAGE.map((s): [string, string] => ['color.text.success', s]),
  ...SURFACES.map((s): [string, string] => ['color.link.text', s]),
  ['color.text.inverse', 'color.text.default'],
  ['color.action.primary.text', 'color.action.primary.surface'],
  ['color.action.primary.text', 'color.action.primary.surface-hover'],
  ['color.action.secondary.text', 'color.action.secondary.surface'],
  ['color.action.secondary.text', 'color.action.secondary.surface-hover'],
  ...['success', 'error', 'info', 'automated'].map((f): [string, string] => [
    `color.feedback.${f}.text`,
    `color.feedback.${f}.surface`,
  ]),
  ['color.text.default', 'color.selected.surface'],
  ['component.atmosphere-button.text', 'component.atmosphere-button.surface'],
  ['component.atmosphere-button.text', 'component.atmosphere-button.surface-hover'],
];

/** [foreground, background] pairs where the foreground isn't text but must be seen. */
const NON_TEXT: [string, string][] = [
  ...['control', 'focus', 'error', 'emphasis'].flatMap((b) =>
    SURFACES.map((s): [string, string] => [`color.border.${b}`, s]),
  ),
  ...PAGE.map((s): [string, string] => ['color.selected.border', s]),
  ['color.selected.border', 'color.selected.surface'],
  ['color.selected.icon', 'color.selected.surface'],
  ...['default', 'subtle'].flatMap((i) =>
    SURFACES.map((s): [string, string] => [`color.icon.${i}`, s]),
  ),
  ...['success', 'error', 'info', 'automated'].map((f): [string, string] => [
    `color.feedback.${f}.icon`,
    `color.feedback.${f}.surface`,
  ]),
  ...PAGE.map((s): [string, string] => ['color.link.decoration', s]),
  ...PAGE.map((s): [string, string] => ['component.atmosphere-button.border', s]),
];

const highContrast = (theme: string): boolean => theme.endsWith('HighContrast');

function colour(theme: string, name: string): Rgba {
  const token = themes.get(theme)?.find((t) => t.name === name);
  if (!token) throw new Error(`No ${name} in ${theme}`);
  return rgba(token.value);
}

describe.each(themeNames())('%s', (theme) => {
  const textMin = highContrast(theme) ? 7 : 4.5;

  it.each(TEXT)(`text %s on %s is at least ${textMin}:1`, (fg, bg) => {
    expect(contrast(colour(theme, fg), colour(theme, bg))).toBeGreaterThanOrEqual(textMin);
  });

  it.each(NON_TEXT)('%s on %s is at least 3:1', (fg, bg) => {
    expect(contrast(colour(theme, fg), colour(theme, bg))).toBeGreaterThanOrEqual(3);
  });
});

describe('the contrast check itself', () => {
  it('matches known WCAG ratios', () => {
    const black = { r: 0, g: 0, b: 0, a: 1 };
    const white = { r: 1, g: 1, b: 1, a: 1 };
    const grey = { r: 0x76 / 255, g: 0x76 / 255, b: 0x76 / 255, a: 1 };
    expect(contrast(black, white)).toBeCloseTo(21, 5);
    expect(contrast(grey, white)).toBeCloseTo(4.54, 2);
  });

  it('paints translucent colours over the background first', () => {
    const halfBlack = { r: 0, g: 0, b: 0, a: 0.5 };
    const white = { r: 1, g: 1, b: 1, a: 1 };
    expect(contrast(halfBlack, white)).toBeLessThan(5);
    expect(contrast(halfBlack, white)).toBeGreaterThan(3);
  });
});
