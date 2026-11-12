import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { render } from '../build/generate.ts';
import {
  checkSpecs,
  measurementProblems,
  readKnown,
  readMeasurementEvents,
  readSpecs,
  referenceProblems,
  schemaProblems,
  type MeasurementEvent,
  type Spec,
} from '../build/specs.ts';

const list = readMeasurementEvents() as { events: MeasurementEvent[] };
const known = readKnown(list.events);
const specs = readSpecs();
const button = specs.get('button') as Spec & Record<string, unknown>;
const clone = <T>(value: T): T => structuredClone(value);
const firstEvent = (l: { events: MeasurementEvent[] }): MeasurementEvent => {
  const [first] = l.events;
  if (!first) throw new Error('The list is empty');
  return first;
};

describe('the specs and the measurement events list', () => {
  it('pass every check', () => {
    expect(measurementProblems(list)).toEqual([]);
    expect(checkSpecs(specs, known)).toEqual([]);
  });

  it('include the worked example: the button', () => {
    expect(button.name).toBe('Button');
    expect(button.platforms.web.tag).toBe('doras-button');
  });

  it('never let a button be disabled', () => {
    expect(button.props.map((p) => p.name)).not.toContain('disabled');
  });

  it('also cover the Storybook sample, which follows the same schema', () => {
    const sample = readSpecs(
      fileURLToPath(new URL('../../../apps/storybook/src/example/', import.meta.url)),
    );
    expect([...sample.keys()]).toEqual(['example-chip']);
    expect(checkSpecs(sample, known)).toEqual([]);
  });
});

describe('the schema', () => {
  it('rejects a spec missing a section', () => {
    const spec = clone(button);
    delete spec.accessibility;
    expect(schemaProblems('x', spec)).toEqual(["x: / must have required property 'accessibility'"]);
  });

  it('needs values and a default for enum props', () => {
    const spec: Record<string, unknown> = clone(button);
    spec.props = [{ name: 'size', type: 'enum', description: 'How big.' }];
    expect(schemaProblems('x', spec).join('\n')).toMatch(/must have required property 'values'/);
  });

  it('keeps boolean props off by default, as HTML boolean attributes are', () => {
    const spec: Record<string, unknown> = clone(button);
    spec.props = [{ name: 'open', type: 'boolean', description: 'Open.', default: true }];
    expect(schemaProblems('x', spec).join('\n')).toMatch(/must be equal to constant/);
  });

  it('only allows doras- names for custom events', () => {
    const spec = clone(button);
    spec.events = [{ name: 'toggle-thing', kind: 'ui' }];
    expect(
      schemaProblems('x', {
        ...spec,
        events: [{ name: 'toggle-thing', kind: 'ui', when: 'Now.' }],
      }),
    ).not.toEqual([]);
  });
});

describe('the reference checks', () => {
  it('catch tokens, strings and measurement events that do not exist', () => {
    const spec = clone(button);
    spec.tokens = ['color.text.nope', 'primitive.color.accent.500'];
    spec.strings = ['common.nope'];
    spec.events = [{ name: 'doras.made_up', kind: 'measurement' }];
    expect(referenceProblems('x', spec, known)).toEqual([
      "x: uses color.text.nope, which isn't a token",
      'x: uses the primitive primitive.color.accent.500; use a semantic token',
      "x: uses the string common.nope, which isn't in the catalogue",
      "x: announces doras.made_up, which isn't in the measurement events list",
    ]);
  });

  it('catch an enum default that is not one of its values', () => {
    const spec = clone(button);
    spec.props = [
      { name: 'variant', type: 'enum', values: [{ value: 'a' }, { value: 'b' }], default: 'c' },
    ];
    expect(referenceProblems('x', spec, known)).toEqual([
      "x: variant's default isn't one of its values",
    ]);
  });

  it('catch two components with the same tag', () => {
    const twins = new Map<string, unknown>([
      ['button', button],
      ['other', clone(button)],
    ]);
    expect(checkSpecs(twins, known)).toEqual([
      'other.spec.json: uses the tag doras-button, as button.spec.json does',
    ]);
  });
});

describe('the measurement events list', () => {
  it('only carries fixed values, flags and counts, never free text', () => {
    const bad = clone(list);
    bad.events[0] = {
      ...firstEvent(bad),
      carries: { handle: { description: 'The handle.' } },
    } as MeasurementEvent;
    expect(measurementProblems(bad)).not.toEqual([]);
  });

  it('names each event once', () => {
    const bad = clone(list);
    bad.events.push(clone(firstEvent(bad)));
    expect(measurementProblems(bad)).toEqual([
      'measurement-events.json: doras.door_opened is listed twice',
    ]);
  });
});

describe('the generated types', () => {
  it('compile, and type a component and its measurement events', async () => {
    const { dts } = await render(specs, list.events);
    const dir = mkdtempSync(path.join(tmpdir(), 'doras-specs-'));
    writeFileSync(path.join(dir, 'index.d.ts'), dts);
    writeFileSync(
      path.join(dir, 'use.ts'),
      [
        "import type { DorasButtonProps, DorasMeasurement } from './index.js';",
        "const props: DorasButtonProps = { variant: 'primary', type: 'button', busy: false, fullWidth: false };",
        "const event: DorasMeasurement = { name: 'doras.signed_in', method: 'passkey' };",
        "// @ts-expect-error: a variant that isn't in the spec",
        "const wrong: DorasButtonProps = { ...props, variant: 'danger' };",
        "// @ts-expect-error: a measurement event that doesn't carry a handle",
        "const leaky: DorasMeasurement = { name: 'doras.signed_in', method: 'passkey', handle: 'sam' };",
        "document.addEventListener('doras-measure', (e) => e.detail.name);",
        "window.addEventListener('doras-measure', (e) => e.detail.name);",
        "document.body.addEventListener('doras-measure', (e) => e.detail.name);",
        'export { event, wrong, leaky };',
      ].join('\n'),
    );
    const program = ts.createProgram([path.join(dir, 'use.ts')], {
      strict: true,
      noEmit: true,
      skipLibCheck: false,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      lib: ['lib.es2023.d.ts', 'lib.dom.d.ts'],
      types: [],
    });
    const diagnostics = ts
      .getPreEmitDiagnostics(program)
      .map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'));
    expect(diagnostics).toEqual([]);
  });
});
