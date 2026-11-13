// Every story runs as a test in a real browser: its play function, and an
// accessibility check that fails on any violation (a11y.test in preview.ts).
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// The browser matrix (#18): Chromium by default; CI runs each browser in a
// job of its own, with DORAS_BROWSERS=firefox, and so on.
type Browser = 'chromium' | 'firefox' | 'webkit';
const browsers = (process.env.DORAS_BROWSERS ?? 'chromium').split(',') as Browser[];

export default defineConfig({
  plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
  // The docs container themes Storybook's docs pages. Bundling its theming
  // module up front stops Vite finding it mid-run and reloading the tests,
  // which fails them on a cold cache, as in CI.
  optimizeDeps: { include: ['storybook/theming'] },
  test: {
    name: 'storybook',
    browser: {
      enabled: true,
      headless: true,
      // CI installs Playwright's own Chromium. Elsewhere, CHROMIUM_PATH can
      // point at a Chromium that's already installed.
      provider: playwright({
        launchOptions: process.env.CHROMIUM_PATH
          ? { executablePath: process.env.CHROMIUM_PATH }
          : {},
      }),
      instances: browsers.map((browser) => ({ browser })),
    },
  },
});
