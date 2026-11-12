import '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect, waitFor } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';
import { argTypesFromSpec, argsFromSpec } from '../../docs/controls.ts';
import { host } from '../helpers.ts';

interface Args {
  name: string;
  src: string;
  size: 'sm' | 'md' | 'lg' | 'xl';
  decorative: boolean;
}

const meta: Meta<Args> = {
  title: 'Identity/Avatar',
  component: 'doras-avatar',
  parameters: { doras: { spec: specs.avatar } },
  argTypes: argTypesFromSpec(specs.avatar),
  args: { ...(argsFromSpec(specs.avatar) as Partial<Args>), name: 'Sam Rivera', src: '' },
  render: (args) =>
    html`<doras-avatar
      name=${args.name}
      src=${args.src}
      size=${args.size}
      ?decorative=${args.decorative}
    ></doras-avatar>`,
};

export default meta;
type Story = StoryObj<Args>;

export const Initials: Story = {
  play: async ({ canvasElement }) => {
    const img = await within(canvasElement).findByShadowRole('img');
    await expect(img).toHaveAccessibleName('Sam Rivera');
    await expect(img).toHaveTextContent('SR');
  },
};

/** A picture that fails to load falls back to initials. */
export const BrokenPicture: Story = {
  name: 'Picture that fails to load',
  args: { src: 'https://invalid.example/missing.png' },
  play: async ({ canvasElement }) => {
    const avatar = host(canvasElement, 'doras-avatar');
    await waitFor(() => expect(avatar.shadowRoot?.querySelector('img')).toBeNull());
  },
};

export const AnyScript: Story = {
  name: 'Names in any script',
  render: () =>
    html`<div style="display: flex; gap: 0.75rem">
      ${['Élodie Durand', '山田 太郎', 'رنا خليل', '🌻 Sunny', '👩🏽‍🍳 Chef'].map(
        (n) => html`<doras-avatar name=${n} size="lg"></doras-avatar>`,
      )}
    </div>`,
};

export const Sizes: Story = {
  render: () =>
    html`<div style="display: flex; gap: 0.75rem; align-items: center">
      ${(['sm', 'md', 'lg', 'xl'] as const).map(
        (s) => html`<doras-avatar name="Sam Rivera" size=${s}></doras-avatar>`,
      )}
    </div>`,
};
