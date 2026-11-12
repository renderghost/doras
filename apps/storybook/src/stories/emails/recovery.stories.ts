import type { Meta } from '@storybook/web-components-vite';
import { emailMeta, htmlStory, textStory } from './email-story.ts';

/**
 * The recovery email: the handle and a sign-in code, never a link. The code
 * is spaced digit by digit, so screen readers read each one.
 */
const meta: Meta = { ...emailMeta, title: 'Emails/Recovery email' };
export default meta;

export const Email = htmlStory('recovery');
export const PlainText = textStory('recovery');

/** Each locale, and dark mode, as its own story, so the tests check every one. */
export const InGerman = {
  ...htmlStory('recovery'),
  name: 'Email: German',
  globals: { locale: 'de' },
};
export const InArabic = {
  ...htmlStory('recovery'),
  name: 'Email: Arabic',
  globals: { locale: 'ar' },
};
export const InJapanese = {
  ...htmlStory('recovery'),
  name: 'Email: Japanese',
  globals: { locale: 'ja' },
};
export const InThePseudoLocale = {
  ...htmlStory('recovery'),
  name: 'Email: pseudo-locale',
  globals: { locale: 'pseudo' },
};
export const InDarkMode = {
  ...htmlStory('recovery'),
  name: 'Email: dark mode',
  globals: { theme: 'dark' },
};
