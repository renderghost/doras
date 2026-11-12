// Shows an email as an email app would (#17): the HTML in a frame of its
// own, in the toolbar's locale, and its plain-text version.
import { SAMPLES } from '@doras/emails/samples';
import type { Decorator, Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect, waitFor } from 'storybook/test';
import { LOCALES, type Locale } from '../../../.storybook/settings.ts';

export type EmailName = 'recovery' | 'welcome';

/** The toolbar's locale, as the emails name it (the pseudo-locale is en-XA). */
const sampleLocale = (globals: Record<string, unknown>): string =>
  LOCALES[(globals.locale as Locale) ?? 'en-GB']?.lang ?? 'en-GB';

const isDark = (globals: Record<string, unknown>): boolean =>
  typeof globals.theme === 'string' && globals.theme.startsWith('dark');

const sample = (name: EmailName, globals: Record<string, unknown>) => {
  const found = SAMPLES[name][sampleLocale(globals)] ?? SAMPLES[name]['en-GB'];
  if (!found) throw new Error(`No ${name} email sample`);
  return found;
};

/**
 * The email's HTML. A dark theme in the toolbar shows its dark mode, as an
 * email app set to dark would: the media query applies whatever the system says.
 */
export function htmlStory(name: EmailName): StoryObj {
  return {
    name: 'Email',
    render: (_args, { globals }) => {
      const email = sample(name, globals);
      const doc = isDark(globals)
        ? email.html.replace(/@media \(prefers-color-scheme: dark\)/g, '@media all')
        : email.html;
      return html`<p class="email-subject"><strong>${email.subject}</strong> · ${email.preview}</p>
        <iframe
          class="email-frame"
          title=${email.subject}
          srcdoc=${doc}
          style="inline-size: 100%; block-size: 760px; border: 1px solid var(--doras-color-border-default); border-radius: 8px; background: #fff"
        ></iframe>`;
    },
    play: async ({ canvasElement, globals }) => {
      const frame = canvasElement.querySelector('iframe') as HTMLIFrameElement;
      await waitFor(() => expect(frame.contentDocument?.querySelector('h1')).toBeTruthy());
      const doc = frame.contentDocument as Document;
      await expect(doc.documentElement).toHaveAttribute('lang', sampleLocale(globals));
      await expect(doc.querySelectorAll('h1')).toHaveLength(1);
      if (name === 'recovery') await expect(doc.querySelectorAll('a[href]')).toHaveLength(0);
    },
  };
}

/** The plain-text version, as sent alongside the HTML. */
export function textStory(name: EmailName): StoryObj {
  return {
    name: 'Plain text',
    render: (_args, { globals }) => {
      const email = sample(name, globals);
      return html`<pre
        lang=${sampleLocale(globals)}
        dir="auto"
        style="max-inline-size: 40rem; padding: 1rem; border: 1px solid var(--doras-color-border-default); border-radius: 8px; white-space: pre-wrap; font: 0.9375rem/1.5 ui-monospace, monospace; color: var(--doras-color-text-default); background: var(--doras-color-surface-default)"
      >
${email.text}</pre>`;
    },
  };
}

/** Shared by both emails' files, which add a title and a description. */
export const emailMeta: Omit<Meta, 'title'> = {
  tags: ['!autodocs'],
  decorators: [
    ((story) => html`<div style="max-inline-size: 44rem">${story()}</div>`) as Decorator,
  ],
};
