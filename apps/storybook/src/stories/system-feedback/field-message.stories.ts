import '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect } from 'storybook/test';
import { argTypesFromSpec, argsFromSpec } from '../../docs/controls.ts';
import { host, textIn } from '../helpers.ts';

interface Args {
  tone: 'hint' | 'error' | 'automated';
}

const meta: Meta<Args> = {
  title: 'System feedback/Field message',
  component: 'doras-field-message',
  parameters: { doras: { spec: specs['field-message'] } },
  argTypes: argTypesFromSpec(specs['field-message']),
  args: argsFromSpec(specs['field-message']) as Partial<Args>,
  render: (args) =>
    html`<label for="custom" style="display: block; font-weight: 650">Provider address</label>
      <input id="custom" aria-describedby="custom-message" style="font-size: 1rem" />
      <doras-field-message id="custom-message" tone=${args.tone}
        >Like provider.example</doras-field-message
      >`,
};

export default meta;
type Story = StoryObj<Args>;

export const Hint: Story = {};

export const Error: Story = {
  args: { tone: 'error' },
  play: async ({ canvasElement }) => {
    const message = host(canvasElement, 'doras-field-message');
    await expect(message.shadowRoot?.textContent).toContain(textIn(message, 'field.errorPrefix'));
  },
};

export const Automated: Story = { args: { tone: 'automated' } };
