// The browser mocks never reach production (#15): the check finds every
// way of importing them, and every production build runs it first.
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { findMockImports, mockImports } from './check-no-mocks.ts';

const ROOT = resolve(import.meta.dirname, '..');
const CHECK = join(ROOT, 'scripts/check-no-mocks.ts');

describe('mockImports', () => {
  it.each([
    [`import '@doras/browser-mocks';`],
    [`import { DorasMockAutofill } from '@doras/browser-mocks';`],
    [`import {\n  DorasMockAutofill,\n} from "@doras/browser-mocks";`],
    [`export * from '@doras/browser-mocks/dist/index.js';`],
    [`const mocks = await import('@doras/browser-mocks');`],
    [`import x from '../../browser-mocks/src/autofill/autofill.ts';`],
    [`const m = require('@doras/browser-mocks');`],
  ])('finds %s', (source) => {
    expect(mockImports(source)).toHaveLength(1);
  });

  it.each([
    [`import '@doras/components';`],
    [`import { browserMocks } from './browser-mocks-notes.ts';`],
    [`// Never import @doras/browser-mocks here.`],
  ])('ignores %s', (source) => {
    expect(mockImports(source)).toEqual([]);
  });
});

describe('the check', () => {
  const dir = mkdtempSync(join(tmpdir(), 'doras-no-mocks-'));
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it('fails a build that imports a mock, naming the file', () => {
    mkdirSync(join(dir, 'src'));
    writeFileSync(join(dir, 'src/fine.ts'), `import '@doras/components';\n`);
    writeFileSync(join(dir, 'src/bad.ts'), `import '@doras/browser-mocks';\n`);
    const run = spawnSync(process.execPath, [CHECK], { cwd: dir, encoding: 'utf8' });
    expect(run.status).toBe(1);
    expect(run.stderr).toContain(`src/bad.ts imports '@doras/browser-mocks'`);
    expect(run.stderr).not.toContain('fine.ts');
  });

  it('passes every production package as it is', () => {
    for (const name of ['components', 'i18n', 'specs', 'tokens', 'figma-sync']) {
      const pkg = join(ROOT, 'packages', name);
      expect(findMockImports([join(pkg, 'src'), join(pkg, 'build')]), name).toEqual([]);
    }
  });
});

describe('every production package', () => {
  const NOT_PRODUCTION = new Set(['browser-mocks']);
  const packages = readdirSync(join(ROOT, 'packages')).filter((n) => !NOT_PRODUCTION.has(n));

  it.each(packages)('%s runs the check before it builds', (name) => {
    const { scripts } = JSON.parse(
      readFileSync(join(ROOT, 'packages', name, 'package.json'), 'utf8'),
    ) as {
      scripts?: { build?: string };
    };
    // A package with no build yet (emails, until #17) has nothing to guard.
    if (scripts?.build === undefined) return;
    expect(scripts.build.startsWith('node ../../scripts/check-no-mocks.ts && ')).toBe(true);
  });
});
