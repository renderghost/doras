import '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect } from 'storybook/test';
import { argTypesFromSpec, argsFromSpec } from '../../docs/controls.ts';
import { inner } from '../helpers.ts';

interface Args {
  label: string;
  hint: string;
  error: string;
  value: string;
  required: boolean;
}

const meta: Meta<Args> = {
  title: 'User input/Email field',
  component: 'doras-email-field',
  parameters: { doras: { spec: specs['email-field'] } },
  argTypes: argTypesFromSpec(specs['email-field']),
  args: {
    ...(argsFromSpec(specs['email-field']) as Partial<Args>),
    label: 'Email address',
    hint: 'The one your Atmosphere account uses.',
    error: '',
    value: '',
  },
  render: (args) =>
    html`<doras-email-field
      label=${args.label}
      hint=${args.hint}
      error=${args.error}
      name="email"
      .value=${args.value}
      ?required=${args.required}
    ></doras-email-field>`,
};

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const input = await inner(canvasElement, 'textbox');
    await expect(input).toHaveAttribute('type', 'email');
    await expect(input).toHaveAttribute('autocomplete', 'email');
    await expect(input).toHaveAttribute('spellcheck', 'false');
  },
};

export const Invalid: Story = { args: { error: 'Enter an email address, like jo@example.com' } };

export const Filled: Story = { args: { value: 'jo.park@example.com' } };
