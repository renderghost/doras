// Applies a sync plan to the open Figma file. Runs inside Figma, as a plugin
// or through the Figma MCP server, so it uses only the Plugin API passed in.
// It creates or updates everything by name, so running it again updates in
// place and never duplicates. It never deletes: variables in Doras's
// collections that the plan no longer has are listed in the report instead.
import type { FontFamilies, Plan, PlanCollection, PlanValue, Rgba, VariableRef } from './plan.ts';

// The parts of the Figma Plugin API this uses.
interface FigmaMode {
  modeId: string;
  name: string;
}
interface FigmaCollection {
  id: string;
  name: string;
  modes: FigmaMode[];
  hiddenFromPublishing: boolean;
  addMode(name: string): string;
  renameMode(modeId: string, name: string): void;
}
interface FigmaVariable {
  id: string;
  name: string;
  variableCollectionId: string;
  resolvedType: string;
  description: string;
  scopes: string[];
  setValueForMode(modeId: string, value: unknown): void;
  setVariableCodeSyntax(platform: string, value: string): void;
}
interface FontName {
  family: string;
  style: string;
}
interface FigmaTextStyle {
  id: string;
  name: string;
  description: string;
  fontName: FontName;
  fontSize: number;
  lineHeight: unknown;
  letterSpacing: unknown;
  setBoundVariable(field: string, variable: FigmaVariable | null): void;
}
interface FigmaEffectStyle {
  id: string;
  name: string;
  description: string;
  effects: readonly unknown[];
}
export interface FigmaLike {
  variables: {
    getLocalVariableCollectionsAsync(): Promise<FigmaCollection[]>;
    getLocalVariablesAsync(): Promise<FigmaVariable[]>;
    createVariableCollection(name: string): FigmaCollection;
    createVariable(name: string, collection: FigmaCollection, type: string): FigmaVariable;
    createVariableAlias(variable: FigmaVariable): unknown;
    setBoundVariableForEffect(effect: unknown, field: string, variable: FigmaVariable): unknown;
  };
  listAvailableFontsAsync(): Promise<{ fontName: FontName }[]>;
  loadFontAsync(font: FontName): Promise<void>;
  getLocalTextStylesAsync(): Promise<FigmaTextStyle[]>;
  getLocalEffectStylesAsync(): Promise<FigmaEffectStyle[]>;
  createTextStyle(): FigmaTextStyle;
  createEffectStyle(): FigmaEffectStyle;
}

export interface SyncReport {
  collections: { created: string[]; updated: string[] };
  variables: { created: number; updated: number };
  textStyles: { created: number; updated: number };
  effectStyles: { created: number; updated: number };
  /** Families used where the token's own family isn't available in Figma. */
  fontSubstitutions: string[];
  /** Variables in Doras's collections that the tokens no longer have. Not deleted. */
  notInTokens: string[];
}

/** Inter's named styles, by weight. Weights between them round to the nearest. */
const STYLE_BY_WEIGHT: [number, string][] = [
  [100, 'Thin'],
  [200, 'Extra Light'],
  [300, 'Light'],
  [400, 'Regular'],
  [500, 'Medium'],
  [600, 'Semi Bold'],
  [700, 'Bold'],
  [800, 'Extra Bold'],
  [900, 'Black'],
];

/** Font families name styles differently, such as "Semi Bold" and "SemiBold". */
const normalise = (style: string): string => style.replace(/\s+/g, '').toLowerCase();

function nearestStyle(weight: number, available: string[]): string {
  const ranked = [...STYLE_BY_WEIGHT].sort(
    (a, b) => Math.abs(a[0] - weight) - Math.abs(b[0] - weight) || a[0] - b[0],
  );
  for (const [, style] of ranked) {
    const match = available.find((s) => normalise(s) === normalise(style));
    if (match) return match;
  }
  return available[0] ?? 'Regular';
}

const isAlias = (v: PlanValue): v is { alias: VariableRef } =>
  typeof v === 'object' && v !== null && 'alias' in v;
const isFamilies = (v: PlanValue): v is FontFamilies =>
  typeof v === 'object' && v !== null && 'fontFamilies' in v;
