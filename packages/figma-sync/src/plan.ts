// Turns tokens.json into a sync plan: the Figma variable collections, text
// styles and effect styles to create or update. Pure data, so it can be
// tested without Figma.
import type { DocToken, DocTokens } from '../../tokens/build/docs.ts';

export type FigmaType = 'COLOR' | 'FLOAT' | 'STRING';
export type Platform = 'WEB' | 'iOS' | 'ANDROID';

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** A reference to another variable in the plan. */
export interface VariableRef {
  collection: string;
  name: string;
}

/** A font family list. The sync uses the first family Figma has, or the fallback. */
export interface FontFamilies {
  fontFamilies: string[];
  fallback: string;
}

export type PlanValue = Rgba | number | string | FontFamilies | { alias: VariableRef };

export interface PlanVariable {
  name: string;
  /** The token it comes from, such as "color.text.default". */
  token: string;
  type: FigmaType;
  description: string;
  scopes: string[];
  codeSyntax: Partial<Record<Platform, string>>;
  /** Mode name to value. */
  values: Record<string, PlanValue>;
}

export interface PlanCollection {
  name: string;
  modes: string[];
  hiddenFromPublishing: boolean;
  variables: PlanVariable[];
}

export interface PlanTextStyle {
  name: string;
  description: string;
  fontFamilies: string[];
  fallbackFamily: string;
  fontWeight: number;
  fontSize: number;
  /** In px. */
  lineHeight: number;
  /** In px. */
  letterSpacing: number;
  bindings: {
    fontFamily: VariableRef;
    fontSize: VariableRef;
    lineHeight: VariableRef;
    letterSpacing: VariableRef;
  };
}

export interface PlanShadowLayer {
  color: Rgba;
  x: number;
  y: number;
  blur: number;
  spread: number;
  colorVariable: VariableRef;
}

export interface PlanEffectStyle {
  name: string;
  description: string;
  layers: PlanShadowLayer[];
}

export interface Plan {
  version: 1;
  collections: PlanCollection[];
  textStyles: PlanTextStyle[];
  effectStyles: PlanEffectStyle[];
}

export const COLLECTIONS = {
  primitives: 'Primitives',
  theme: 'Theme',
  scale: 'Scale',
  typography: 'Typography',
  motion: 'Motion',
  components: 'Components',
} as const;

const SINGLE_MODE = 'Value';

/** Figma mode names for the token themes. */
export const modeName = (theme: string): string =>
  ({
    light: 'Light',
    lightHighContrast: 'Light high contrast',
    dark: 'Dark',
    darkHighContrast: 'Dark high contrast',
  })[theme] ?? theme;

/** Figma has no "ui-monospace": if no family in a list is available, use these. */
const FALLBACK_FAMILY: Record<string, string> = { sans: 'Inter', mono: 'Roboto Mono' };

const TYPE_PARTS = [
  ['font-family', 'fontFamily'],
  ['font-size', 'fontSize'],
  ['font-weight', 'fontWeight'],
  ['line-height', 'lineHeight'],
  ['letter-spacing', 'letterSpacing'],
] as const;

interface DimensionValue {
  value: number;
  unit: 'px' | 'rem';
}
const px = (v: unknown): number => {
  const d = v as DimensionValue;
  return d.unit === 'rem' ? d.value * 16 : d.value;
};
const ms = (v: unknown): number => {
  const d = v as { value: number; unit: 'ms' | 's' };
  return d.unit === 's' ? d.value * 1000 : d.value;
};
function rgba(v: unknown): Rgba {
  const c = v as { components: [number, number, number]; alpha?: number };
  const [r, g, b] = c.components;
  return { r, g, b, a: c.alpha ?? 1 };
}
const refName = (original: unknown): string | undefined => {
  if (typeof original !== 'string') return undefined;
  return /^\{([^{}]+)\}$/.exec(original)?.[1];
};

/** The Figma variable name for a token: its path, without "primitive" or "component". */
const figmaName = (token: { name: string; tier: string }): string => {
  const parts = token.name.split('.');
  return (token.tier === 'semantic' ? parts : parts.slice(1)).join('/');
};

/** Which pickers a colour appears in, from what it's for. */
function colourScopes(name: string): string[] {
  const parts = name.split('/');
  const last = parts[parts.length - 1] ?? '';
  const group = parts[0] === 'color' ? parts[1] : undefined;
  if (last.startsWith('surface') || group === 'surface') return ['FRAME_FILL', 'SHAPE_FILL'];
  if (last.startsWith('decoration')) return ['TEXT_FILL', 'STROKE_COLOR'];
  if (last.startsWith('border') || group === 'border') return ['STROKE_COLOR'];
  if (last === 'icon' || group === 'icon') return ['SHAPE_FILL', 'STROKE_COLOR'];
  if (last === 'text' || group === 'text') return ['TEXT_FILL'];
  throw new Error(`No scope rule for the colour ${name}`);
}

