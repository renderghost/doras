import '@doras/browser-mocks';
import {
  UNLOCK_MS,
  type DorasMockPasskeyPrompt,
  type PasskeyPromptMode,
} from '@doras/browser-mocks';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import type { MockDocs } from '../../docs/mock.ts';
import { host } from '../helpers.ts';
import { button, mockBanner, openMock } from './mock-banner.ts';

const docs: MockDocs = {
  summary:
    'The browser asks for the passkey, not the provider’s page, and only offers passkeys saved for that exact site. That’s why a passkey can’t be phished: a lookalike page gets nothing to relay.',
  tag: 'doras-mock-passkey-prompt',
  triggers: [
    {
      api: 'WebAuthn: signing in',
      href: 'https://developer.mozilla.org/en-US/docs/Web/API/CredentialsContainer/get',
      when: 'The provider’s sign-in page asks for a passkey. If this device has one for the site, the browser offers it. If not, it says so, and offers one on a phone or tablet nearby.',
      code: `const credential = await navigator.credentials.get({
  publicKey: {
    challenge, // from the provider's server
    rpId: 'bsky.social',
    userVerification: 'required',
  },
});`,
    },
    {
      api: 'WebAuthn: making a passkey',
      href: 'https://developer.mozilla.org/en-US/docs/Web/API/CredentialsContainer/create',
      when: 'The provider offers a passkey and the person accepts. The browser makes it and saves it on this device.',
      code: `const credential = await navigator.credentials.create({
  publicKey: {
    challenge, // from the provider's server
    rp: { id: 'bsky.social', name: 'Bluesky' },
    user: { id, name: 'sam.bsky.social', displayName: 'Sam Okafor' },
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
    authenticatorSelection: { residentKey: 'required', userVerification: 'required' },
  },
});`,
    },
    {
      api: 'WebAuthn: when it’s cancelled',
      href: 'https://developer.mozilla.org/en-US/docs/Web/API/CredentialsContainer/get#exceptions',
      when: 'The person closes the prompt, or it times out. The page’s call is rejected with NotAllowedError, and the page offers another way in.',
      code: `try {
  await navigator.credentials.get({ publicKey });
} catch (error) {
  if (error.name === 'NotAllowedError') {
    // Offer the password, or a code by email.
  }
}`,
    },
  ],
  events: [
    {
      name: 'doras-mock-passkey',
      when: 'The passkey was used or made. detail.mode is “sign-in” or “create”. The page’s call would resolve.',
    },
    {
      name: 'doras-mock-cancel',
      when: 'It was closed, by Cancel, the close button or Escape. detail.error is “NotAllowedError”, as the page’s call would reject.',
    },
  ],
  notes: [
    '“No passkey on this device” and “Use a phone or tablet” are the browser’s doing. The page makes the same call either way.',
    'The QR code is a picture of one, never a real code, so nothing can scan it.',
    'After Continue, it waits for the fingerprint, face or screen lock, then closes itself.',
  ],
};

interface Args {
  mode: PasskeyPromptMode;
  onPasskey: (event: Event) => void;
  onCancel: (event: Event) => void;
}

const REPLIES = {
  passkey: `<doras-notice tone="success">Signed in with your passkey.</doras-notice>`,
  cancel: `<doras-notice tone="info">Can’t use a passkey? Sign in with your password, or get a code by email.</doras-notice>`,
};

/** Shows what the page would do next, under the prompt. */
const replyWith = (handler: (event: Event) => void, reply: string) => (event: Event) => {
  handler(event);
  const page = (event.target as Element).parentElement?.querySelector('#page-reply');
  if (page) page.innerHTML = reply;
};

const renderPrompt = (args: Args) =>
  html`<div style="padding: 1.5rem; min-block-size: 480px">
    <doras-mock-passkey-prompt
      mode=${args.mode}
      site="bsky.social"
      handle="sam.bsky.social"
      name="Sam Okafor"
      provider="bluesky"
      @doras-mock-passkey=${replyWith(args.onPasskey, REPLIES.passkey)}
      @doras-mock-cancel=${replyWith(args.onCancel, REPLIES.cancel)}
    ></doras-mock-passkey-prompt>
    <div id="page-reply"></div>
  </div>`;

const meta: Meta<Args> = {
  title: 'Browser mocks/Passkey prompt',
  component: 'doras-mock-passkey-prompt',
  decorators: [mockBanner],
  parameters: {
    doras: { mock: docs },
    docs: { story: { inline: false, height: '560px' } },
    layout: 'fullscreen',
  },
  argTypes: {
    mode: { control: 'inline-radio', options: ['sign-in', 'create', 'none-here', 'other-device'] },
    onPasskey: { table: { disable: true } },
    onCancel: { table: { disable: true } },
  },
  args: { mode: 'sign-in', onPasskey: fn(), onCancel: fn() },
  render: (args) => renderPrompt(args),
};

