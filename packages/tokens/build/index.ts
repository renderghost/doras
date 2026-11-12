// Builds every output from src/doras.resolver.json into dist/.
//   node build/index.ts
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderCss } from './css.ts';
import { renderDocs, renderEntry } from './docs.ts';
import { KOTLIN_PACKAGE, renderKotlin, renderSwift } from './mobile.ts';
import { resolveAll } from './resolve.ts';

const DIST = join(import.meta.dirname, '..', 'dist');

function write(path: string, content: string): void {
  const file = join(DIST, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

export async function build(): Promise<string[]> {
  const themes = await resolveAll();
  const docs = renderDocs(themes);
  const entry = renderEntry(docs);
  const swift = renderSwift(themes);
  const kotlin = renderKotlin(themes);
  const kotlinDir = `kotlin/${KOTLIN_PACKAGE.replace(/\./g, '/')}`;
  const files: [string, string][] = [
    ['css/doras.css', renderCss(themes)],
    ['tokens.json', `${JSON.stringify(docs, null, 2)}\n`],
    ['index.js', entry.js],
    ['index.d.ts', entry.dts],
    ['swift/DorasTokens.swift', swift.core],
    ['swift/DorasTokens+SwiftUI.swift', swift.swiftui],
    [`${kotlinDir}/DorasTokens.kt`, kotlin.core],
    [`${kotlinDir}/compose/DorasTokensCompose.kt`, kotlin.compose],
  ];
  rmSync(DIST, { recursive: true, force: true });
  for (const [path, content] of files) write(path, content);
  return files.map(([path]) => path);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const files = await build();
  console.log(`@doras/tokens: built ${files.length} files in dist/`);
  for (const f of files) console.log(`  ${f}`);
}
