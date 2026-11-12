import '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect, fn, userEvent } from 'storybook/test';
import { argTypesFromSpec, argsFromSpec } from '../../docs/controls.ts';
import { focusInside, host, inner, textIn } from './helpers.ts';

interface Args {
  fullWidth: boolean;
  onClick: (event: Event) => void;
}

const meta: Meta<Args> = {
  title: 'Actions/Continue with Atmosphere',
  component: 'doras-continue-with-atmosphere',
  parameters: { doras: { spec: specs['continue-with-atmosphere'] } },
  argTypes: {
    ...argTypesFromSpec(specs['continue-with-atmosphere']),
    onClick: { table: { disable: true } },
  },
  args: { ...(argsFromSpec(specs['continue-with-atmosphere']) as Partial<Args>), onClick: fn() },
  render: (args) =>
    html`<doras-continue-with-atmosphere
      ?full-width=${args.fullWidth}
      @click=${args.onClick}
    ></doras-continue-with-atmosphere>`,
};

export default meta;
type Story = StoryObj<Args>;

/** Its label is locked copy from the catalogue, in the page's language. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const button = await inner(canvasElement, 'button');
    const element = host<HTMLElement>(canvasElement, 'doras-continue-with-atmosphere');
    await expect(button).toHaveAccessibleName(textIn(element, 'atmosphere.continue'));
    await expect(focusInside(element)).toBe(button);
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const FullWidth: Story = { name: 'Full width', args: { fullWidth: true } };

export const Hover: Story = { parameters: { pseudo: { hover: true } } };

export const Focus: Story = { parameters: { pseudo: { focusVisible: true } } };

/** In a 320px column, long languages wrap onto two lines instead of overflowing. */
export const Narrow: Story = {
  name: 'In a narrow column',
  render: (args) =>
    html`<div style="max-inline-size: 15rem">
      <doras-continue-with-atmosphere
        full-width
        @click=${args.onClick}
      ></doras-continue-with-atmosphere>
    </div>`,
  play: async ({ canvasElement }) => {
    const button = await inner(canvasElement, 'button');
    await expect(button.scrollWidth).toBeLessThanOrEqual(button.clientWidth + 1);
  },
};
