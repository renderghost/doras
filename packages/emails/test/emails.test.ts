// The emails (#17): what they say, in every locale, and the check that
// keeps them working in email apps.
import { LOCALES, withoutIsolation } from '@doras/i18n';
import { describe, expect, it } from 'vitest';
import { checkEmail } from '../src/check.ts';
import { renderRecovery, renderWelcome } from '../src/render.ts';

const recovery = {
  name: 'Rae',
  handle: 'rae.blacksky.app',
  email: 'rae.thompson@example.com',
  app: 'Potluck',
  provider: 'Blacksky',
  code: '482913',
  minutes: 15,
};
const welcome = {
  name: 'Jo',
  handle: 'jopark.potluck.kitchen',
  email: 'jo.park@example.com',
  app: 'Potluck',
  provider: 'Potluck',
  confirmUrl: 'https://account.potluck.kitchen/confirm?token=8f2a1c',
};

describe.each(LOCALES)('in %s', (locale) => {
  it('the recovery email passes the check, with no links at all', async () => {
    const email = await renderRecovery({ locale, ...recovery });
    expect(checkEmail(email.html, { locale, links: 'none' })).toEqual([]);
    expect(email.html).not.toMatch(/<a\s/);
  });

  it('the welcome email passes the check', async () => {
    const email = await renderWelcome({ locale, ...welcome });
    expect(checkEmail(email.html, { locale, links: 'allowed' })).toEqual([]);
  });

  it('has the handle and the code, digit by digit, in HTML and plain text', async () => {
    const email = await renderRecovery({ locale, ...recovery });
    for (const version of [email.html, withoutIsolation(email.text)]) {
      expect(version).toContain('@rae.blacksky.app');
      expect(version).toMatch(/4 8 2\s9 1 3/);
    }
  });
});

describe('the recovery email', () => {
  it('says it never sends a sign-in link', async () => {
    const email = await renderRecovery({ locale: 'en-GB', ...recovery });
    expect(email.text).toContain('We never put a sign-in link in an email.');
    expect(email.subject).toBe('Your Atmosphere account details');
  });

  it('is right to left in Arabic', async () => {
    const email = await renderRecovery({ locale: 'ar', ...recovery });
    expect(email.html).toMatch(/<html[^>]*lang="ar"[^>]*dir="rtl"/);
  });

  it('escapes what it’s given', async () => {
    const email = await renderRecovery({
      locale: 'en-GB',
      ...recovery,
      name: '<script>x</script>',
    });
    expect(email.html).not.toContain('<script>x');
    expect(email.html).toContain('&lt;script&gt;');
  });
});

describe('the welcome email', () => {
  it('has the confirm button and its address in full, for apps that hide buttons', async () => {
    const email = await renderWelcome({ locale: 'en-GB', ...welcome });
    expect(
      email.html.match(/href="https:\/\/account\.potluck\.kitchen\/confirm\?token=8f2a1c"/g),
    ).toHaveLength(2);
    expect(email.text).toContain(welcome.confirmUrl);
  });
});

describe('the check', () => {
  const page = (body: string, { lang = 'en-GB', dir = 'ltr', head = '' } = {}) =>
    `<!doctype html><html lang="${lang}" dir="${dir}"><head>${head}</head><body><div style="color:#000;font-family:sans-serif"><h1>Hi</h1>${body}</div></body></html>`;
  const check = (html: string, options = {}) =>
    checkEmail(html, { locale: 'en-GB', links: 'allowed', ...options });

  it('passes a plain, well-made email', () => {
    expect(check(page('<p>Hello</p>'))).toEqual([]);
  });

  it.each([
    [
      'no lang',
      '<!doctype html><html><body><div style="color:#000;font-family:x"><h1>a</h1></div></body></html>',
      /no lang/,
    ],
    ['two headings', page('<h1>Again</h1>'), /one <h1>/],
    ['an image without alt text', page('<img src="x.png">'), /no alt text/],
    ['custom properties', page('<p style="color:var(--x)">a</p>'), /custom properties/],
    ['flex layout', page('<div style="display:flex">a</div>'), /flex or grid/],
    ['calc()', page('<p style="width:calc(100% - 2px)">a</p>'), /calc/],
    [
      'a web font',
      page('', { head: '<style>@font-face { font-family: x; }</style>' }),
      /web fonts/,
    ],
    [
      'text without inline colour',
      '<!doctype html><html lang="en-GB"><body><h1 style="font-family:x">a</h1></body></html>',
      /inline colour/,
    ],
    [
      'a link without inline colour',
      page('<a href="https://x.example">x</a>'),
      /link has no inline colour/,
    ],
    ['a script', page('<script>1</script>'), /<script>/],
  ])('finds %s', (_, html, problem) => {
    expect(check(html).join('\n')).toMatch(problem);
  });

  it('finds a link in an email that must have none', () => {
    expect(
      check(page('<a href="https://x.example" style="color:#00f">x</a>'), { links: 'none' }).join(
        '\n',
      ),
    ).toMatch(/must have no links/);
  });

  it('finds an Arabic email that is left to right', () => {
    expect(check(page('', { lang: 'ar' }), { locale: 'ar' }).join('\n')).toMatch(/dir="rtl"/);
  });

  it('finds an email too big for Gmail', () => {
    expect(check(page(`<p>${'x'.repeat(110 * 1024)}</p>`)).join('\n')).toMatch(/Gmail clips/);
  });
});
