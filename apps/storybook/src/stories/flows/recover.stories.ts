import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { expect } from 'storybook/test';
import { choose, flowMeta, measured, onStep, press, type FlowArgs, type } from './flow-meta.ts';

const meta: Meta<FlowArgs> = {
  ...flowMeta,
  title: 'Flows/Recover',
  args: { ...flowMeta.args, scenario: 'rae' },
};
export default meta;
type Story = StoryObj<FlowArgs>;

/**
 * Rae forgot the handle and password but knows the email. Blacksky emails
 * the handle and a code; the code comes from Mail; Rae adds a passkey for
 * next time, connects, and is back in Potluck.
 */
export const ClickThrough: Story = {
  name: 'Click through',
  play: async ({ canvasElement, args }) => {
    await press(canvasElement, /Continue with Atmosphere/);
    await press(canvasElement, /Forgot your handle\?/);
    await onStep(canvasElement, /Find your Atmosphere account with your email/);
    await type(canvasElement, /Email address/, 'rae.thompson@example.com');
    await choose(canvasElement, /^Blacksky/);
    await press(canvasElement, /Email me my account details/);
    await onStep(canvasElement, /Check your email/);
    await press(canvasElement, /I’ve got the email/);
    await onStep(canvasElement, /Type the handle from the email/);
    await type(canvasElement, /Your handle/, 'rae.blacksky.app');
    await press(canvasElement, /^Continue$/);
    await onStep(canvasElement, /Enter your sign-in code/);
    await press(canvasElement, /482 913/);
    await press(canvasElement, /^Sign in$/);
    await onStep(canvasElement, /How do you want to sign in next time\?/);
    await press(canvasElement, /^Add a passkey$/);
    await press(canvasElement, /^Continue$/);
    await onStep(canvasElement, /Connect .?Potluck.? to your Atmosphere account\?/);
    await press(canvasElement, /^Connect$/);
    await onStep(canvasElement, /You’re in, Rae\./);
    await expect(measured(args.onMeasure)).toEqual([
      'doras.door_opened',
      'doras.recovery_started',
      'doras.recovery_email_requested',
      'doras.account_found',
      'doras.sign_in_started',
      'doras.signed_in',
      'doras.recovery_completed',
      'doras.passkey_added',
      'doras.connect_approved',
    ]);
  },
};

export const FindByEmail: Story = { name: 'Find the account by email', args: { start: 'forgot' } };
export const CheckYourEmail: Story = { name: 'Check your email', args: { start: 'check-email' } };
export const TypeTheHandle: Story = {
  name: 'Type the handle from the email',
  args: { start: 'recover' },
};
export const EnterTheCode: Story = { name: 'Enter the sign-in code', args: { start: 'pv-code' } };
export const NextTime: Story = {
  name: 'How to sign in next time',
  args: { start: 'pv-next-time', passkey: 'lost-phone' },
  play: async ({ canvasElement }) => {
    // A passkey on a lost phone can be removed here.
    await press(canvasElement, /^Remove it$/);
    await expect(canvasElement.textContent).toMatch(/is removed\. It no longer works/);
  },
};