/** Which pickers a dimension appears in. */
function dimensionScopes(name: string): string[] {
  const parts = name.split('/');
  const head = parts[0] ?? '';
  const last = parts[parts.length - 1] ?? '';
  if (head === 'space' || last.startsWith('padding')) return ['GAP'];
  if (head === 'size' || head === 'breakpoint' || last.endsWith('height')) return ['WIDTH_HEIGHT'];
  if (head === 'radius' || last === 'radius') return ['CORNER_RADIUS'];
  if (head === 'border-width' || last === 'border-width') return ['STROKE_FLOAT'];
  // Focus offset has no Figma property: Dev Mode shows it, pickers don't.
  return [];
}

const TYPE_SCOPES: Record<string, string[]> = {
  'font-family': ['FONT_FAMILY'],
  'font-size': ['FONT_SIZE'],
  'font-weight': ['FONT_WEIGHT'],
  'line-height': ['LINE_HEIGHT'],
  'letter-spacing': ['LETTER_SPACING'],
};

function codeSyntax(
  token: DocToken,
  part?: { css: string; mobile: string },
): PlanVariable['codeSyntax'] {
  if (!token.code) return {};
  if (!part) return { WEB: token.code.web, iOS: token.code.ios, ANDROID: token.code.android };
  const web = token.code.web.replace(/\)$/, `-${part.css})`);
  return {
    WEB: web,
    iOS: `${token.code.ios}.${part.mobile}`,
    ANDROID: `${token.code.android}.${part.mobile}`,
  };
}

