// The sync plan, and applying it to a fake Figma: once, twice, and in parts.
import { beforeAll, describe, expect, it } from 'vitest';
import { renderDocs, type DocTokens } from '../../tokens/build/docs.ts';
import { resolveAll } from '../../tokens/build/resolve.ts';
import { applierJs, splitPlan } from '../build/index.ts';
import { applyPlan } from '../src/apply.ts';
import { buildPlan, COLLECTIONS, type Plan, type PlanVariable } from '../src/plan.ts';
import { fakeFigma, type FakeFigma } from './fake-figma.ts';

let docs: DocTokens;
let plan: Plan;
beforeAll(async () => {
  docs = renderDocs(await resolveAll());
  plan = buildPlan(docs);
});

const collection = (name: string) => plan.collections.find((c) => c.name === name);
const allVariables = (): PlanVariable[] => plan.collections.flatMap((c) => c.variables);

describe('the plan', () => {
  it('has the six collections, with four theme modes', () => {
    expect(plan.collections.map((c) => c.name)).toEqual(Object.values(COLLECTIONS));
    expect(collection('Theme')?.modes).toEqual([
      'Light',
      'Light high contrast',
      'Dark',
      'Dark high contrast',
    ]);
    for (const c of plan.collections.filter((x) => x.name !== 'Theme'))
      expect(c.modes).toEqual(['Value']);
  });

  it('hides primitives from publishing and from every picker', () => {
    expect(collection('Primitives')?.hiddenFromPublishing).toBe(true);
    for (const v of collection('Primitives')?.variables ?? []) expect(v.scopes, v.name).toEqual([]);
  });

  it('has every semantic and component token', () => {
    const tokens = new Set(allVariables().map((v) => v.token));
    for (const t of docs.tokens.filter((x) => x.tier !== 'primitive'))
      expect(tokens.has(t.name), t.name).toBe(true);
  });

  it('never leaves a variable on ALL_SCOPES, and scopes every non-primitive colour', () => {
    for (const v of allVariables()) expect(v.scopes, v.name).not.toContain('ALL_SCOPES');
    const colours = plan.collections
      .filter((c) => c.name !== 'Primitives')
      .flatMap((c) => c.variables)
      .filter((v) => v.type === 'COLOR');
    expect(colours.length).toBeGreaterThan(50);
    for (const v of colours) expect(v.scopes.length, v.name).toBeGreaterThan(0);
  });

  it('gives every semantic and component variable code syntax for web, iOS and Android', () => {
    const coded = allVariables().filter(
      (v) => !v.name.startsWith('shadow/') && collection('Primitives')?.variables.indexOf(v) === -1,
    );
    for (const v of coded) {
      expect(v.codeSyntax.WEB, v.name).toMatch(/^var\(--doras-[a-z0-9-]+\)$/);
      expect(v.codeSyntax.iOS, v.name).toMatch(/^DorasTokens\.\w+\.\w+/);
      expect(v.codeSyntax.ANDROID, v.name).toBe(v.codeSyntax.iOS);
    }
  });

  it('makes semantic colours aliases of primitives in every mode', () => {
    const text = collection('Theme')?.variables.find((v) => v.name === 'color/text/default');
    expect(text?.values).toEqual({
      Light: { alias: { collection: 'Primitives', name: 'color/neutral/1000' } },
      'Light high contrast': { alias: { collection: 'Primitives', name: 'color/neutral/1000' } },
      Dark: { alias: { collection: 'Primitives', name: 'color/neutral/0' } },
      'Dark high contrast': { alias: { collection: 'Primitives', name: 'color/neutral/0' } },
    });
  });

  it('only aliases variables that exist in the plan', () => {
    const names = new Set(
      plan.collections.flatMap((c) => c.variables.map((v) => `${c.name}/${v.name}`)),
    );
    for (const v of allVariables()) {
      for (const value of Object.values(v.values)) {
        if (typeof value === 'object' && value !== null && 'alias' in value) {
          expect(
            names.has(`${value.alias.collection}/${value.alias.name}`),
            `${v.name} → ${value.alias.name}`,
          ).toBe(true);
        }
      }
    }
  });

  it('makes a text style for every type token, and an effect style for every shadow', () => {
    expect(plan.textStyles.map((s) => s.name)).toContain('type/body/md');
    expect(plan.textStyles).toHaveLength(
      docs.tokens.filter((t) => t.tier === 'semantic' && t.type === 'typography').length,
    );
    expect(plan.effectStyles.map((s) => s.name)).toEqual(['shadow/raised', 'shadow/overlay']);
  });
});

