import type { Meta } from '@storybook/web-components-vite';
import { emailMeta, htmlStory, textStory } from './email-story.ts';

/** The welcome email: confirm the address, and the handle to keep. */
const meta: Meta = { ...emailMeta, title: 'Emails/Welcome email' };
export default meta;

export const Email = htmlStory('welcome');
export const PlainText = textStory('welcome');

/** Each locale, and dark mode, as its own story, so the tests check every one. */
export const InGerman = {
  ...htmlStory('welcome'),
  name: 'Email: German',
  globals: { locale: 'de' },
};
export const InArabic = {
  ...htmlStory('welcome'),
  name: 'Email: Arabic',
  globals: { locale: 'ar' },
};
export const InJapanese = {
  ...htmlStory('welcome'),
  name: 'Email: Japanese',
  globals: { locale: 'ja' },
};
export const InThePseudoLocale = {
  ...htmlStory('welcome'),
  name: 'Email: pseudo-locale',
  globals: { locale: 'pseudo' },
};
export const InDarkMode = {
  ...htmlStory('welcome'),
  name: 'Email: dark mode',
  globals: { theme: 'dark' },
};
