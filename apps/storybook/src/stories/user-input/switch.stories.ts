import '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect, fn, userEvent } from 'storybook/test';
import { argTypesFromSpec, argsFromSpec } from '../../docs/controls.ts';
import { inner } from '../helpers.ts';

interface Args {
  label: string;
  description: string;
  checked: boolean;
  onChange: (event: Event) => void;
}

const meta: Meta<Args> = {
  title: 'User input/Switch',
  component: 'doras-switch',
  parameters: { doras: { spec: specs.switch } },
  argTypes: { ...argTypesFromSpec(specs.switch), onChange: { table: { disable: true } } },
  args: {
    ...(argsFromSpec(specs.switch) as Partial<Args>),
    label: 'See your email address',
    description: 'Potluck can email you about your recipes.',
    onChange: fn(),
  },
  render: (args) =>
    html`<doras-switch
      label=${args.label}
      description=${args.description}
      ?checked=${args.checked}
      name="email"
      @change=${args.onChange}
    ></doras-switch>`,
};

export default meta;
type Story = StoryObj<Args>;

export const Off: Story = {
  play: async ({ canvasElement, args }) => {
    const toggle = await inner(canvasElement, 'switch');
    await expect(toggle).toHaveAccessibleName('See your email address');
    await expect(toggle).toHaveAccessibleDescription('Potluck can email you about your recipes.');
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard(' ');
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await expect(args.onChange).toHaveBeenCalledTimes(2);
  },
};

export const On: Story = { args: { checked: true } };
