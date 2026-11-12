// Resolves the DTCG 2025.10 resolver document into one token tree per theme,
// then lets Style Dictionary resolve every reference in it.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import StyleDictionary from 'style-dictionary';
import type { DesignTokens } from 'style-dictionary/types';

export const SRC = join(import.meta.dirname, '..', 'src');
export const RESOLVER = join(SRC, 'doras.resolver.json');

type Json = Record<string, unknown>;
interface Ref {
  $ref: string;
}
interface Resolver {
  sets: Record<string, { sources: Ref[] }>;
  modifiers: Record<string, { contexts: Record<string, Ref[]>; default?: string }>;
  resolutionOrder: Ref[];
}

/** A token after every reference is resolved, for one theme. */
export interface ResolvedToken {
  /** Dot path, such as "color.text.default". */
  name: string;
  path: string[];
  type: string;
  /** The value with every reference resolved. */
  value: unknown;
  /** The value as written, which may be a reference such as "{color.text.default}". */
  original: unknown;
  description: string | undefined;
  extensions: Json | undefined;
  tier: Tier;
}

export type Tier = 'primitive' | 'semantic' | 'component';

const readJson = (path: string): Json => JSON.parse(readFileSync(path, 'utf8')) as Json;

const isToken = (node: unknown): node is Json =>
  typeof node === 'object' && node !== null && '$value' in node;

/**
 * Deep-merges token trees in order. A token replaces an earlier token of the
 * same name whole (value, description and extensions), as the resolver
 * module requires; groups merge.
 */
export function merge(target: Json, source: Json): Json {
  for (const [key, value] of Object.entries(source)) {
    if (key === '$schema') continue;
    const existing = target[key];
    if (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      !isToken(value) &&
      typeof existing === 'object' &&
      existing !== null &&
      !isToken(existing)
    ) {
      merge(existing as Json, value as Json);
    } else {
      target[key] = structuredClone(value);
    }
  }
  return target;
}

export function loadResolver(): Resolver {
  return readJson(RESOLVER) as unknown as Resolver;
}

/** Theme names, in the resolver's order. */
export function themeNames(): string[] {
  const { modifiers } = loadResolver();
  const theme = modifiers['theme'];
  if (!theme) throw new Error('The resolver has no theme modifier.');
  return Object.keys(theme.contexts);
}

const pointer = (ref: string): string[] => {
  if (!ref.startsWith('#/'))
    throw new Error(`Only same-document pointers are supported here: ${ref}`);
  return ref.slice(2).split('/');
};

/** The source files, in order, for one theme. */
export function sourcesFor(theme: string): string[] {
  const resolver = loadResolver();
  const files: string[] = [];
  const base = dirname(RESOLVER);
  for (const step of resolver.resolutionOrder) {
    const [kind, name] = pointer(step.$ref);
    if (kind === 'sets' && name) {
      const set = resolver.sets[name];
      if (!set) throw new Error(`Unknown set: ${name}`);
      files.push(...set.sources.map((s) => join(base, s.$ref)));
    } else if (kind === 'modifiers' && name) {
      const modifier = resolver.modifiers[name];
      const context = modifier?.contexts[theme];
      if (!context) throw new Error(`Modifier ${name} has no context ${theme}`);
      files.push(...context.map((s) => join(base, s.$ref)));
    } else {
      throw new Error(`Unsupported resolution step: ${step.$ref}`);
    }
  }
  return files;
}

/** The merged, unresolved token tree for one theme. */
export function treeFor(theme: string): Json {
  return sourcesFor(theme).reduce<Json>((tree, file) => merge(tree, readJson(file)), {});
}

const tierOf = (path: string[]): Tier =>
  path[0] === 'primitive' ? 'primitive' : path[0] === 'component' ? 'component' : 'semantic';

/** Every token for one theme, with references resolved by Style Dictionary. */
export async function resolveTheme(theme: string): Promise<ResolvedToken[]> {
  const sd = new StyleDictionary({
    tokens: treeFor(theme) as DesignTokens,
    usesDtcg: true,
    log: { verbosity: 'silent', warnings: 'disabled' },
    platforms: { raw: {} },
  });
  const { allTokens } = await sd.getPlatformTokens('raw');
  return allTokens.map((token) => ({
    name: token.path.join('.'),
    path: token.path,
    type: String(token.$type),
    value: token.$value,
    original: (token.original as Json)['$value'],
    description: token.$description as string | undefined,
    extensions: token.$extensions as Json | undefined,
    tier: tierOf(token.path),
  }));
}

/** Every theme, resolved: theme name to its tokens. */
export async function resolveAll(): Promise<Map<string, ResolvedToken[]>> {
  const themes = new Map<string, ResolvedToken[]>();
  for (const theme of themeNames()) themes.set(theme, await resolveTheme(theme));
  return themes;
}
