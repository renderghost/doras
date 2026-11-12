import '@doras/components';
import type { DorasCodeField } from '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect, userEvent } from 'storybook/test';
import { argTypesFromSpec, argsFromSpec } from '../../docs/controls.ts';
import { focusInside, host, inner } from '../helpers.ts';

interface Args {
  label: string;
  hint: string;
  error: string;
  value: string;
  length: number;
}

const meta: Meta<Args> = {
  title: 'User input/Code field',
  component: 'doras-code-field',
  parameters: { doras: { spec: specs['code-field'] } },
  argTypes: argTypesFromSpec(specs['code-field']),
  args: {
    ...(argsFromSpec(specs['code-field']) as Partial<Args>),
    label: 'Sign-in code',
    hint: 'It’s in the email from Bluesky.',
    error: '',
    value: '',
  },
  render: (args) =>
    html`<doras-code-field
      label=${args.label}
      hint=${args.hint}
      error=${args.error}
      length=${args.length}
      name="code"
      .value=${args.value}
    ></doras-code-field>`,
};

export default meta;
type Story = StoryObj<Args>;

/** Codes typed or pasted with spaces are fine: the form gets the digits alone. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const field = host<DorasCodeField>(canvasElement, 'doras-code-field');
    const input = await inner(canvasElement, 'textbox');
    await expect(input).toHaveAttribute('inputmode', 'numeric');
    await expect(input).toHaveAttribute('autocomplete', 'one-time-code');
    focusInside(field);
    await userEvent.keyboard('123 456');
    await expect(field.value).toBe('123 456');
    await expect(field.code).toBe('123456');
  },
};

export const Filled: Story = { args: { value: '482 913' } };

export const Invalid: Story = {
  args: { value: '48291', error: 'Enter all 6 digits of the code' },
};

export const WithCodeFromMail: Story = {
  name: 'With the code from Mail',
  render: (args) =>
    html`<doras-code-field label=${args.label} hint=${args.hint} name="code">
      <p slot="suggestion" style="margin: 0; font-size: 0.875rem">
        Sample slot content: the browser offers the code from Mail here.
      </p>
    </doras-code-field>`,
};
