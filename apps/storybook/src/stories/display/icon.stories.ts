import '@doras/components';
import { ICONS } from '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect } from 'storybook/test';
import { argTypesFromSpec, argsFromSpec } from '../../docs/controls.ts';
import { host } from '../helpers.ts';

interface Args {
  name: string;
  label: string;
  size: 'sm' | 'md' | 'lg' | 'xl';
}

const meta: Meta<Args> = {
  title: 'Display/Icon',
  component: 'doras-icon',
  parameters: { doras: { spec: specs.icon } },
  argTypes: {
    ...argTypesFromSpec(specs.icon),
    name: {
      ...argTypesFromSpec(specs.icon).name,
      control: 'select',
      options: ICONS.map((i) => i.name),
    },
  },
  args: { ...(argsFromSpec(specs.icon) as Partial<Args>), name: 'key-round', label: '' },
  render: (args) =>
    html`<doras-icon name=${args.name} label=${args.label} size=${args.size}></doras-icon>`,
};

export default meta;
type Story = StoryObj<Args>;

export const Decorative: Story = {
  play: async ({ canvasElement }) => {
    const svg = host(canvasElement, 'doras-icon').shadowRoot?.querySelector('svg');
    await expect(svg).toHaveAttribute('aria-hidden', 'true');
  },
};

export const Named: Story = {
  args: { name: 'circle-check', label: 'Done' },
  play: async ({ canvasElement }) => {
    const svg = host(canvasElement, 'doras-icon').shadowRoot?.querySelector('svg');
    await expect(svg).toHaveAttribute('role', 'img');
    await expect(svg).toHaveAccessibleName('Done');
  },
};

/** Arrows mirror right to left. Icons that don't point a direction never do. */
export const MirroredRightToLeft: Story = {
  name: 'Right to left',
  render: () =>
    html`<div dir="rtl" style="display: flex; gap: 1rem">
      <doras-icon name="arrow-left" size="lg"></doras-icon>
      <doras-icon name="key-round" size="lg"></doras-icon>
    </div>`,
  play: async ({ canvasElement }) => {
    const [arrow, key] = [...canvasElement.querySelectorAll('doras-icon')].map(
      (i) => getComputedStyle(i.shadowRoot?.querySelector('svg') as Element).transform,
    );
    await expect(arrow).toBe('matrix(-1, 0, 0, 1, 0, 0)');
    await expect(key).toBe('none');
  },
};

export const Sizes: Story = {
  render: () =>
    html`<div style="display: flex; gap: 1rem; align-items: center">
      ${(['sm', 'md', 'lg', 'xl'] as const).map((s) => html`<doras-icon name="mail" size=${s}></doras-icon>`)}
    </div>`,
};
