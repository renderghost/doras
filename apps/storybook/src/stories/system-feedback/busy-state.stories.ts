import '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect } from 'storybook/test';
import { argTypesFromSpec, argsFromSpec } from '../../docs/controls.ts';
import { host } from '../helpers.ts';

interface Args {
  busy: boolean;
  label: string;
}

const meta: Meta<Args> = {
  title: 'System feedback/Busy state',
  component: 'doras-busy-state',
  parameters: { doras: { spec: specs['busy-state'] } },
  argTypes: argTypesFromSpec(specs['busy-state']),
  args: { ...(argsFromSpec(specs['busy-state']) as Partial<Args>), busy: true, label: 'Checking…' },
  render: (args) =>
    html`<doras-busy-state ?busy=${args.busy} label=${args.label} style="max-inline-size: 26rem">
      <doras-account-row
        name="Sam Rivera"
        handle="sam.bsky.social"
        provider="bluesky"
      ></doras-account-row>
      <doras-account-row
        name="Samira Haddad"
        handle="samira.eurosky.social"
        provider="eurosky"
      ></doras-account-row>
    </doras-busy-state>`,
};

export default meta;
type Story = StoryObj<Args>;

export const Busy: Story = {
  play: async ({ canvasElement }) => {
    const region = host(canvasElement, 'doras-busy-state').shadowRoot?.querySelector(
      '[part="region"]',
    );
    await expect(region).toHaveAttribute('aria-busy', 'true');
  },
};

export const Idle: Story = { args: { busy: false } };
