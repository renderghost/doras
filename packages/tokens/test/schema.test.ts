// Every token file and the resolver document must follow DTCG 2025.10, as
// checked by the official JSON Schemas (copied into schemas/).
import { globSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Ajv, type ValidateFunction } from 'ajv';
import addFormatsModule from 'ajv-formats';
import { describe, expect, it } from 'vitest';
import { RESOLVER, SRC } from '../build/resolve.ts';

const SCHEMAS = join(import.meta.dirname, '..', 'schemas');
const load = (path: string): unknown => JSON.parse(readFileSync(path, 'utf8'));
const addFormats = addFormatsModule as unknown as (ajv: Ajv) => Ajv;

function validator(schema: string): ValidateFunction {
  const ajv = new Ajv({ strict: false, allErrors: true, logger: false });
  addFormats(ajv);
  // A format the DTCG schemas use that Ajv doesn't know: a JSON pointer in a URI fragment.
  ajv.addFormat('json-pointer-uri-fragment', /^#(\/([^/~]|~[01])*)*$/);
  return ajv.compile(load(join(SCHEMAS, schema)) as object);
}

const format = validator('format.json');
const resolver = validator('resolver.json');
const files = globSync('**/*.tokens.json', { cwd: SRC });

describe('DTCG 2025.10', () => {
  it('finds the token files', () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it.each(files)('%s is a valid token file', (file) => {
    const valid = format(load(join(SRC, file)));
    expect(format.errors ?? []).toEqual([]);
    expect(valid).toBe(true);
  });

  it('the resolver document is valid', () => {
    const valid = resolver(load(RESOLVER));
    expect(resolver.errors ?? []).toEqual([]);
    expect(valid).toBe(true);
  });

  it('rejects a broken token, so the check is real', () => {
    const broken = {
      color: { $type: 'color', bad: { $value: { colorSpace: 'srgb', components: 'red' } } },
    };
    expect(format(broken)).toBe(false);
  });
});