export default meta;
type Story = StoryObj<Args>;

const prompt = (canvasElement: HTMLElement) =>
  host<DorasMockPasskeyPrompt>(canvasElement, 'doras-mock-passkey-prompt');

/** This device has Sam’s passkey for bsky.social. */
export const SignIn: Story = {
  name: 'Sign in with a passkey',
  play: async ({ canvasElement }) => {
    const element = prompt(canvasElement);
    const dialog = await openMock(element);
    await expect(dialog.matches(':modal')).toBe(true);
    await expect(dialog).toHaveAttribute('dir', 'ltr');
    await expect(element.shadowRoot?.activeElement).toBe(button(element, 'Continue'));
  },
};

/** Bluesky offers a passkey after Sam signs in with a password. */
export const Create: Story = {
  name: 'Create a passkey',
  args: { mode: 'create' },
  play: async ({ canvasElement }) => {
    const element = prompt(canvasElement);
    await openMock(element);
    await expect(element.shadowRoot?.textContent).toMatch(/Create a passkey for bsky\.social/);
    await expect(element.shadowRoot?.activeElement).toBe(button(element, 'Continue'));
  },
};

/** No passkey here, so the browser offers one on a phone or tablet. */
export const NoneHere: Story = {
  name: 'No passkey on this device',
  args: { mode: 'none-here' },
  play: async ({ canvasElement }) => {
    const element = prompt(canvasElement);
    await openMock(element);
    await expect(element.shadowRoot?.textContent).toMatch(
      /There are no passkeys for bsky\.social on this device/,
    );
    await expect(element.shadowRoot?.activeElement).toBe(button(element, 'Cancel'));
  },
};

export const OtherDevice: Story = {
  name: 'Use a phone or tablet',
  args: { mode: 'other-device' },
  play: async ({ canvasElement }) => void (await openMock(prompt(canvasElement))),
};

/** Continue: the browser waits for the fingerprint, face or screen lock, then closes. */
export const Unlocked: Story = {
  name: 'Continue, then unlock',
  play: async ({ canvasElement, args }) => {
    const element = prompt(canvasElement);
    const dialog = await openMock(element);
    await userEvent.click(button(element, 'Continue'));
    const status = element.shadowRoot?.querySelector('[role="status"]');
    await expect(status?.textContent).toMatch(/Waiting for your fingerprint, face or screen lock/);
    await expect(element.shadowRoot?.activeElement).toBe(status);
    await waitFor(
      () =>
        expect(args.onPasskey).toHaveBeenCalledWith(
          expect.objectContaining({ detail: { mode: 'sign-in', handle: 'sam.bsky.social' } }),
        ),
      { timeout: UNLOCK_MS * 4 },
    );
    await waitFor(() => expect(dialog.open).toBe(false));
    await expect(args.onCancel).not.toHaveBeenCalled();
    await expect(canvasElement.querySelector('doras-notice')).toBeTruthy();
  },
};

/** Making a passkey ends the same way, with mode “create”. */
export const Created: Story = {
  name: 'Create, then unlock',
  args: { mode: 'create' },
  play: async ({ canvasElement, args }) => {
    const element = prompt(canvasElement);
    await openMock(element);
    await userEvent.click(button(element, 'Continue'));
    await waitFor(
      () =>
        expect(args.onPasskey).toHaveBeenCalledWith(
          expect.objectContaining({ detail: { mode: 'create', handle: 'sam.bsky.social' } }),
        ),
      { timeout: UNLOCK_MS * 4 },
    );
  },
};

/** From “no passkey here” to a phone or tablet, with focus following. */
export const ToOtherDevice: Story = {
  name: 'No passkey, then a phone or tablet',
  args: { mode: 'none-here' },
  play: async ({ canvasElement }) => {
    const element = prompt(canvasElement);
    await openMock(element);
    await userEvent.click(button(element, /Use a phone or tablet/));
    await waitFor(() =>
      expect(element.shadowRoot?.textContent).toMatch(/Scan this code with the phone or tablet/),
    );
    await expect(element.shadowRoot?.activeElement).toBe(button(element, 'Cancel'));
  },
};

/** Cancelled: the page’s call is rejected, and the page offers another way in. */
export const Cancelled: Story = {
  play: async ({ canvasElement, args }) => {
    const element = prompt(canvasElement);
    const dialog = await openMock(element);
    await userEvent.click(button(element, 'Cancel'));
    await waitFor(() => expect(dialog.open).toBe(false));
    await waitFor(() =>
      expect(args.onCancel).toHaveBeenCalledWith(
        expect.objectContaining({ detail: { error: 'NotAllowedError' } }),
      ),
    );
    await expect(args.onPasskey).not.toHaveBeenCalled();
    await waitFor(() => expect(canvasElement.querySelector('doras-notice')).toBeTruthy());
  },
};
