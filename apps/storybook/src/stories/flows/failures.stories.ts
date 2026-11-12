import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { expect, waitFor } from 'storybook/test';
import {
  choose,
  flowMeta,
  harness,
  measured,
  onStep,
  press,
  type FlowArgs,
  type,
} from './flow-meta.ts';

const meta: Meta<FlowArgs> = { ...flowMeta, title: 'Flows/Failure states' };
export default meta;
type Story = StoryObj<FlowArgs>;

const failureNotice = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLElement>('[data-flow-failure]');

/** Network failure: keeps what was typed, and offers a retry. */
export const NetworkFailure: Story = {
  name: 'Network failure',
  args: { start: 'find', failure: 'network' },
  play: async ({ canvasElement, args }) => {
    await type(canvasElement, /Your handle/, 'sam.bsky.social');
    await press(canvasElement, /Find my account/);
    await waitFor(() => expect(failureNotice(canvasElement)?.textContent).toBeDefined());
    await expect(harness(canvasElement).value('handle')).toBe('sam.bsky.social');
    await expect(measured(args.onMeasure)).toContain('doras.failure_shown');
    await press(canvasElement, /Try again/);
    await onStep(canvasElement, /Is this you\?/);
  },
};

/** Too many attempts: a clear wait, and nothing that says whether an account exists. */
export const TooManyAttempts: Story = {
  name: 'Too many attempts',
  args: { start: 'forgot', failure: 'too-many-attempts' },
  play: async ({ canvasElement }) => {
    await type(canvasElement, /Email address/, 'someone@example.com');
    await choose(canvasElement, /^Not sure/);
    await press(canvasElement, /Email me my account details/);
    await waitFor(() => expect(failureNotice(canvasElement)).toBeTruthy());
    await expect(failureNotice(canvasElement)).toHaveAttribute('failure', 'too-many-attempts');
    await expect(canvasElement.textContent).not.toMatch(/no account|doesn’t exist/i);
  },
};

/** Session expired: starts again from “Is this you?”, with the account still there. */
export const SessionExpired: Story = {
  name: 'Session expired',
  args: { start: 'pv-signin', failure: 'session-expired' },
  play: async ({ canvasElement }) => {
    await type(canvasElement, /^Password/, 'correct horse battery');
    await press(canvasElement, /^Sign in$/);
    await onStep(canvasElement, /Is this you\?/);
    await expect(failureNotice(canvasElement)).toHaveAttribute('failure', 'session-expired');
    await expect(canvasElement.querySelector('doras-account-row')).toHaveAttribute(
      'handle',
      'sam.bsky.social',
    );
  },
};

/** Provider unavailable: says so, without blaming the person or the app. */
export const ProviderUnavailable: Story = {
  name: 'Provider unavailable',
  args: { start: 'confirm', failure: 'provider-unavailable' },
  play: async ({ canvasElement }) => {
    await press(canvasElement, /Continue to .?Bluesky/);
    await waitFor(() =>
      expect(failureNotice(canvasElement)).toHaveAttribute('failure', 'provider-unavailable'),
    );
    await press(canvasElement, /Try again/);
    await onStep(canvasElement, /Sign in to your Atmosphere account/);
  },
};
