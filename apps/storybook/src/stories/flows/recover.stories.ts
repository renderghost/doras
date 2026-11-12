import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { expect } from 'storybook/test';
import { flowMeta, measured, press, walk, type FlowArgs } from './flow-meta.ts';
import { RECOVER } from './walks.ts';

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
    await walk(canvasElement, RECOVER);
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

export const FindByEmail: Story = {
  tags: ['page'],
  name: 'Find the account by email',
  args: { start: 'forgot' },
};
export const CheckYourEmail: Story = {
  tags: ['page'],
  name: 'Check your email',
  args: { start: 'check-email' },
};
export const TypeTheHandle: Story = {
  tags: ['page'],
  name: 'Type the handle from the email',
  args: { start: 'recover' },
};
export const EnterTheCode: Story = {
  tags: ['page'],
  name: 'Enter the sign-in code',
  args: { start: 'pv-code' },
};
export const NextTime: Story = {
  tags: ['page'],
  name: 'How to sign in next time',
  args: { start: 'pv-next-time', passkey: 'lost-phone' },
  play: async ({ canvasElement }) => {
    // A passkey on a lost phone can be removed here.
    await press(canvasElement, /^Remove it$/);
    await expect(canvasElement.textContent).toMatch(/is removed\. It no longer works/);
  },
};
