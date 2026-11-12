// Checks the rules every workspace package must follow (see docs/decisions.md).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = resolve(import.meta.dirname, '..');
const LICENCE = 'MIT OR Apache-2.0';

interface PackageJson {
  name: string;
  version: string;
  private?: boolean;
  license?: string;
  repository?: { directory?: string };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

const readJson = (path: string): PackageJson =>
  JSON.parse(readFileSync(path, 'utf8')) as PackageJson;

const packageDirs = ['packages', 'apps'].flatMap((group) =>
  readdirSync(join(ROOT, group), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `${group}/${entry.name}`),
);

const packages = packageDirs.map((dir) => ({
  dir,
  json: readJson(join(ROOT, dir, 'package.json')),
}));

describe('the root package', () => {
  it('is private and dual-licensed', () => {
    const root = readJson(join(ROOT, 'package.json'));
    expect(root.private).toBe(true);
    expect(root.license).toBe(LICENCE);
  });

  it('has both licence texts', () => {
    for (const file of ['LICENSE', 'LICENSE-MIT', 'LICENSE-APACHE']) {
      expect(existsSync(join(ROOT, file)), file).toBe(true);
    }
  });
});

describe.each(packages)('$dir', ({ dir, json }) => {
  it('is named @doras/…', () => {
    expect(json.name).toMatch(/^@doras\/[a-z][a-z0-9-]*$/);
  });

  it('is dual-licensed', () => {
    expect(json.license).toBe(LICENCE);
  });

  it('stays unpublished until the public name and owner are agreed', () => {
    expect(json.private).toBe(true);
  });

  it('has a semver version', () => {
    expect(json.version).toMatch(/^\d+\.\d+\.\d+(-[\w.]+)?$/);
  });

  it('points its repository directory at itself', () => {
    expect(json.repository?.directory).toBe(dir);
  });

  it('has a README', () => {
    expect(existsSync(join(ROOT, dir, 'README.md'))).toBe(true);
  });
});

describe('browser mocks', () => {
  it('are never a dependency of a package other than Storybook', () => {
    const users = packages
      .filter(({ json }) => json.name !== '@doras/storybook')
      .filter(({ json }) =>
        [json.dependencies, json.devDependencies, json.peerDependencies].some(
          (deps) => deps !== undefined && '@doras/browser-mocks' in deps,
        ),
      )
      .map(({ json }) => json.name);
    expect(users).toEqual([]);
  });
});

describe('the visual checks', () => {
  // Baselines only match screenshots made in the same image, with the same
  // Playwright, so every place that names the image must agree with the pin.
  it('use the Playwright image for the pinned Playwright version', () => {
    const storybook = readJson(join(ROOT, 'apps/storybook/package.json'));
    const pinned = storybook.devDependencies?.['@playwright/test'];
    expect(storybook.devDependencies?.playwright).toBe(pinned);
    const image = `mcr.microsoft.com/playwright:v${pinned}-noble`;
    for (const file of [
      '.github/workflows/ci.yml',
      '.github/workflows/visual-baselines.yml',
      'scripts/visual.sh',
    ]) {
      const named =
        readFileSync(join(ROOT, file), 'utf8').match(/mcr\.microsoft\.com\/playwright:[\w.-]+/g) ??
        [];
      expect(named.length, file).toBeGreaterThan(0);
      for (const n of named) expect(n, file).toBe(image);
    }
  });
});
