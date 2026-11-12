// Production packages must never import a browser mock (#15): real browsers
// draw that UI themselves. Each production package's build runs this first,
// so importing @doras/browser-mocks, or a path into it, fails the build.
//
//   node ../../scripts/check-no-mocks.ts [dir …]   (default: src and build)
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SPECIFIERS = [
  /\bfrom\s*['"]([^'"]+)['"]/g, // import … from, export … from
  /\bimport\s*\(?\s*['"]([^'"]+)['"]/g, // import 'x', import('x')
  /\brequire\s*\(\s*['"]([^'"]+)['"]/g,
];

const CODE = /\.(?:[cm]?[jt]sx?)$/;

/** Whether an import specifier reaches the browser mocks, by name or by path. */
export const isMock = (specifier: string): boolean =>
  /^@doras\/browser-mocks(?:\/|$)/.test(specifier) ||
  /(?:^|\/)browser-mocks(?:\/|$)/.test(specifier);

/** The specifiers in some source code that reach the browser mocks. */
export function mockImports(source: string): string[] {
  return SPECIFIERS.flatMap((pattern) =>
    [...source.matchAll(pattern)].map((match) => match[1] ?? ''),
  ).filter(isMock);
}

function* files(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* files(path);
    else if (CODE.test(entry.name)) yield path;
  }
}

/** Every import of a mock under the given directories. */
export function findMockImports(dirs: string[]): { file: string; specifier: string }[] {
  return dirs
    .filter((dir) => existsSync(dir))
    .flatMap((dir) => [...files(dir)])
    .flatMap((file) =>
      mockImports(readFileSync(file, 'utf8')).map((specifier) => ({ file, specifier })),
    );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dirs = process.argv.length > 2 ? process.argv.slice(2) : ['src', 'build'];
  const found = findMockImports(dirs);
  if (found.length) {
    const name = basename(process.cwd());
    console.error(`${name} imports a browser mock. Mocks are for Storybook only (#15):`);
    for (const { file, specifier } of found) {
      console.error(`  ${relative(process.cwd(), file)} imports '${specifier}'`);
    }
    process.exit(1);
  }
}
