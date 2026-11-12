import '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';
import { argTypesFromSpec, argsFromSpec } from '../../docs/controls.ts';
import { host, textIn } from '../helpers.ts';

interface Args {
  decorative: boolean;
  size: 'md' | 'lg' | 'xl';
}

const meta: Meta<Args> = {
  title: 'Display/Atmosphere mark',
  component: 'doras-atmosphere-mark',
  parameters: { doras: { spec: specs['atmosphere-mark'] } },
  argTypes: argTypesFromSpec(specs['atmosphere-mark']),
  args: argsFromSpec(specs['atmosphere-mark']) as Partial<Args>,
  render: (args) =>
    html`<doras-atmosphere-mark
      ?decorative=${args.decorative}
      size=${args.size}
    ></doras-atmosphere-mark>`,
};

export default meta;
type Story = StoryObj<Args>;

export const Named: Story = {
  play: async ({ canvasElement }) => {
    const img = await within(canvasElement).findByShadowRole('img');
    await expect(img).toHaveAccessibleName(
      textIn(host(canvasElement, 'doras-atmosphere-mark'), 'atmosphere.mark'),
    );
  },
};

export const Decorative: Story = {
  name: 'Decorative, beside its name',
  render: () =>
    html`<span style="display: inline-flex; gap: 0.5rem; align-items: center; font-weight: 700">
      <doras-atmosphere-mark decorative></doras-atmosphere-mark>Atmosphere
    </span>`,
};

export const Sizes: Story = {
  render: () =>
    html`<div style="display: flex; gap: 1rem; align-items: center">
      ${(['md', 'lg', 'xl'] as const).map((s) => html`<doras-atmosphere-mark size=${s}></doras-atmosphere-mark>`)}
    </div>`,
};
