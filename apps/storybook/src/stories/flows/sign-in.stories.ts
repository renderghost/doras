import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { expect, waitFor } from 'storybook/test';
import {
  flowMeta,
  measured,
  onStep,
  pickAccount,
  press,
  type FlowArgs,
  type,
  walk,
} from './flow-meta.ts';
import { SIGN_IN } from './walks.ts';

const meta: Meta<FlowArgs> = { ...flowMeta, title: 'Flows/Sign in' };
export default meta;
type Story = StoryObj<FlowArgs>;

/**
 * Sam knows their handle and password, on a new laptop. Continue with
 * Atmosphere, find the account, sign in at Bluesky, decline the passkey
 * offer, connect, and back to Potluck.
 */
export const ClickThrough: Story = {
  name: 'Click through',
  play: async ({ canvasElement, args }) => {
    await walk(canvasElement, SIGN_IN);
    await waitFor(() =>
      expect(measured(args.onMeasure)).toEqual([
        'doras.door_opened',
        'doras.account_found',
        'doras.sign_in_started',
        'doras.signed_in',
        'doras.passkey_offered',
        'doras.passkey_declined',
        'doras.connect_approved',
      ]),
    );
  },
};

export const ContinueWithAtmosphere: Story = {
  tags: ['page'],
  name: 'Continue with Atmosphere',
};
export const FindYourAccount: Story = {
  tags: ['page'],
  name: 'Find your account',
  args: { start: 'find' },
};
export const IsThisYou: Story = {
  tags: ['page'],
  name: 'Is this you?',
  args: { start: 'confirm' },
};
export const ProviderSignIn: Story = {
  tags: ['page'],
  name: 'Provider sign-in',
  args: { start: 'pv-signin' },
};
export const VerificationCode: Story = {
  tags: ['page'],
  name: 'Verification code',
  args: { start: 'pv-totp', passkey: 'codes' },
};
export const OfferAPasskey: Story = {
  tags: ['page'],
  name: 'Offer a passkey',
  args: { start: 'pv-offer' },
};
export const Connect: Story = {
  tags: ['page'],
  args: { start: 'pv-connect' },
};

/** Alex has three accounts, and the browser offers them. No handle to type. */
export const WithTheBrowser: Story = {
  name: 'With the browser’s account chooser',
  args: { scenario: 'alex' },
  play: async ({ canvasElement, args }) => {
    await press(canvasElement, /Continue with Atmosphere/);
    await pickAccount(canvasElement, 'alexcooks.eurosky.social');
    await onStep(canvasElement, /Connect .?Potluck.? to your Atmosphere account\?/);
    await press(canvasElement, /^Connect$/);
    await onStep(canvasElement, /You’re in, Alex\./);
    await expect(measured(args.onMeasure)).toEqual([
      'doras.account_found',
      'doras.sign_in_started',
      'doras.connect_approved',
    ]);
  },
};

/** This device has Sam's passkey: the browser offers it, and there's no passkey offer after. */
export const PasskeyOnThisDevice: Story = {
  name: 'Passkey on this device',
  args: { start: 'pv-signin', passkey: 'here' },
  play: async ({ canvasElement, args }) => {
    await press(canvasElement, /^Use a passkey$/);
    await press(canvasElement, /^Continue$/);
    await onStep(canvasElement, /Connect .?Potluck.? to your Atmosphere account\?/);
    await expect(measured(args.onMeasure)).toContain('doras.signed_in');
    await expect(measured(args.onMeasure)).not.toContain('doras.passkey_offered');
  },
};

/** The passkey is on a lost phone: the browser says so, and the password still works. */
export const PasskeyOnALostPhone: Story = {
  name: 'Passkey only on a lost phone',
  args: { start: 'pv-signin', passkey: 'lost-phone' },
  play: async ({ canvasElement }) => {
    await press(canvasElement, /^Use a passkey$/);
    await press(canvasElement, /^Cancel$/);
    await waitFor(() =>
      expect(canvasElement.querySelector('doras-notice')?.textContent).toMatch(
        /Can’t use a passkey\?/,
      ),
    );
    await type(canvasElement, /^Password/, 'correct horse battery');
    await press(canvasElement, /^Sign in$/);
    await onStep(canvasElement, /Sign in faster next time\?/);
  },
};

/** Verification codes are on: the authenticator app's code comes after the password. */
export const WithVerificationCodes: Story = {
  name: 'With verification codes',
  args: { start: 'pv-signin', passkey: 'codes' },
  play: async ({ canvasElement }) => {
    await type(canvasElement, /^Password/, 'correct horse battery');
    await press(canvasElement, /^Sign in$/);
    await onStep(canvasElement, /Enter the code from your authenticator app/);
    await type(canvasElement, /Verification code/, '123456');
    await press(canvasElement, /^Continue$/);
    await onStep(canvasElement, /Sign in faster next time\?/);
  },
};

/** “Passkey only” is on: a password is refused, and says why. */
export const PasskeyOnly: Story = {
  name: 'Passkey only',
  args: { start: 'pv-signin', passkey: 'passkey-only' },
  play: async ({ canvasElement }) => {
    await type(canvasElement, /^Password/, 'correct horse battery');
    await press(canvasElement, /^Sign in$/);
    const field = canvasElement.querySelector('doras-password-field');
    await waitFor(() => expect(field?.error).toMatch(/signs in with a passkey only/));
  },
};
