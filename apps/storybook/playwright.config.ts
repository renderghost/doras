// The visual checks (#18): screenshots compared with saved baselines.
// Baselines are made in the Playwright image CI uses, so fonts and
// rendering match: `pnpm visual:update` runs it there. Never update them
// automatically.
import { defineConfig } from '@playwright/test';

const PORT = 6123;

export default defineConfig({
  testDir: './visual',
  snapshotPathTemplate: '{testDir}/baselines/{arg}{ext}',
  outputDir: './visual-results',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'visual-report' }]],
  timeout: 60_000,
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
      // Rendering in the same image is exact; this only absorbs anti-aliasing.
      maxDiffPixels: 20,
    },
  },
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    browserName: 'chromium',
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
    reducedMotion: 'reduce',
    locale: 'en-GB',
    timezoneId: 'Europe/London',
  },
  webServer: {
    command: `node visual/serve.ts storybook-static ${PORT}`,
    url: `http://127.0.0.1:${PORT}/index.json`,
    reuseExistingServer: !process.env.CI,
  },
});
