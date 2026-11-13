// Every journey with the keyboard only (#19): Tab, Shift+Tab, Enter, Space,
// the arrow keys and Escape. No pointer, and no focusing from script. Codes
// and passwords go in by pasting too, as a password manager or a copied code
// would (3.3.8).
import { expect, test, type Page } from '@playwright/test';
import { open } from './open.ts';

const LIGHT = 'theme:light;locale:en-GB';
const plain = (s: string) => s.replace(/[⁨⁩]/g, '').replace(/\s+/g, ' ').trim();

/** The focused element's accessible name, roughly as a screen reader would hear it. */
async function focused(page: Page): Promise<string> {
  const name = await page.evaluate(() => {
    let el: Element | null = document.activeElement;
    while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
    if (!el || el === document.body) return '';
    const root = el.getRootNode() as Document | ShadowRoot;
    const label = el.getAttribute('aria-label');
    if (label) return label;
    const by = el.getAttribute('aria-labelledby');
    if (by)
      return by
        .split(/\s+/)
        .map((id) => root.getElementById?.(id)?.textContent ?? '')
        .join(' ');
    const labels = (el as HTMLInputElement).labels;
    if (labels?.length) return [...labels].map((l) => l.textContent ?? '').join(' ');
    const own = el.textContent ?? '';
    if (own.trim()) return own;
    return root instanceof ShadowRoot ? (root.host.textContent ?? '') : '';
  });
  return plain(name);
}

/** Presses Tab until something named like this has focus. */
async function tabTo(page: Page, name: RegExp): Promise<void> {
  const visited: string[] = [];
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    const now = await focused(page);
    if (name.test(now)) return;
    visited.push(now);
  }
  throw new Error(`Tab never reached ${name}. It went: ${visited.join(' | ')}`);
}

async function onStep(page: Page, name: RegExp): Promise<void> {
  await page.waitForFunction(
    (source) =>
      [...document.querySelectorAll('[data-step-heading]')].some((h) =>
        new RegExp(source).test((h.textContent ?? '').replace(/[⁨⁩]/g, '')),
      ),
    name.source,
    { timeout: 5000 },
  );
  // Focus moves to the step's heading, so Tab goes on from the top of the step.
  await expect.poll(() => focused(page)).toMatch(name);
}

const start = (page: Page, scenario: string) =>
  open(page, `flows-sign-in--continue-with-atmosphere&args=scenario:${scenario}`, LIGHT);

test('sign in, keyboard only', async ({ page }) => {
  await start(page, 'sam');
  await tabTo(page, /^Continue with Atmosphere$/);
  await page.keyboard.press('Enter');
  await onStep(page, /Sign in to Potluck/);
  await tabTo(page, /^Your handle/);
  await page.keyboard.type('sam.bsky.social');
  await page.keyboard.press('Enter');
  await onStep(page, /Is this you\?/);
  await tabTo(page, /^Continue to Bluesky$/);
  await page.keyboard.press('Enter');
  await onStep(page, /Sign in to your Atmosphere account/);
  await tabTo(page, /^Password/);
  await page.keyboard.type('correct horse battery');
  await page.keyboard.press('Enter');
  await onStep(page, /Sign in faster next time\?/);
  await tabTo(page, /^Not now$/);
  await page.keyboard.press('Enter');
  await onStep(page, /Connect Potluck to your Atmosphere account\?/);
  await tabTo(page, /^Connect$/);
  await page.keyboard.press('Enter');
  await onStep(page, /You’re in, Sam\./);
});

test('Escape closes the sheet and focus goes back to the button', async ({ page }) => {
  await start(page, 'sam');
  await tabTo(page, /^Continue with Atmosphere$/);
  await page.keyboard.press('Enter');
  await onStep(page, /Sign in to Potluck/);
  await page.keyboard.press('Escape');
  await expect.poll(() => focused(page)).toBe('Continue with Atmosphere');
});

test('create an account, keyboard only', async ({ page }) => {
  await start(page, 'jo');
  await tabTo(page, /^Create an Atmosphere account$/);
  await page.keyboard.press('Enter');
  await onStep(page, /Create your Atmosphere account/);
  await tabTo(page, /^Continue with Potluck$/);
  await page.keyboard.press('Enter');
  await onStep(page, /Create your Atmosphere account/);
  await tabTo(page, /^Email address/);
  await page.keyboard.type('jo.park@example.com');
  // The first radio card; Space picks it.
  await tabTo(page, /^Passkey/);
  await page.keyboard.press('Space');
  await tabTo(page, /^Next: choose your handle$/);
  await page.keyboard.press('Enter');
  // The browser's passkey prompt starts on Continue.
  await expect.poll(() => focused(page)).toBe('Continue');
  await page.keyboard.press('Enter');
  await onStep(page, /Choose your handle/);
  await tabTo(page, /^Create account$/);
  await page.keyboard.press('Enter');
  await onStep(page, /Your Atmosphere account is ready/);
  await tabTo(page, /^Continue to Potluck$/);
  await page.keyboard.press('Enter');
  await onStep(page, /Welcome to Potluck, Jo\./);
});

