import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ICON_BY_NAME } from '../src/icon/icons.ts';
import { TONE_ICONS } from '../src/shared/feedback.ts';

const SRC = fileURLToPath(new URL('../src/', import.meta.url));

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? sources(path.join(dir, e.name))
      : e.name.endsWith('.ts')
        ? [path.join(dir, e.name)]
        : [],
  );
}

describe('icons', () => {
  it('every icon a component names is in the list, so none silently draws nothing', () => {
    const named = new Set<string>(Object.values(TONE_ICONS));
    for (const file of sources(SRC)) {
      for (const m of readFileSync(file, 'utf8').matchAll(
        /<doras-icon[^>]*\bname="([a-z0-9-]+)"/g,
      )) {
        if (m[1]) named.add(m[1]);
      }
    }
    const missing = [...named].filter((n) => !ICON_BY_NAME.has(n));
    expect(missing).toEqual([]);
    expect(named.size).toBeGreaterThan(5);
  });
});
