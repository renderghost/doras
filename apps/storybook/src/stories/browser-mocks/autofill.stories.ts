import '@doras/browser-mocks';
import type { DorasMockAutofill } from '@doras/browser-mocks';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect, fn, userEvent } from 'storybook/test';
import type { MockDocs } from '../../docs/mock.ts';
import { host } from '../helpers.ts';
import { mockBanner } from './mock-banner.ts';

const docs: MockDocs = {
  summary:
    'The browser’s suggestions under the focused field: a passkey saved for this site, or a code that just arrived in Mail.',
  tag: 'doras-mock-autofill',
  triggers: [
    {
      api: 'Passkey autofill',
      href: 'https://developer.mozilla.org/en-US/docs/Web/API/CredentialsContainer/get#mediation',
      when: 'The provider’s sign-in page marks its handle or password field for passkeys, and asks for one quietly. The browser offers saved passkeys among the field’s suggestions, so the page never reveals whether the account has one.',
      code: `// The field: <input name="username" autocomplete="username webauthn">
const credential = await navigator.credentials.get({
  mediation: 'conditional',
  publicKey: { challenge, rpId: 'bsky.social' },
});`,
    },
    {
      api: 'One-time codes',
      href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/autocomplete',
      when: 'A field marked for a one-time code. Some browsers offer the newest code from Mail or Messages. Doras’s code field already sets this.',
      code: `// <doras-code-field> renders:
// <input inputmode="numeric" autocomplete="one-time-code">`,
    },
  ],
  events: [
    {
      name: 'doras-mock-autofill',
      when: 'The suggestion was picked. detail has kind and value. A passkey then asks for the fingerprint, face or screen lock; a code fills the field.',
    },
  ],
  notes: ['Place it straight after the field it belongs to, as the browser draws it there.'],
};

interface Args {
  onAutofill: (event: Event) => void;
}

const meta: Meta<Args> = {
  title: 'Browser mocks/Autofill',
  component: 'doras-mock-autofill',
  decorators: [mockBanner],
  parameters: { doras: { mock: docs } },
  argTypes: { onAutofill: { table: { disable: true } } },
  args: { onAutofill: fn() },
};

export default meta;
type Story = StoryObj<Args>;

/** On Bluesky’s sign-in page, the browser offers Sam’s passkey. */
export const SavedPasskey: Story = {
  name: 'A saved passkey',
  render: (args) =>
    html`<div style="max-inline-size: 22rem">
      <doras-text-field label="Handle" value="" autocomplete="username webauthn"></doras-text-field>
      <doras-mock-autofill
        kind="passkey"
        value="sam.bsky.social"
        @doras-mock-autofill=${args.onAutofill}
      ></doras-mock-autofill>
    </div>`,
  play: async ({ canvasElement, args }) => {
    const element = host<DorasMockAutofill>(canvasElement, 'doras-mock-autofill');
    const suggestion = element.shadowRoot?.querySelector('button') as HTMLButtonElement;
    await expect(suggestion.textContent).toMatch(/sam\.bsky\.social/);
    await expect(suggestion.textContent).toMatch(/Passkey saved in this browser/);
    await userEvent.click(suggestion);
    await expect(args.onAutofill).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { kind: 'passkey', value: 'sam.bsky.social' } }),
    );
  },
};

/** Rae’s recovery code, offered from Mail, fills the code field. */
export const CodeFromMail: Story = {
  name: 'A code from Mail',
  render: (args) =>
    html`<div style="max-inline-size: 22rem">
      <doras-code-field label="Code from the email"></doras-code-field>
      <doras-mock-autofill
        kind="code"
        value="482913"
        @doras-mock-autofill=${(event: CustomEvent<{ value: string }>) => {
          args.onAutofill(event);
          const field = (event.target as Element).parentElement?.querySelector('doras-code-field');
          if (field) field.value = event.detail.value;
        }}
      ></doras-mock-autofill>
    </div>`,
  play: async ({ canvasElement, args }) => {
    const element = host<DorasMockAutofill>(canvasElement, 'doras-mock-autofill');
    const suggestion = element.shadowRoot?.querySelector('button') as HTMLButtonElement;
    // Grouped in threes, as Mail shows it; the event carries the code itself.
    await expect(suggestion.textContent).toMatch(/482 913/);
    await expect(suggestion.textContent).toMatch(/From Mail/);
    await userEvent.click(suggestion);
    await expect(args.onAutofill).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { kind: 'code', value: '482913' } }),
    );
    await expect(canvasElement.querySelector('doras-code-field')?.value).toBe('482913');
  },
};
