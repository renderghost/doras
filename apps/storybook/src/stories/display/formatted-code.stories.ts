import '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect } from 'storybook/test';
import { argTypesFromSpec } from '../../docs/controls.ts';
import { host } from '../helpers.ts';

interface Args {
  code: string;
}

const meta: Meta<Args> = {
  title: 'Display/Formatted code',
  component: 'doras-formatted-code',
  parameters: { doras: { spec: specs['formatted-code'] } },
  argTypes: argTypesFromSpec(specs['formatted-code']),
  args: { code: '482913' },
  render: (args) => html`<doras-formatted-code code=${args.code}></doras-formatted-code>`,
};

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const code = host(canvasElement, 'doras-formatted-code').shadowRoot;
    await expect(code?.querySelector('bdi')).toHaveAttribute('dir', 'ltr');
    await expect(code?.querySelector('.code')).toHaveAttribute('aria-hidden', 'true');
    await expect(code?.querySelector('.visually-hidden')?.textContent).toBe('4 8 2 9 1 3');
  },
};

export const InArabicText: Story = {
  name: 'Inside Arabic text',
  render: (args) =>
    html`<p dir="rtl" lang="ar">
      رمزك هو <doras-formatted-code code=${args.code}></doras-formatted-code>.
    </p>`,
};
