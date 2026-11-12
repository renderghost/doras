import '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';
import { argTypesFromSpec, argsFromSpec } from '../../docs/controls.ts';

interface Args {
  legend: string;
  hint: string;
  error: string;
}

const meta: Meta<Args> = {
  title: 'User input/Fieldset',
  component: 'doras-fieldset',
  parameters: { doras: { spec: specs.fieldset } },
  argTypes: argTypesFromSpec(specs.fieldset),
  args: {
    ...(argsFromSpec(specs.fieldset) as Partial<Args>),
    legend: 'Your provider’s address',
    hint: 'If your provider isn’t listed, type its address.',
    error: '',
  },
  render: (args) =>
    html`<doras-fieldset legend=${args.legend} hint=${args.hint} error=${args.error}>
      <doras-text-field
        label="Address"
        hint="Like provider.example"
        name="server"
      ></doras-text-field>
    </doras-fieldset>`,
};

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const group = await within(canvasElement).findByShadowRole('group');
    await expect(group).toHaveAccessibleName('Your provider’s address');
  },
};

export const Invalid: Story = { args: { error: 'Enter your provider’s address' } };
