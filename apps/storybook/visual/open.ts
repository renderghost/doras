// Opens a story as the checks need it (#18, #19): Inter from a local copy,
// no other network, and the story's play function finished.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import type { Page } from '@playwright/test';

export interface Entry {
  id: string;
  type: 'story' | 'docs';
  tags?: string[];
  title?: string;
}

export const entries = Object.values(
  (
    JSON.parse(readFileSync('storybook-static/index.json', 'utf8')) as {
      entries: Record<string, Entry>;
    }
  ).entries,
).filter((e) => e.type === 'story');

// Inter from a local copy, not Google Fonts, so screenshots never depend on
// the network. Its CSS names the family “Inter Variable”; the stories use “Inter”.
const fonts = dirname(
  createRequire(import.meta.url).resolve('@fontsource-variable/inter/index.css'),
);
const fontCss = readFileSync(join(fonts, 'index.css'), 'utf8')
  .replace(/'Inter Variable'/g, "'Inter'")
  .replace(/url\(\.\/files\//g, 'url(/__fonts/');

export async function open(page: Page, id: string, globals: string): Promise<void> {
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === 'fonts.googleapis.com') {
      await route.fulfill({ contentType: 'text/css', body: fontCss });
    } else if (url.pathname.startsWith('/__fonts/')) {
      await route.fulfill({ path: join(fonts, 'files', url.pathname.slice('/__fonts/'.length)) });
    } else if (url.hostname !== '127.0.0.1') {
      await route.abort();
    } else {
      await route.continue();
    }
  });
  await page.goto(`/iframe.html?id=${id}&viewMode=story&globals=${globals}`);
  // Wait for the story, and its play function, to finish.
  await page.waitForFunction(
    () => {
      const renders =
        (window as unknown as { __STORYBOOK_PREVIEW__?: { storyRenders?: { phase?: string }[] } })
          .__STORYBOOK_PREVIEW__?.storyRenders ?? [];
      return (
        renders.length > 0 &&
        renders.every((r) =>
          ['finished', 'completed', 'errored', 'aborted'].includes(r.phase ?? ''),
        )
      );
    },
    null,
    { timeout: 30_000 },
  );
  await page.evaluate(() => document.fonts.ready);
}
