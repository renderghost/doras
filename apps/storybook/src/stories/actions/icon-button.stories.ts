import '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect, fn, userEvent } from 'storybook/test';
import { argTypesFromSpec } from '../../docs/controls.ts';
import { ICONS, focusInside, host, inner, textFor, textIn } from '../helpers.ts';

interface Args {
  label: string;
  onClick: (event: Event) => void;
}

const meta: Meta<Args> = {
  title: 'Actions/Icon button',
  component: 'doras-icon-button',
  parameters: { doras: { spec: specs['icon-button'] } },
  argTypes: {
    ...argTypesFromSpec(specs['icon-button']),
    label: {
      ...argTypesFromSpec(specs['icon-button']).label,
      description:
        'Its accessible name. Empty uses “Close” from the catalogue, in the current locale.',
    },
    onClick: { table: { disable: true } },
  },
  args: { label: '', onClick: fn() },
  render: (args, { globals }) =>
    html`<doras-icon-button
      label=${args.label || textFor(globals, 'common.close')}
      @click=${args.onClick}
      >${ICONS.x}</doras-icon-button
    >`,
};

export default meta;
type Story = StoryObj<Args>;

export const Close: Story = {
  play: async ({ canvasElement, args }) => {
    const button = await inner(canvasElement, 'button');
    const element = host<HTMLElement>(canvasElement, 'doras-icon-button');
    await expect(button).toHaveAccessibleName(textIn(element, 'common.close'));
    await expect(button.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
    await expect(button.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    await expect(focusInside(element)).toBe(button);
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Back: Story = {
  render: (args, { globals }) =>
    html`<doras-icon-button
      label=${args.label || textFor(globals, 'common.back')}
      @click=${args.onClick}
      >${ICONS.arrowLeft}</doras-icon-button
    >`,
};

export const Hover: Story = { parameters: { pseudo: { hover: true } } };

export const Focus: Story = { parameters: { pseudo: { focusVisible: true } } };
