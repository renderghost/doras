// Token values for email (#17). Email apps don't support CSS custom
// properties, so emails use each token's resolved value: light by default,
// and dark for the email apps that follow the system's dark mode.
import tokens from '@doras/tokens/tokens.json' with { type: 'json' };

type Theme = 'light' | 'dark';
interface Dimension {
  value: number;
  unit: string;
}
interface Typography {
  fontFamily: string[];
  fontSize: Dimension;
  fontWeight: number;
  letterSpacing: Dimension;
  lineHeight: number;
}

const byName = new Map(tokens.tokens.map((t) => [t.name, t]));

function value(name: string, theme: Theme = 'light'): unknown {
  const token = byName.get(name);
  if (!token) throw new Error(`No token ${name}`);
  return (token.values as Record<string, { value: unknown }>)[theme]?.value;
}

/** A colour token, as hex. */
export const colour = (name: string, theme: Theme = 'light'): string =>
  (value(`color.${name}`, theme) as { hex: string }).hex;

/** A dimension token, in pixels: email apps handle px best. */
export const px = (name: string): string => {
  const d = value(name) as Dimension;
  return `${d.value}${d.unit}`;
};

/** A type token as inline CSS. Fonts aren't loaded: the stack falls back to the system's. */
export function type(name: string): string {
  const t = value(`type.${name}`) as Typography;
  const family = t.fontFamily.map((f) => (/\s/.test(f) ? `'${f}'` : f)).join(', ');
  return [
    `font-family:${family}`,
    `font-size:${t.fontSize.value}${t.fontSize.unit}`,
    `font-weight:${t.fontWeight}`,
    `line-height:${t.lineHeight}`,
    `letter-spacing:${t.letterSpacing.value}${t.letterSpacing.unit}`,
  ].join(';');
}

/** One type token's single property, for MJML attributes. */
export function typeValue(name: string): Typography {
  return value(`type.${name}`) as Typography;
}

/** Every colour the emails use, in both schemes. */
const NAMES = [
  'surface.subtle',
  'surface.raised',
  'border.default',
  'text.default',
  'text.subtle',
  'link.text',
  'action.primary.surface',
  'action.primary.border',
  'action.primary.text',
] as const;
export type ColourName = (typeof NAMES)[number];

export const palette = (theme: Theme): Record<ColourName, string> =>
  Object.fromEntries(NAMES.map((n) => [n, colour(n, theme)])) as Record<ColourName, string>;
