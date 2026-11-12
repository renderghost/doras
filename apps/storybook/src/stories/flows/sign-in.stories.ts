import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { expect, waitFor } from 'storybook/test';
import { flowMeta, measured, onStep, press, type FlowArgs, type } from './flow-meta.ts';

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
    await press(canvasElement, /Continue with Atmosphere/);
    await onStep(canvasElement, /Sign in to Potluck/);
    await type(canvasElement, /Your handle/, 'sam.bsky.social');
    await press(canvasElement, /Find my account/);
    await onStep(canvasElement, /Is this you\?/);
    await press(canvasElement, /Continue to .?Bluesky/);
    await onStep(canvasElement, /Sign in to your Atmosphere account/);
    await type(canvasElement, /^Password/, 'correct horse battery');
    await press(canvasElement, /^Sign in$/);
    await onStep(canvasElement, /Sign in faster next time\?/);
    await press(canvasElement, /Not now/);
    await onStep(canvasElement, /Connect .?Potluck.? to your Atmosphere account\?/);
    await press(canvasElement, /^Connect$/);
    await onStep(canvasElement, /You’re in, Sam\./);
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

export const ContinueWithAtmosphere: Story = { name: 'Continue with Atmosphere' };
export const FindYourAccount: Story = { name: 'Find your account', args: { start: 'find' } };
export const IsThisYou: Story = { name: 'Is this you?', args: { start: 'confirm' } };
export const ProviderSignIn: Story = { name: 'Provider sign-in', args: { start: 'pv-signin' } };
export const VerificationCode: Story = {
  name: 'Verification code',
  args: { start: 'pv-totp', passkey: 'codes' },
};
export const OfferAPasskey: Story = { name: 'Offer a passkey', args: { start: 'pv-offer' } };
export const Connect: Story = { args: { start: 'pv-connect' } };
