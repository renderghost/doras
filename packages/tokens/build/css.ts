// Writes the tokens as CSS custom properties, with every theme, the system
// preferences that pick one, Windows forced colours and reduced motion.
import type { ResolvedToken } from './resolve.ts';
import { aliasOf, cssColor, cubicBezier, ms, px, rgba, shadowLayers, textStyle } from './values.ts';

export const PREFIX = 'doras';
const ROOT_FONT_SIZE = 16;

/** Dimensions kept in px, so they don't grow when people resize text. */
const PX_GROUPS = new Set(['border-width', 'focus']);

/** Font family names CSS knows as keywords, which must not be quoted. */
const GENERIC_FAMILIES = new Set([
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  'ui-serif',
  'ui-sans-serif',
  'ui-monospace',
  'ui-rounded',
  'math',
  'emoji',
  'fangsong',
  '-apple-system',
]);

const TYPOGRAPHY_PARTS = [
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
] as const;

/** Only semantic and component tokens reach CSS. Primitives never do. */
export const isPublic = (token: { tier: string }): boolean => token.tier !== 'primitive';

/** "color.text.default" becomes "--doras-color-text-default". Component tokens drop "component". */
export function cssName(path: string[]): string {
  const parts = path[0] === 'component' ? path.slice(1) : path;
  return `--${PREFIX}-${parts.join('-')}`;
}

const round = (n: number): number => Math.round(n * 10000) / 10000;

function cssDimension(path: string[], value: unknown): string {
  const n = px(value);
  if (n === 0) return '0';
  return PX_GROUPS.has(path[0] ?? '') ? `${round(n)}px` : `${round(n / ROOT_FONT_SIZE)}rem`;
}

const cssFamily = (families: string[]): string =>
  families.map((f) => (GENERIC_FAMILIES.has(f) ? f : `'${f.replace(/'/g, "\\'")}'`)).join(', ');

/** The CSS custom properties for one token, as [name, value] pairs. */
export function cssDeclarations(
  token: ResolvedToken,
  byName: Map<string, ResolvedToken>,
): [string, string][] {
  const name = cssName(token.path);
  const alias = aliasOf(token.original);
  const target = alias ? byName.get(alias) : undefined;

  // A reference to another public token stays a reference, so themes flow through.
  if (target && isPublic(target)) {
    const targetName = cssName(target.path);
    if (token.type === 'typography') {
      return TYPOGRAPHY_PARTS.map((part) => [`${name}-${part}`, `var(${targetName}-${part})`]);
    }
    return [[name, `var(${targetName})`]];
  }

  switch (token.type) {
    case 'color':
      return [[name, cssColor(rgba(token.value))]];
    case 'dimension':
      return [[name, cssDimension(token.path, token.value)]];
    case 'duration':
      return [[name, `${ms(token.value)}ms`]];
    case 'cubicBezier':
      return [[name, `cubic-bezier(${cubicBezier(token.value).join(', ')})`]];
    case 'fontFamily':
      return [[name, cssFamily(token.value as string[])]];
    case 'fontWeight':
    case 'number':
      return [[name, String(token.value)]];
    case 'shadow':
      return [
        [
          name,
          shadowLayers(token.value)
            .map(
              (l) =>
                `${l.inset ? 'inset ' : ''}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${cssColor(l.color)}`,
            )
            .join(', '),
        ],
      ];
    case 'typography': {
      const t = textStyle(token.value);
      const size = { value: t.fontSize, unit: 'px' };
      const spacing = { value: t.letterSpacing, unit: 'px' };
      return [
        [`${name}-font-family`, cssFamily(t.fontFamily)],
        [`${name}-font-size`, cssDimension(token.path, size)],
        [`${name}-font-weight`, String(t.fontWeight)],
        [`${name}-line-height`, String(t.lineHeight)],
        [`${name}-letter-spacing`, cssDimension(token.path, spacing)],
      ];
    }
    default:
      throw new Error(`No CSS format for ${token.type} (${token.name})`);
  }
}

/** Theme names in CSS: "lightHighContrast" becomes "light-high-contrast". */
export const cssThemeName = (theme: string): string =>
  theme.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

