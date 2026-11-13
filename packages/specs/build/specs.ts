// Reads, validates and cross-checks the component specs and the measurement
// events list. The build stops on any problem.
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Ajv2020 } from 'ajv/dist/2020.js';

const here = (relative: string): string => fileURLToPath(new URL(relative, import.meta.url));
const readJson = (file: string): unknown => JSON.parse(readFileSync(file, 'utf8'));

export const COMPONENT_SCHEMA = here('../schema/component.schema.json');
export const MEASUREMENT_SCHEMA = here('../schema/measurement-events.schema.json');
export const SPECS_DIR = here('../src/components/');
export const MEASUREMENT_FILE = here('../src/measurement-events.json');

/** The parts of a spec the checks read. The full type is generated from the schema. */
export interface Spec {
  name: string;
  props: { name: string; type: string; values?: { value: string }[]; default?: unknown }[];
  events: { name: string; kind: 'ui' | 'measurement' }[];
  tokens: string[];
  strings: string[];
  platforms: { web: { tag: string } };
  accessibility?: { screenReaderResults?: { setup: string }[] };
}

export interface MeasurementEvent {
  name: string;
  journey: string;
  when: string;
  carries: Record<string, { description: string; values?: string[]; type?: 'boolean' | 'integer' }>;
}

/** Every spec in a folder, keyed by file name: button.spec.json → button. */
export function readSpecs(dir = SPECS_DIR): Map<string, unknown> {
  return new Map(
    readdirSync(dir)
      .filter((f) => f.endsWith('.spec.json'))
      .sort()
      .map((f) => [f.replace(/\.spec\.json$/, ''), readJson(path.join(dir, f))]),
  );
}

export function readMeasurementEvents(): unknown {
  return readJson(MEASUREMENT_FILE);
}

const ajv = new Ajv2020({
  allErrors: true,
  strict: true,
  // The prop schema requires values in an if/then branch, which strict mode would reject.
  strictRequired: false,
  allowUnionTypes: true,
});
const validateSpec = ajv.compile(readJson(COMPONENT_SCHEMA) as object);
const validateMeasurement = ajv.compile(readJson(MEASUREMENT_SCHEMA) as object);

const errorsOf = (label: string, errors: typeof validateSpec.errors): string[] =>
  (errors ?? []).map((e) => `${label}: ${e.instancePath || '/'} ${e.message ?? 'is invalid'}`);

/** Schema problems with a spec. */
export function schemaProblems(label: string, spec: unknown): string[] {
  return validateSpec(spec) ? [] : errorsOf(label, validateSpec.errors);
}

/** Schema problems with the measurement events list. */
export function measurementProblems(list: unknown): string[] {
  if (!validateMeasurement(list))
    return errorsOf('measurement-events.json', validateMeasurement.errors);
  const names = (list as { events: MeasurementEvent[] }).events.map((e) => e.name);
  const repeated = names.filter((n, i) => names.indexOf(n) !== i);
  return repeated.map((n) => `measurement-events.json: ${n} is listed twice`);
}

export interface Known {
  /** Public token names. */
  tokens: Set<string>;
  /** Catalogue keys. */
  strings: Set<string>;
  /** Measurement event names. */
  measurement: Set<string>;
}

/** What the specs can refer to: the built tokens, the UK English catalogue and the measurement list. */
export function readKnown(measurement: MeasurementEvent[]): Known {
  const require = createRequire(import.meta.url);
  const tokens = readJson(require.resolve('@doras/tokens/tokens.json')) as {
    tokens: { name: string; tier: string }[];
  };
  const strings = readJson(require.resolve('@doras/i18n/messages/en-GB.json')) as {
    messages: Record<string, unknown>;
  };
  return {
    tokens: new Set(tokens.tokens.filter((t) => t.tier !== 'primitive').map((t) => t.name)),
    strings: new Set(Object.keys(strings.messages)),
    measurement: new Set(measurement.map((e) => e.name)),
  };
}

/** Problems the schema can't see: references to tokens, strings and events that don't exist. */
export function referenceProblems(label: string, spec: Spec, known: Known): string[] {
  const problems: string[] = [];
  for (const token of spec.tokens) {
    if (token.startsWith('primitive.'))
      problems.push(`${label}: uses the primitive ${token}; use a semantic token`);
    else if (!known.tokens.has(token))
      problems.push(`${label}: uses ${token}, which isn't a token`);
  }
  for (const key of spec.strings) {
    if (!known.strings.has(key))
      problems.push(`${label}: uses the string ${key}, which isn't in the catalogue`);
  }
  for (const event of spec.events) {
    if (event.kind === 'measurement' && !known.measurement.has(event.name)) {
      problems.push(
        `${label}: announces ${event.name}, which isn't in the measurement events list`,
      );
    }
  }
  const names = spec.props.map((p) => p.name);
  for (const name of names.filter((n, i) => names.indexOf(n) !== i)) {
    problems.push(`${label}: has two props called ${name}`);
  }
  for (const prop of spec.props) {
    if (prop.type === 'enum' && !prop.values?.some((v) => v.value === prop.default)) {
      problems.push(`${label}: ${prop.name}'s default isn't one of its values`);
    }
  }
  // A setup tested again replaces its result, so each appears once.
  const setups = (spec.accessibility?.screenReaderResults ?? []).map((r) => r.setup);
  for (const setup of setups.filter((s, i) => setups.indexOf(s) !== i)) {
    problems.push(`${label}: has two screen reader results for ${setup}`);
  }
  return problems;
}

/** Every problem with a set of specs. */
export function checkSpecs(specs: Map<string, unknown>, known: Known): string[] {
  const problems: string[] = [];
  const tags = new Map<string, string>();
  for (const [file, spec] of specs) {
    const label = `${file}.spec.json`;
    const schema = schemaProblems(label, spec);
    problems.push(...schema);
    if (schema.length) continue;
    const s = spec as Spec;
    problems.push(...referenceProblems(label, s, known));
    const tag = s.platforms.web.tag;
    const other = tags.get(tag);
    if (other) problems.push(`${label}: uses the tag ${tag}, as ${other} does`);
    tags.set(tag, label);
  }
  return problems;
}