test('recover, keyboard only', async ({ page }) => {
  await start(page, 'rae');
  await tabTo(page, /^Continue with Atmosphere$/);
  await page.keyboard.press('Enter');
  await onStep(page, /Sign in to Potluck/);
  await tabTo(page, /^Forgot your handle\?$/);
  await page.keyboard.press('Enter');
  await onStep(page, /Find your Atmosphere account with your email/);
  await tabTo(page, /^Email address/);
  await page.keyboard.type('rae.thompson@example.com');
  await tabTo(page, /^Blacksky/);
  await page.keyboard.press('Space');
  await tabTo(page, /^Email me my account details$/);
  await page.keyboard.press('Enter');
  await onStep(page, /Check your email/);
  await tabTo(page, /^I’ve got the email$/);
  await page.keyboard.press('Enter');
  await onStep(page, /Type the handle from the email/);
  await tabTo(page, /^Your handle/);
  await page.keyboard.type('rae.blacksky.app');
  await page.keyboard.press('Enter');
  await onStep(page, /Enter your sign-in code/);
  await tabTo(page, /^Sign-in code/);
  await page.keyboard.type('482913');
  await page.keyboard.press('Enter');
  await onStep(page, /How do you want to sign in next time\?/);
  await tabTo(page, /^Add a passkey$/);
  await page.keyboard.press('Enter');
  await expect.poll(() => focused(page)).toBe('Continue');
  await page.keyboard.press('Enter');
  await onStep(page, /Connect Potluck to your Atmosphere account\?/);
  await tabTo(page, /^Connect$/);
  await page.keyboard.press('Enter');
  await onStep(page, /You’re in, Rae\./);
});

test('sign in with the browser’s chooser, keyboard only', async ({ page }) => {
  await start(page, 'alex');
  await tabTo(page, /^Continue with Atmosphere$/);
  await page.keyboard.press('Enter');
  // The chooser starts on the first account; Tab to the second.
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await onStep(page, /Connect Potluck to your Atmosphere account\?/);
  await tabTo(page, /^Connect$/);
  await page.keyboard.press('Enter');
  await onStep(page, /You’re in, Alex\./);
});

test('Shift+Tab reaches Back, and Back goes back a step', async ({ page }) => {
  await start(page, 'sam');
  await tabTo(page, /^Continue with Atmosphere$/);
  await page.keyboard.press('Enter');
  await onStep(page, /Sign in to Potluck/);
  await tabTo(page, /^Your handle/);
  await page.keyboard.type('sam.bsky.social');
  await page.keyboard.press('Enter');
  await onStep(page, /Is this you\?/);
  const visited: string[] = [];
  for (let i = 0; i < 10 && visited.at(-1) !== 'Back'; i++) {
    await page.keyboard.press('Shift+Tab');
    visited.push(await focused(page));
  }
  expect(visited.at(-1), visited.join(' | ')).toBe('Back');
  await page.keyboard.press('Enter');
  await onStep(page, /Sign in to Potluck/);
});

test('the arrow keys move through radio cards', async ({ page }) => {
  await start(page, 'jo');
  await tabTo(page, /^Create an Atmosphere account$/);
  await page.keyboard.press('Enter');
  await onStep(page, /Create your Atmosphere account/);
  // Tab goes into the group once, on the chosen card; the arrows move between cards.
  await tabTo(page, /^Potluck/);
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => focused(page)).toMatch(/^Blacksky/);
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => focused(page)).toMatch(/^Bluesky/);
  // One Tab leaves the group, for the button that now names the choice.
  await page.keyboard.press('Tab');
  await expect.poll(() => focused(page)).toBe('Continue with Bluesky');
});

test('codes and passwords can be pasted', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const paste = async (text: string) => {
    await page.evaluate((t) => navigator.clipboard.writeText(t), text);
    await page.keyboard.press('ControlOrMeta+V');
    const value = () =>
      page.evaluate(() => {
        let el: Element | null = document.activeElement;
        while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
        return (el as HTMLInputElement | null)?.value ?? '';
      });
    await expect.poll(value).toBe(text);
  };
  await open(page, 'flows-sign-in--provider-sign-in', LIGHT);
  await tabTo(page, /^Password/);
  await paste('correct horse battery');
  await page.keyboard.press('Enter');
  await onStep(page, /Sign in faster next time\?/);

  await open(page, 'flows-recover--enter-the-code', LIGHT);
  await tabTo(page, /^Sign-in code/);
  // As copied from an email, with a space in it.
  await paste('482 913');
  await page.keyboard.press('Enter');
  await onStep(page, /How do you want to sign in next time\?/);
});
