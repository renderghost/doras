// Every story runs as a test in a real browser: its play function, and an
// accessibility check that fails on any violation (a11y.test in preview.ts).
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
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
      instances: [{ browser: 'chromium' }],
    },
  },
});