export function buildPlan(docs: DocTokens): Plan {
  const themes = docs.themes;
  const modes = themes.map(modeName);
  const byName = new Map(docs.tokens.map((t) => [t.name, t]));
  const first = (t: DocToken): DocTokens['tokens'][number]['values'][string] => {
    const v = t.values[docs.defaultTheme];
    if (!v) throw new Error(`${t.name} has no ${docs.defaultTheme} value`);
    return v;
  };

  const collections = new Map<string, PlanCollection>([
    [
      COLLECTIONS.primitives,
      {
        name: COLLECTIONS.primitives,
        modes: [SINGLE_MODE],
        hiddenFromPublishing: true,
        variables: [],
      },
    ],
    [
      COLLECTIONS.theme,
      { name: COLLECTIONS.theme, modes, hiddenFromPublishing: false, variables: [] },
    ],
    [
      COLLECTIONS.scale,
      { name: COLLECTIONS.scale, modes: [SINGLE_MODE], hiddenFromPublishing: false, variables: [] },
    ],
    [
      COLLECTIONS.typography,
      {
        name: COLLECTIONS.typography,
        modes: [SINGLE_MODE],
        hiddenFromPublishing: false,
        variables: [],
      },
    ],
    [
      COLLECTIONS.motion,
      {
        name: COLLECTIONS.motion,
        modes: [SINGLE_MODE],
        hiddenFromPublishing: false,
        variables: [],
      },
    ],
    [
      COLLECTIONS.components,
      {
        name: COLLECTIONS.components,
        modes: [SINGLE_MODE],
        hiddenFromPublishing: false,
        variables: [],
      },
    ],
  ]);
  const add = (collection: string, variable: PlanVariable): void => {
    collections.get(collection)?.variables.push(variable);
  };

  /** Where each token, or each part of a type style, ended up: for aliases. */
  const where = new Map<string, VariableRef>();
  const textStyles: PlanTextStyle[] = [];
  const effectStyles: PlanEffectStyle[] = [];

  const aliasOrValue = (original: unknown, fallback: PlanValue): PlanValue => {
    const target = refName(original);
    const ref = target ? where.get(target) : undefined;
    return ref ? { alias: ref } : fallback;
  };

  // Primitives first, so semantic tokens can refer to them.
  for (const t of docs.tokens.filter((x) => x.tier === 'primitive')) {
    const name = figmaName(t);
    const v = first(t);
    const base = {
      name,
      token: t.name,
      description: t.description ?? '',
      scopes: [],
      codeSyntax: {},
    };
    let variable: PlanVariable;
    switch (t.type) {
      case 'color':
        variable = { ...base, type: 'COLOR', values: { [SINGLE_MODE]: rgba(v.value) } };
        break;
      case 'dimension':
        variable = { ...base, type: 'FLOAT', values: { [SINGLE_MODE]: px(v.value) } };
        break;
      case 'fontWeight':
      case 'number':
        variable = { ...base, type: 'FLOAT', values: { [SINGLE_MODE]: Number(v.value) } };
        break;
      case 'duration':
        variable = {
          ...base,
          type: 'FLOAT',
          description: `${base.description} In ms.`.trim(),
          values: { [SINGLE_MODE]: ms(v.value) },
        };
        break;
      case 'cubicBezier':
        variable = {
          ...base,
          type: 'STRING',
          values: { [SINGLE_MODE]: `cubic-bezier(${(v.value as number[]).join(', ')})` },
        };
        break;
      case 'fontFamily': {
        const key = t.name.split('.').pop() ?? '';
        const families = v.value as string[];
        variable = {
          ...base,
          type: 'STRING',
          description: `${base.description} Fallbacks in code: ${families.join(', ')}.`.trim(),
          values: {
            [SINGLE_MODE]: { fontFamilies: families, fallback: FALLBACK_FAMILY[key] ?? 'Inter' },
          },
        };
        break;
      }
      default:
        throw new Error(`No Figma variable type for the primitive ${t.name} (${t.type})`);
    }
    add(COLLECTIONS.primitives, variable);
    where.set(t.name, { collection: COLLECTIONS.primitives, name });
  }

  // Semantic tokens.
  for (const t of docs.tokens.filter((x) => x.tier === 'semantic')) {
    const name = figmaName(t);
    const description = t.description ?? '';
    if (t.type === 'color') {
      const values: Record<string, PlanValue> = {};
      for (const theme of themes) {
        const v = t.values[theme];
        if (v) values[modeName(theme)] = aliasOrValue(v.original, rgba(v.value));
      }
      add(COLLECTIONS.theme, {
        name,
        token: t.name,
        type: 'COLOR',
        description,
        scopes: colourScopes(name),
        codeSyntax: codeSyntax(t),
        values,
      });
      where.set(t.name, { collection: COLLECTIONS.theme, name });
    } else if (t.type === 'shadow') {
      // Each layer's colour becomes a themed variable; the effect style binds to them.
      const layersByTheme = themes.map((theme) => ({
        mode: modeName(theme),
        value: t.values[theme]?.value as Record<string, unknown>[],
        original: t.values[theme]?.original as Record<string, unknown>[],
      }));
      const count = layersByTheme[0]?.value.length ?? 0;
      const layers: PlanShadowLayer[] = [];
      for (let i = 0; i < count; i++) {
        const layerName = `${name}/layer-${i + 1}`;
        const values: Record<string, PlanValue> = {};
        for (const { mode, value, original } of layersByTheme) {
          values[mode] = aliasOrValue(original[i]?.['color'], rgba(value[i]?.['color']));
        }
        add(COLLECTIONS.theme, {
          name: layerName,
          token: t.name,
          type: 'COLOR',
          description: `The colour of layer ${i + 1} of the ${t.name} shadow.`,
          scopes: ['EFFECT_COLOR'],
          codeSyntax: {},
          values,
        });
        const light = layersByTheme[0]?.value[i] ?? {};
        layers.push({
          color: rgba(light['color']),
          x: px(light['offsetX']),
          y: px(light['offsetY']),
          blur: px(light['blur']),
          spread: px(light['spread']),
          colorVariable: { collection: COLLECTIONS.theme, name: layerName },
        });
      }
      effectStyles.push({
        name,
        description:
          `${description} Code: ${t.code?.web ?? ''}. Its colours follow the Theme mode.`.trim(),
        layers,
      });
    } else if (t.type === 'dimension') {
      const v = first(t);
      add(COLLECTIONS.scale, {
        name,
        token: t.name,
        type: 'FLOAT',
        description,
        scopes: dimensionScopes(name),
        codeSyntax: codeSyntax(t),
        values: { [SINGLE_MODE]: aliasOrValue(v.original, px(v.value)) },
      });
      where.set(t.name, { collection: COLLECTIONS.scale, name });
    } else if (t.type === 'duration' || t.type === 'cubicBezier') {
      const v = first(t);
      const raw =
        t.type === 'duration' ? ms(v.value) : `cubic-bezier(${(v.value as number[]).join(', ')})`;
      add(COLLECTIONS.motion, {
        name,
        token: t.name,
        type: t.type === 'duration' ? 'FLOAT' : 'STRING',
        description: t.type === 'duration' ? `${description} In ms.`.trim() : description,
        scopes: [],
        codeSyntax: codeSyntax(t),
        values: { [SINGLE_MODE]: aliasOrValue(v.original, raw) },
      });
      where.set(t.name, { collection: COLLECTIONS.motion, name });
    } else if (t.type === 'typography') {
      const v = first(t);
      const value = v.value as Record<string, unknown>;
      const original = v.original as Record<string, unknown>;
      const size = px(value['fontSize']);
      const refs: Partial<Record<string, VariableRef>> = {};
      for (const [part, key] of TYPE_PARTS) {
        const partName = `${name}/${part}`;
        let raw: PlanValue;
        let type: FigmaType = 'FLOAT';
        let partValue: PlanValue;
        if (part === 'line-height') {
          // Figma line heights are in px, so this one is worked out, not referenced.
          raw = Math.round(size * Number(value['lineHeight']) * 100) / 100;
          partValue = raw;
        } else {
          if (part === 'font-family') {
            type = 'STRING';
            const families = value['fontFamily'] as string[];
            raw = families[0] ?? 'Inter';
          } else if (part === 'font-weight') {
            raw = Number(value['fontWeight']);
          } else {
            raw = px(value[key]);
          }
          partValue = aliasOrValue(original[key], raw);
        }
        add(COLLECTIONS.typography, {
          name: partName,
          token: t.name,
          type,
          description:
            part === 'line-height'
              ? `${description} In px: the font size times ${String(value['lineHeight'])}.`.trim()
              : description,
          scopes: TYPE_SCOPES[part] ?? [],
          codeSyntax: codeSyntax(t, { css: part, mobile: key }),
          values: { [SINGLE_MODE]: partValue },
        });
        refs[part] = { collection: COLLECTIONS.typography, name: partName };
        where.set(`${t.name}#${part}`, { collection: COLLECTIONS.typography, name: partName });
      }
      const familyToken = refName(original['fontFamily']);
      const familyKey = familyToken?.split('.').pop() ?? 'sans';
      textStyles.push({
        name,
        description: `${description} Code: ${t.code?.web.replace(/\)$/, '-*)') ?? ''}`.trim(),
        fontFamilies: value['fontFamily'] as string[],
        fallbackFamily: FALLBACK_FAMILY[familyKey] ?? 'Inter',
        fontWeight: Number(value['fontWeight']),
        fontSize: size,
        lineHeight: Math.round(size * Number(value['lineHeight']) * 100) / 100,
        letterSpacing: px(value['letterSpacing']),
        bindings: {
          fontFamily: refs['font-family'] as VariableRef,
          fontSize: refs['font-size'] as VariableRef,
          lineHeight: refs['line-height'] as VariableRef,
          letterSpacing: refs['letter-spacing'] as VariableRef,
        },
      });
    } else {
      throw new Error(`No Figma mapping for the semantic token ${t.name} (${t.type})`);
    }
  }

  // Component tokens refer to semantic tokens.
  for (const t of docs.tokens.filter((x) => x.tier === 'component')) {
    const name = figmaName(t);
    const v = first(t);
    const target = v.aliasOf ? byName.get(v.aliasOf) : undefined;
    if (!target) throw new Error(`${t.name} must refer to a semantic token`);
    if (t.type === 'typography') {
      for (const [part, key] of TYPE_PARTS) {
        const ref = where.get(`${target.name}#${part}`);
        if (!ref) throw new Error(`No ${part} for ${target.name}`);
        add(COLLECTIONS.components, {
          name: `${name}/${part}`,
          token: t.name,
          type: part === 'font-family' ? 'STRING' : 'FLOAT',
          description: t.description ?? '',
          scopes: TYPE_SCOPES[part] ?? [],
          codeSyntax: codeSyntax(t, { css: part, mobile: key }),
          values: { [SINGLE_MODE]: { alias: ref } },
        });
      }
      continue;
    }
    const ref = where.get(target.name);
    if (!ref) throw new Error(`${t.name} refers to ${target.name}, which isn't in Figma`);
    const type: FigmaType = t.type === 'color' ? 'COLOR' : 'FLOAT';
    add(COLLECTIONS.components, {
      name,
      token: t.name,
      type,
      description: t.description ?? '',
      scopes: type === 'COLOR' ? colourScopes(name) : dimensionScopes(name),
      codeSyntax: codeSyntax(t),
      values: { [SINGLE_MODE]: { alias: ref } },
    });
  }

  return { version: 1, collections: [...collections.values()], textStyles, effectStyles };
}