const block = (selector: string, lines: string[], indent = ''): string =>
  `${indent}${selector} {\n${lines.map((l) => `${indent}  ${l}`).join('\n')}\n${indent}}`;

const decl = ([name, value]: [string, string]): string => `${name}: ${value};`;

/** Builds doras.css from every resolved theme. */
export function renderCss(themes: Map<string, ResolvedToken[]>, defaultTheme = 'light'): string {
  const declarations = new Map<string, Map<string, string>>();
  for (const [theme, tokens] of themes) {
    const byName = new Map(tokens.map((t) => [t.name, t]));
    const map = new Map<string, string>();
    for (const token of tokens.filter(isPublic)) {
      for (const [name, value] of cssDeclarations(token, byName)) map.set(name, value);
    }
    declarations.set(theme, map);
  }

  const base = declarations.get(defaultTheme);
  if (!base) throw new Error(`No ${defaultTheme} theme`);
  const names = [...base.keys()];
  // A token is themed if any theme gives it a different value.
  const themed = names.filter((n) =>
    [...declarations.values()].some((map) => map.get(n) !== base.get(n)),
  );
  const themedSet = new Set(themed);
  const forTheme = (theme: string): string[] =>
    themed.map((n) => decl([n, declarations.get(theme)?.get(n) ?? '']));
  const scheme = (theme: string): string =>
    `color-scheme: ${theme.startsWith('dark') ? 'dark' : 'light'};`;

  const defaultTokens = themes.get(defaultTheme) ?? [];
  const forced = defaultTokens.filter(isPublic).flatMap((token): [string, string][] => {
    const system = (token.extensions?.['org.doras'] as { forcedColor?: string } | undefined)
      ?.forcedColor;
    if (system) return [[cssName(token.path), system]];
    if (token.type === 'shadow') return [[cssName(token.path), 'none']];
    return [];
  });
  const durations = defaultTokens
    .filter((t) => isPublic(t) && t.type === 'duration')
    .map((t): [string, string] => [cssName(t.path), '0ms']);

  const unthemed = names.filter((n) => !themedSet.has(n)).map((n) => decl([n, base.get(n) ?? '']));
  const auto = ':root:not([data-doras-theme])';
  const everywhere = ':root:not([data-doras-theme]), [data-doras-theme]';
  const parts = [
    '/* Generated by @doras/tokens from src/doras.resolver.json. Do not edit. */',
    '',
    '/* Tokens that are the same in every theme, and the default theme. */',
    block(':root', [scheme(defaultTheme), ...unthemed, ...forTheme(defaultTheme)]),
    '',
    '/* The system settings choose a theme, unless data-doras-theme sets one. */',
    `@media (prefers-color-scheme: dark) {\n${block(auto, [scheme('dark'), ...forTheme('dark')], '  ')}\n}`,
    '',
    `@media (prefers-contrast: more) {\n${block(auto, forTheme('lightHighContrast'), '  ')}\n}`,
    '',
    `@media (prefers-color-scheme: dark) and (prefers-contrast: more) {\n${block(auto, [scheme('darkHighContrast'), ...forTheme('darkHighContrast')], '  ')}\n}`,
    '',
    '/* data-doras-theme sets a theme on any element and everything inside it. */',
    ...[...themes.keys()].flatMap((theme) => [
      block(`[data-doras-theme='${cssThemeName(theme)}']`, [scheme(theme), ...forTheme(theme)]),
      '',
    ]),
    '/* Windows forced colours: system colours, and no shadows. */',
    `@media (forced-colors: active) {\n${block(everywhere, forced.map(decl), '  ')}\n}`,
    '',
    '/* Reduced motion: every duration becomes 0. */',
    `@media (prefers-reduced-motion: reduce) {\n${block(everywhere, durations.map(decl), '  ')}\n}`,
    '',
    "/* data-doras-motion='reduce' asks for reduced motion on any element, as the system setting does. */",
    block(`[data-doras-motion='reduce']`, durations.map(decl)),
    '',
  ];
  return parts.join('\n');
}
