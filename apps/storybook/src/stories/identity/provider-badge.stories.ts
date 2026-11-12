import '@doras/components';
import { PROVIDERS } from '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect } from 'storybook/test';
import { argTypesFromSpec, argsFromSpec } from '../../docs/controls.ts';
import { host } from '../helpers.ts';

interface Args {
  provider: string;
  size: 'sm' | 'md';
}

const meta: Meta<Args> = {
  title: 'Identity/Provider badge',
  component: 'doras-provider-badge',
  parameters: { doras: { spec: specs['provider-badge'] } },
  argTypes: {
    ...argTypesFromSpec(specs['provider-badge']),
    provider: { control: 'select', options: [...PROVIDERS.map((p) => p.id), 'pds.example.org'] },
  },
  args: { ...(argsFromSpec(specs['provider-badge']) as Partial<Args>), provider: 'bluesky' },
  render: (args) =>
    html`<doras-provider-badge provider=${args.provider} size=${args.size}></doras-provider-badge>`,
};

export default meta;
type Story = StoryObj<Args>;

/** No logo has a recorded permission yet, so each badge shows its initial. */
export const NoLogoYet: Story = {
  name: 'No logo yet',
  play: async ({ canvasElement }) => {
    const badge = host(canvasElement, 'doras-provider-badge').shadowRoot;
    await expect(badge?.querySelector('.tile')?.textContent?.trim()).toBe('B');
    await expect(badge?.querySelector('.name')?.textContent?.trim()).toBe('Bluesky');
  },
};

export const TypedAddress: Story = {
  name: 'An address someone typed',
  args: { provider: 'pds.example.org' },
  play: async ({ canvasElement }) => {
    const badge = host(canvasElement, 'doras-provider-badge').shadowRoot;
    await expect(badge?.querySelector('doras-icon')).toHaveAttribute('name', 'globe');
  },
};

export const EveryProvider: Story = {
  name: 'Every known provider',
  render: () =>
    html`<div style="display: flex; flex-wrap: wrap; gap: 1rem">
      ${PROVIDERS.map((p) => html`<doras-provider-badge provider=${p.id}></doras-provider-badge>`)}
    </div>`,
};