describe('applying the plan', () => {
  let figma: FakeFigma;
  beforeAll(async () => {
    figma = fakeFigma();
    await applyPlan(plan, figma);
  });

  it('creates every collection, mode and variable', () => {
    expect(figma.collections.map((c) => c.name)).toEqual(Object.values(COLLECTIONS));
    expect(figma.collections.find((c) => c.name === 'Theme')?.modes.map((m) => m.name)).toEqual([
      'Light',
      'Light high contrast',
      'Dark',
      'Dark high contrast',
    ]);
    expect(figma.allVariables).toHaveLength(allVariables().length);
  });

  it('gives every variable a value in every mode of its collection', () => {
    for (const v of figma.allVariables) {
      const c = figma.collections.find((x) => x.id === v.variableCollectionId);
      for (const mode of c?.modes ?? [])
        expect(v.valuesByMode[mode.modeId], `${v.name} ${mode.name}`).toBeDefined();
    }
  });

  it('binds text styles to the typography variables, using Figma font styles', () => {
    const body = figma.textStyles.find((s) => s.name === 'type/body/md');
    expect(body?.fontName).toEqual({ family: 'Inter', style: 'Regular' });
    expect(Object.keys(body?.boundVariables ?? {}).sort()).toEqual([
      'fontFamily',
      'fontSize',
      'letterSpacing',
      'lineHeight',
    ]);
    expect(figma.textStyles.find((s) => s.name === 'type/heading/lg')?.fontName.style).toBe('Bold');
    expect(figma.textStyles.find((s) => s.name === 'type/code')?.fontName.family).toBe(
      'Roboto Mono',
    );
  });

  it('binds every shadow layer colour to its themed variable', () => {
    for (const style of figma.effectStyles) {
      for (const effect of style.effects as { boundVariables?: Record<string, unknown> }[]) {
        expect(effect.boundVariables?.['color'], style.name).toBeDefined();
      }
    }
  });

  it('updates in place when run again: nothing duplicated, nothing new', async () => {
    const before = figma.allVariables.map((v) => v.id);
    const report = await applyPlan(plan, figma);
    expect(report.variables.created).toBe(0);
    expect(report.variables.updated).toBe(before.length);
    expect(report.collections.created).toEqual([]);
    expect(report.textStyles.created + report.effectStyles.created).toBe(0);
    expect(figma.allVariables.map((v) => v.id)).toEqual(before);
    expect(figma.collections).toHaveLength(6);
  });

  it('keeps variables the tokens no longer have, and lists them', async () => {
    const theme = figma.collections.find((c) => c.name === 'Theme');
    if (!theme) throw new Error('No Theme collection');
    figma.variables.createVariable('color/old/thing', theme, 'COLOR');
    const report = await applyPlan(plan, figma);
    expect(report.notInTokens).toEqual(['Theme/color/old/thing']);
    expect(figma.allVariables.some((v) => v.name === 'color/old/thing')).toBe(true);
  });
});

describe('applying the plan a collection at a time', () => {
  it('gives the same result as all at once', async () => {
    const whole = fakeFigma();
    await applyPlan(plan, whole);
    const parts = fakeFigma();
    for (const [, part] of splitPlan(plan)) await applyPlan(part, parts);
    const summary = (f: FakeFigma) =>
      f.allVariables
        .map((v) => `${v.name}:${Object.keys(v.valuesByMode).length}:${v.scopes.join(',')}`)
        .sort();
    expect(summary(parts)).toEqual(summary(whole));
    expect(parts.textStyles).toHaveLength(whole.textStyles.length);
    expect(parts.effectStyles).toHaveLength(whole.effectStyles.length);
  });
});

describe('on a Figma plan with too few modes', () => {
  it('explains the limit instead of failing obscurely', async () => {
    await expect(applyPlan(plan, fakeFigma({ maxModes: 1 }))).rejects.toThrow(
      /Professional allows 4/,
    );
  });
});

describe('the generated script', () => {
  it('is plain JavaScript with no imports or exports, so Figma can run it', () => {
    const js = applierJs();
    expect(js).not.toMatch(/^\s*(import|export)\b/m);
    expect(() => new Function('figma', `${js}\nreturn applyPlan;`)).not.toThrow();
  });
});
