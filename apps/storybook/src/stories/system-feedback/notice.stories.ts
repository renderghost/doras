import '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect, fn, waitFor } from 'storybook/test';
import { argTypesFromSpec, argsFromSpec } from '../../docs/controls.ts';
import { host, textIn } from '../helpers.ts';

interface Args {
  tone: 'info' | 'success' | 'error' | 'automated';
  heading: string;
  failure: 'none' | 'network' | 'too-many-attempts' | 'session-expired' | 'provider-unavailable';
  provider: string;
  minutes: number;
  onMeasure: (event: Event) => void;
}

const meta: Meta<Args> = {
  title: 'System feedback/Notice',
  component: 'doras-notice',
  parameters: { doras: { spec: specs.notice } },
  argTypes: { ...argTypesFromSpec(specs.notice), onMeasure: { table: { disable: true } } },
  args: {
    ...(argsFromSpec(specs.notice) as Partial<Args>),
    heading: '',
    provider: 'Bluesky',
    onMeasure: fn(),
  },
  render: (args) =>
    html`<div style="max-inline-size: 30rem">
      <doras-notice
        tone=${args.tone}
        heading=${args.heading}
        failure=${args.failure}
        provider=${args.provider}
        minutes=${args.minutes}
        @doras-measure=${args.onMeasure}
        ><p>Your passkey is saved on this device.</p></doras-notice
      >
    </div>`,
};

export default meta;
type Story = StoryObj<Args>;

export const Info: Story = {};
export const Success: Story = { args: { tone: 'success' } };
export const Error: Story = { args: { tone: 'error', heading: 'That didn’t work' } };
export const Automated: Story = { args: { tone: 'automated' } };

/** Each failure uses locked copy, and is counted once as doras.failure_shown. */
export const NetworkFailure: Story = {
  name: 'Failure: network',
  args: { failure: 'network' },
  render: (args) =>
    html`<div style="max-inline-size: 30rem">
      <doras-notice failure="network" @doras-measure=${args.onMeasure}>
        <doras-button slot="actions" variant="secondary">${'Try again'}</doras-button>
      </doras-notice>
    </div>`,
  play: async ({ canvasElement, args }) => {
    const notice = host(canvasElement, 'doras-notice');
    await expect(notice.shadowRoot?.textContent).toContain(textIn(notice, 'failure.network'));
    await waitFor(() =>
      expect(args.onMeasure).toHaveBeenCalledWith(
        expect.objectContaining({ detail: { name: 'doras.failure_shown', failure: 'network' } }),
      ),
    );
    await expect(args.onMeasure).toHaveBeenCalledTimes(1);
  },
};

export const TooManyAttempts: Story = {
  name: 'Failure: too many attempts',
  args: { failure: 'too-many-attempts', minutes: 10 },
};

export const SessionExpired: Story = {
  name: 'Failure: session expired',
  args: { failure: 'session-expired' },
};

export const ProviderUnavailable: Story = {
  name: 'Failure: provider unavailable',
  args: { failure: 'provider-unavailable' },
};