const key = (ref: VariableRef): string => `${ref.collection}::${ref.name}`;

export async function applyPlan(plan: Plan, figma: FigmaLike): Promise<SyncReport> {
  const report: SyncReport = {
    collections: { created: [], updated: [] },
    variables: { created: 0, updated: 0 },
    textStyles: { created: 0, updated: 0 },
    effectStyles: { created: 0, updated: 0 },
    fontSubstitutions: [],
    notInTokens: [],
  };

  // Fonts available in this file, by family.
  const stylesByFamily = new Map<string, string[]>();
  for (const { fontName } of await figma.listAvailableFontsAsync()) {
    const list = stylesByFamily.get(fontName.family) ?? [];
    list.push(fontName.style);
    stylesByFamily.set(fontName.family, list);
  }
  const pickFamily = (families: string[], fallback: string, what: string): string => {
    for (const f of families) if (stylesByFamily.has(f)) return f;
    const note = `${what}: ${fallback} instead of ${families.join(', ')}`;
    if (report.fontSubstitutions.indexOf(note) < 0) report.fontSubstitutions.push(note);
    return fallback;
  };

  // 1. Collections and modes.
  const existingCollections = await figma.variables.getLocalVariableCollectionsAsync();
  const collections = new Map<string, { figma: FigmaCollection; modes: Map<string, string> }>();
  for (const planned of plan.collections) {
    let collection = existingCollections.find((c) => c.name === planned.name);
    if (collection) report.collections.updated.push(planned.name);
    else {
      collection = figma.variables.createVariableCollection(planned.name);
      report.collections.created.push(planned.name);
    }
    collection.hiddenFromPublishing = planned.hiddenFromPublishing;
    collections.set(planned.name, { figma: collection, modes: ensureModes(collection, planned) });
  }

  // 2. Variables: create or find every one first, so aliases can point anywhere.
  const existing = await figma.variables.getLocalVariablesAsync();
  const variables = new Map<string, FigmaVariable>();
  const planned = new Set<string>();
  for (const pc of plan.collections) {
    const target = collections.get(pc.name);
    if (!target) continue;
    for (const pv of pc.variables) {
      planned.add(key({ collection: pc.name, name: pv.name }));
      let variable = existing.find(
        (v) => v.variableCollectionId === target.figma.id && v.name === pv.name,
      );
      if (variable && variable.resolvedType !== pv.type) {
        throw new Error(
          `${pc.name}/${pv.name} is a ${variable.resolvedType} in Figma but a ${pv.type} in the tokens. Rename or remove it in Figma, then sync again.`,
        );
      }
      if (variable) report.variables.updated++;
      else {
        variable = figma.variables.createVariable(pv.name, target.figma, pv.type);
        report.variables.created++;
      }
      variables.set(key({ collection: pc.name, name: pv.name }), variable);
    }
  }
  for (const v of existing) {
    const collection = [...collections.entries()].find(
      ([, c]) => c.figma.id === v.variableCollectionId,
    );
    if (collection && !planned.has(key({ collection: collection[0], name: v.name }))) {
      report.notInTokens.push(`${collection[0]}/${v.name}`);
    }
  }

  // 3. Values, scopes, descriptions and code syntax.
  for (const pc of plan.collections) {
    const target = collections.get(pc.name);
    if (!target) continue;
    for (const pv of pc.variables) {
      const variable = variables.get(key({ collection: pc.name, name: pv.name }));
      if (!variable) continue;
      variable.description = pv.description;
      variable.scopes = pv.scopes;
      for (const platform of ['WEB', 'iOS', 'ANDROID'] as const) {
        const syntax = pv.codeSyntax[platform];
        if (syntax) variable.setVariableCodeSyntax(platform, syntax);
      }
      for (const [mode, value] of Object.entries(pv.values)) {
        const modeId = target.modes.get(mode);
        if (!modeId) throw new Error(`${pc.name} has no ${mode} mode`);
        variable.setValueForMode(modeId, toFigmaValue(value, pv.name));
      }
    }
  }

  /**
   * A variable by collection and name: one this run created or updated, or
   * one already in Figma, so a plan can be applied a collection at a time.
   */
  function findVariable(ref: VariableRef): FigmaVariable | undefined {
    const known = variables.get(key(ref));
    if (known) return known;
    const collection = existingCollections.find((c) => c.name === ref.collection);
    return collection
      ? existing.find((v) => v.variableCollectionId === collection.id && v.name === ref.name)
      : undefined;
  }

  function toFigmaValue(value: PlanValue, name: string): unknown {
    if (isAlias(value)) {
      const target = findVariable(value.alias);
      if (!target) throw new Error(`${name} refers to ${key(value.alias)}, which doesn't exist`);
      return figma.variables.createVariableAlias(target);
    }
    if (isFamilies(value)) return pickFamily(value.fontFamilies, value.fallback, name);
    return value;
  }

  // 4. Text styles, bound to the typography variables.
  const textStyles = await figma.getLocalTextStylesAsync();
  for (const ts of plan.textStyles) {
    const family = pickFamily(ts.fontFamilies, ts.fallbackFamily, ts.name);
    const style = nearestStyle(ts.fontWeight, stylesByFamily.get(family) ?? ['Regular']);
    await figma.loadFontAsync({ family, style });
    let textStyle = textStyles.find((s) => s.name === ts.name);
    if (textStyle) report.textStyles.updated++;
    else {
      textStyle = figma.createTextStyle();
      textStyle.name = ts.name;
      report.textStyles.created++;
    }
    textStyle.description = ts.description;
    textStyle.fontName = { family, style };
    textStyle.fontSize = ts.fontSize;
    textStyle.lineHeight = { unit: 'PIXELS', value: ts.lineHeight };
    textStyle.letterSpacing = { unit: 'PIXELS', value: ts.letterSpacing };
    for (const field of ['fontFamily', 'fontSize', 'lineHeight', 'letterSpacing'] as const) {
      const variable = findVariable(ts.bindings[field]);
      if (variable) textStyle.setBoundVariable(field, variable);
    }
  }

  // 5. Effect styles, with each shadow colour bound to its themed variable.
  const effectStyles = await figma.getLocalEffectStylesAsync();
  for (const es of plan.effectStyles) {
    let effectStyle = effectStyles.find((s) => s.name === es.name);
    if (effectStyle) report.effectStyles.updated++;
    else {
      effectStyle = figma.createEffectStyle();
      effectStyle.name = es.name;
      report.effectStyles.created++;
    }
    effectStyle.description = es.description;
    effectStyle.effects = es.layers.map((layer) => {
      const effect = {
        type: 'DROP_SHADOW',
        color: toPaintColor(layer.color),
        offset: { x: layer.x, y: layer.y },
        radius: layer.blur,
        spread: layer.spread,
        visible: true,
        blendMode: 'NORMAL',
        showShadowBehindNode: false,
      };
      const variable = findVariable(layer.colorVariable);
      return variable
        ? figma.variables.setBoundVariableForEffect(effect, 'color', variable)
        : effect;
    });
  }

  return report;
}

const toPaintColor = (c: Rgba): Rgba => ({ r: c.r, g: c.g, b: c.b, a: c.a });

/** Makes the collection's modes match the plan, renaming the first and adding the rest. */
function ensureModes(collection: FigmaCollection, planned: PlanCollection): Map<string, string> {
  const modes = new Map<string, string>();
  planned.modes.forEach((name, i) => {
    let mode = collection.modes.find((m) => m.name === name);
    if (!mode && i === 0 && collection.modes[0]) {
      // A new collection starts with one mode called "Mode 1".
      const firstMode = collection.modes[0];
      if (!planned.modes.includes(firstMode.name)) {
        collection.renameMode(firstMode.modeId, name);
        mode = { modeId: firstMode.modeId, name };
      }
    }
    if (!mode) {
      try {
        mode = { modeId: collection.addMode(name), name };
      } catch (error) {
        throw new Error(
          `Couldn't add the "${name}" mode to ${planned.name}. Figma's Starter plan allows 1 mode per collection, and Professional allows 4. (${String(error)})`,
          { cause: error },
        );
      }
    }
    modes.set(name, mode.modeId);
  });
  return modes;
}
