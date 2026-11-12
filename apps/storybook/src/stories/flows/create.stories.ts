import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { expect } from 'storybook/test';
import { choose, flowMeta, measured, onStep, press, type FlowArgs, type } from './flow-meta.ts';

const meta: Meta<FlowArgs> = {
  ...flowMeta,
  title: 'Flows/Create an account',
  args: { ...flowMeta.args, scenario: 'jo' },
};
export default meta;
type Story = StoryObj<FlowArgs>;

/**
 * Jo is new to the Atmosphere. Potluck hosts the new account: an email, a
 * passkey, a handle, then the short Connect, and back to Potluck.
 */
export const ClickThrough: Story = {
  name: 'Click through',
  play: async ({ canvasElement, args }) => {
    await press(canvasElement, /Create an Atmosphere account/);
    await onStep(canvasElement, /Create your Atmosphere account/);
    await press(canvasElement, /Continue with .?Potluck/);
    await onStep(canvasElement, /Create your Atmosphere account/);
    await type(canvasElement, /Email address/, 'jo.park@example.com');
    await choose(canvasElement, /Passkey/);
    await press(canvasElement, /Next: choose your handle/);
    await press(canvasElement, /^Continue$/);
    await onStep(canvasElement, /Choose your handle/);
    await press(canvasElement, /Create account/);
    await onStep(canvasElement, /Your Atmosphere account is ready/);
    await press(canvasElement, /Continue to .?Potluck/);
    await onStep(canvasElement, /Welcome to Potluck, Jo\./);
    await expect(measured(args.onMeasure)).toEqual([
      'doras.door_opened',
      'doras.provider_chosen',
      'doras.account_created',
      'doras.passkey_added',
      'doras.connect_approved',
    ]);
  },
};

/** Priya assumes Potluck needs a new account, but the browser knows the one Priya has. */
export const AlreadyHasOne: Story = {
  name: 'Already has one',
  args: { scenario: 'priya' },
  play: async ({ canvasElement, args }) => {
    await press(canvasElement, /Create an Atmosphere account/);
    await onStep(canvasElement, /Before you create an Atmosphere account/);
    await press(canvasElement, /Use this account/);
    await onStep(canvasElement, /Connect .?Potluck.? to your Atmosphere account\?/);
    await press(canvasElement, /^Connect$/);
    await onStep(canvasElement, /You’re in, Priya\./);
    await expect(measured(args.onMeasure)).toEqual([
      'doras.existing_account_found',
      'doras.door_opened',
      'doras.account_found',
      'doras.sign_in_started',
      'doras.connect_approved',
    ]);
  },
};

/** Another provider, Bluesky, hosts it, with a password: the full Connect follows. */
export const WithAnotherProvider: Story = {
  name: 'With another provider and a password',
  play: async ({ canvasElement }) => {
    await press(canvasElement, /Create an Atmosphere account/);
    await choose(canvasElement, /^Bluesky/);
    await press(canvasElement, /Continue with .?Bluesky/);
    await onStep(canvasElement, /Create your Atmosphere account/);
    await type(canvasElement, /Email address/, 'jo.park@example.com');
    await choose(canvasElement, /^Password/);
    await type(canvasElement, /^Password/, 'correct horse battery');
    await press(canvasElement, /Next: choose your handle/);
    await onStep(canvasElement, /Choose your handle/);
    await press(canvasElement, /Create account/);
    await onStep(canvasElement, /Connect .?Potluck.? to your Atmosphere account\?/);
  },
};

export const ExistingAccountCheck: Story = {
  name: 'The existing-account check',
  args: { scenario: 'priya', start: 'found' },
};
export const ChooseAProvider: Story = { name: 'Choose a provider', args: { start: 'create' } };
export const SignUp: Story = { name: 'Sign-up: passkey or password', args: { start: 'pv-signup' } };
export const ChooseAHandle: Story = { name: 'Choose a handle', args: { start: 'pv-handle' } };
export const ConnectShort: Story = { name: 'Connect, short version', args: { start: 'pv-ready' } };
