// An in-memory stand-in for the parts of the Figma Plugin API the sync uses,
// so tests can run the sync twice and inspect the result.
import type { FigmaLike } from '../src/apply.ts';

let nextId = 1;
const id = (prefix: string): string => `${prefix}:${nextId++}`;

export class FakeCollection {
  id = id('VariableCollectionId');
  hiddenFromPublishing = false;
  modes: { modeId: string; name: string }[] = [{ modeId: id('mode'), name: 'Mode 1' }];
  constructor(
    public name: string,
    private maxModes: number,
  ) {}
  addMode(name: string): string {
    if (this.modes.length >= this.maxModes)
      throw new Error(`in addMode: Limited to ${this.maxModes} modes only`);
    const modeId = id('mode');
    this.modes.push({ modeId, name });
    return modeId;
  }
  renameMode(modeId: string, name: string): void {
    const mode = this.modes.find((m) => m.modeId === modeId);
    if (mode) mode.name = name;
  }
}

export class FakeVariable {
  id = id('VariableID');
  description = '';
  scopes: string[] = ['ALL_SCOPES'];
  valuesByMode: Record<string, unknown> = {};
  codeSyntax: Record<string, string> = {};
  constructor(
    public name: string,
    public variableCollectionId: string,
    public resolvedType: string,
  ) {}
  setValueForMode(modeId: string, value: unknown): void {
    this.valuesByMode[modeId] = value;
  }
  setVariableCodeSyntax(platform: string, value: string): void {
    this.codeSyntax[platform] = value;
  }
}

export class FakeTextStyle {
  id = id('S');
  name = '';
  description = '';
  fontName = { family: 'Inter', style: 'Regular' };
  fontSize = 12;
  lineHeight: unknown = { unit: 'AUTO' };
  letterSpacing: unknown = { unit: 'PIXELS', value: 0 };
  boundVariables: Record<string, string> = {};
  setBoundVariable(field: string, variable: FakeVariable | null): void {
    if (variable) this.boundVariables[field] = variable.id;
  }
}

export class FakeEffectStyle {
  id = id('S');
  name = '';
  description = '';
  effects: readonly unknown[] = [];
}

export interface FakeFigma extends FigmaLike {
  collections: FakeCollection[];
  allVariables: FakeVariable[];
  textStyles: FakeTextStyle[];
  effectStyles: FakeEffectStyle[];
  loadedFonts: string[];
}

/** A fake Figma. maxModes is 4 on the Professional plan and 1 on Starter. */
export function fakeFigma({ maxModes = 4, fonts = ['Inter', 'Roboto Mono'] } = {}): FakeFigma {
  const collections: FakeCollection[] = [];
  const allVariables: FakeVariable[] = [];
  const textStyles: FakeTextStyle[] = [];
  const effectStyles: FakeEffectStyle[] = [];
  const loadedFonts: string[] = [];
  const styles = ['Regular', 'Medium', 'Semi Bold', 'Bold'];
  const available = fonts.flatMap((family) =>
    styles.map((style) => ({ fontName: { family, style } })),
  );
  return {
    collections,
    allVariables,
    textStyles,
    effectStyles,
    loadedFonts,
    variables: {
      getLocalVariableCollectionsAsync: async () => [...collections],
      getLocalVariablesAsync: async () => [...allVariables],
      createVariableCollection(name) {
        const c = new FakeCollection(name, maxModes);
        collections.push(c);
        return c;
      },
      createVariable(name, collection, type) {
        const v = new FakeVariable(name, collection.id, type);
        allVariables.push(v);
        return v;
      },
      createVariableAlias: (variable) => ({ type: 'VARIABLE_ALIAS', id: variable.id }),
      setBoundVariableForEffect: (effect, field, variable) => ({
        ...(effect as object),
        boundVariables: { [field]: { type: 'VARIABLE_ALIAS', id: variable.id } },
      }),
    },
    listAvailableFontsAsync: async () => available,
    loadFontAsync: async (font) => {
      if (
        !available.some((f) => f.fontName.family === font.family && f.fontName.style === font.style)
      ) {
        throw new Error(`Font ${font.family} ${font.style} not available`);
      }
      loadedFonts.push(`${font.family} ${font.style}`);
    },
    getLocalTextStylesAsync: async () => [...textStyles],
    getLocalEffectStylesAsync: async () => [...effectStyles],
    createTextStyle() {
      const s = new FakeTextStyle();
      textStyles.push(s);
      return s;
    },
    createEffectStyle() {
      const s = new FakeEffectStyle();
      effectStyles.push(s);
      return s;
    },
  };
}
