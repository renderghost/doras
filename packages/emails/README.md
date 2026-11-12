# @doras/emails

The emails providers send, built in MJML to work in Outlook, Gmail and Apple Mail. They use the same tokens and catalogue strings as the components, so they're translated like everything else, and laid out right to left in Arabic. Every email has a plain-text version.

| Email    | What it says                                                                                            |
| -------- | ------------------------------------------------------------------------------------------------------- |
| Recovery | The handle and a sign-in code, never a link, and “We never put a sign-in link in an email”.             |
| Welcome  | Confirm the email address, with the address in full for apps that hide buttons, and the handle to keep. |

## Use

In Node, on the provider's server:

```js
import { renderRecovery, renderWelcome } from '@doras/emails';

const { subject, preview, html, text } = await renderRecovery({
  locale: 'en-GB',
  name: 'Rae',
  handle: 'rae.blacksky.app',
  email: 'rae.thompson@example.com',
  app: 'Potluck',
  provider: 'Blacksky',
  code: '482913',
  minutes: 15,
});
```

`renderWelcome` takes the same, with `confirmUrl` in place of `code` and `minutes`.

## Things to know

- **Codes** are spaced digit by digit, in groups of three, so screen readers read “4 8 2”, not “four hundred and eighty-two”.
- **Values** such as handles, codes and addresses are marked up left to right in HTML. Plain text isolates them with Unicode marks, so they read correctly in Arabic.
- **No fonts are loaded.** The type stack falls back to the system's, and nothing is fetched from Google Fonts.
- **Dark mode** follows the system in the apps that support it: Apple Mail, and Outlook on Mac and phones. Outlook.com's own dark mode is covered too.
- **The check:** `checkEmail(html, { locale, links })` finds what breaks emails in email apps. The build runs it on both emails in every locale and fails on any problem:
  - CSS email apps don't support
  - text not styled inline
  - images without alt text
  - links without their own colour
  - a missing `lang`, or no `dir="rtl"` in Arabic
  - more or fewer than one `<h1>`
  - any link in the recovery email
  - over 102KB, which Gmail clips
- **Samples:** `@doras/emails/samples` has both emails rendered in every locale, for Storybook. The build also writes them to `dist/samples` as `.html` and `.txt` files.
