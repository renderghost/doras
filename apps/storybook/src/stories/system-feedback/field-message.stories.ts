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
  // The custom field is styled like a Doras one, so it passes the same checks.
  render: (args) =>
    html`<style>
        #custom {
          box-sizing: border-box;
          min-block-size: var(--doras-size-control-height);
          padding-inline: var(--doras-space-inset-md);
          border: var(--doras-border-width-strong) solid var(--doras-color-border-control);
          border-radius: var(--doras-radius-control);
          background: var(--doras-color-surface-default);
          color: var(--doras-color-text-default);
          font: inherit;
        }
        #custom:focus-visible {
          outline: var(--doras-border-width-focus) solid var(--doras-color-border-focus);
          outline-offset: var(--doras-focus-offset);
        }
      </style>
      <label for="custom" style="display: block; font-weight: 650">Provider address</label>
      <input id="custom" aria-describedby="custom-message" />
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
