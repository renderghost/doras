// Every story, and every flow page in each variant, against its baseline (#18).
import { expect, test } from '@playwright/test';
import { entries, open } from './open.ts';

test.describe('every story, light, UK English, desktop', () => {
  for (const { id } of entries) {
    test(id, async ({ page }) => {
      await open(page, id, 'theme:light;locale:en-GB');
      await expect(page).toHaveScreenshot(['stories', `${id}.png`], { fullPage: true });
    });
  }
});

const VARIANTS = {
  dark: 'theme:dark;locale:en-GB',
  'increased-contrast': 'theme:light-high-contrast;locale:en-GB',
  arabic: 'theme:light;locale:ar',
  pseudo: 'theme:light;locale:pseudo',
};
const WIDTHS = { phone: { width: 390, height: 844 }, desktop: { width: 1280, height: 800 } };

test.describe('every flow page, in each variant, phone and desktop', () => {
  for (const { id } of entries.filter((e) => e.tags?.includes('page'))) {
    for (const [variant, globals] of Object.entries(VARIANTS)) {
      for (const [width, viewport] of Object.entries(WIDTHS)) {
        test(`${id} ${variant} ${width}`, async ({ page }) => {
          await page.setViewportSize(viewport);
          await open(page, id, globals);
          await expect(page).toHaveScreenshot(['flows', id, `${variant}-${width}.png`], {
            fullPage: true,
          });
        });
      }
    }
  }
});
