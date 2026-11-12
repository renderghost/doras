import '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect } from 'storybook/test';
import { argTypesFromSpec, argsFromSpec } from '../../docs/controls.ts';
import { host, textIn } from '../helpers.ts';

interface Args {
  variant: 'plain' | 'or';
}

const meta: Meta<Args> = {
  title: 'Display/Divider',
  component: 'doras-divider',
  parameters: { doras: { spec: specs.divider } },
  argTypes: argTypesFromSpec(specs.divider),
  args: argsFromSpec(specs.divider) as Partial<Args>,
  render: (args) =>
    html`<div style="max-inline-size: 24rem">
      <doras-button full-width variant="secondary">Use a passkey</doras-button>
      <doras-divider variant=${args.variant}></doras-divider>
      <doras-button full-width>Continue with a password</doras-button>
    </div>`,
};

export default meta;
type Story = StoryObj<Args>;

export const Plain: Story = {};

/** “or” is text between two decorative lines, so screen readers read it. */
export const Or: Story = {
  args: { variant: 'or' },
  play: async ({ canvasElement }) => {
    const divider = host(canvasElement, 'doras-divider');
    await expect(divider.shadowRoot?.querySelector('.or')?.textContent?.trim()).toBe(
      textIn(divider, 'divider.or'),
    );
    await expect(divider.shadowRoot?.querySelector('[role="separator"]')).toBeNull();
  },
};
