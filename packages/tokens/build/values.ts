// Shared helpers for reading resolved DTCG 2025.10 values.

export interface Rgba {
  /** Red, green, blue and alpha, each from 0 to 1, in sRGB. */
  r: number;
  g: number;
  b: number;
  a: number;
}

interface ColorValue {
  colorSpace: string;
  components: [number, number, number];
  alpha?: number;
}

interface DimensionValue {
  value: number;
  unit: 'px' | 'rem';
}

interface DurationValue {
  value: number;
  unit: 'ms' | 's';
}

export interface ShadowLayer {
  color: Rgba;
  x: number;
  y: number;
  blur: number;
  spread: number;
  inset: boolean;
}

export interface TextStyle {
  fontFamily: string[];
  /** In px, which is pt on iOS and sp on Android. */
  fontSize: number;
  fontWeight: number;
  /** A multiplier of the font size. */
  lineHeight: number;
  /** In px. */
  letterSpacing: number;
}

const ROOT_FONT_SIZE = 16;

export function rgba(value: unknown): Rgba {
  const color = value as ColorValue;
  if (color.colorSpace !== 'srgb') {
    throw new Error(`Only sRGB colours are supported, not ${color.colorSpace}`);
  }
  const [r, g, b] = color.components;
  return { r, g, b, a: color.alpha ?? 1 };
}

const channel = (x: number): number => Math.round(x * 255);

export const hex = ({ r, g, b }: Rgba): string =>
  '#' + [r, g, b].map((x) => channel(x).toString(16).padStart(2, '0')).join('');

export const cssColor = (c: Rgba): string =>
  c.a === 1 ? hex(c) : `rgb(${channel(c.r)} ${channel(c.g)} ${channel(c.b)} / ${c.a})`;

/** A dimension in px. */
export function px(value: unknown): number {
  const dim = value as DimensionValue;
  return dim.unit === 'rem' ? dim.value * ROOT_FONT_SIZE : dim.value;
}

export function ms(value: unknown): number {
  const duration = value as DurationValue;
  return duration.unit === 's' ? duration.value * 1000 : duration.value;
}

export function shadowLayers(value: unknown): ShadowLayer[] {
  const layers = (Array.isArray(value) ? value : [value]) as Record<string, unknown>[];
  return layers.map((layer) => ({
    color: rgba(layer['color']),
    x: px(layer['offsetX']),
    y: px(layer['offsetY']),
    blur: px(layer['blur']),
    spread: px(layer['spread']),
    inset: layer['inset'] === true,
  }));
}

export function textStyle(value: unknown): TextStyle {
  const t = value as Record<string, unknown>;
  const family = t['fontFamily'];
  return {
    fontFamily: Array.isArray(family) ? (family as string[]) : [String(family)],
    fontSize: px(t['fontSize']),
    fontWeight: Number(t['fontWeight']),
    lineHeight: Number(t['lineHeight']),
    letterSpacing: px(t['letterSpacing']),
  };
}

export const cubicBezier = (value: unknown): [number, number, number, number] =>
  value as [number, number, number, number];

/** The token a value refers to, if it's a single reference such as "{color.text.default}". */
export function aliasOf(original: unknown): string | undefined {
  if (typeof original !== 'string') return undefined;
  const match = /^\{([^{}]+)\}$/.exec(original);
  return match?.[1];
}

/** WCAG 2 relative luminance. */
export function luminance({ r, g, b }: Rgba): number {
  const lin = (c: number): number => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Paints a translucent colour over an opaque one. */
export const over = (top: Rgba, bottom: Rgba): Rgba => ({
  r: top.r * top.a + bottom.r * (1 - top.a),
  g: top.g * top.a + bottom.g * (1 - top.a),
  b: top.b * top.a + bottom.b * (1 - top.a),
  a: 1,
});

/** WCAG 2 contrast ratio. A translucent foreground is painted over the background first. */
export function contrast(foreground: Rgba, background: Rgba): number {
  const fg = foreground.a < 1 ? over(foreground, background) : foreground;
  const [hi, lo] = [luminance(fg), luminance(background)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** "border-width" and "atmosphere-button" become "borderWidth" and "atmosphereButton". */
export const camel = (parts: string[]): string =>
  parts
    .join('-')
    .split(/[-_]/)
    .filter(Boolean)
    .map((word, i) => (i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join('');

export const pascal = (parts: string[]): string => {
  const c = camel(parts);
  return c.charAt(0).toUpperCase() + c.slice(1);
};
