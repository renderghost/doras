import '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect } from 'storybook/test';
import { argTypesFromSpec } from '../../docs/controls.ts';
import { host } from '../helpers.ts';

interface Args {
  handle: string;
}

const meta: Meta<Args> = {
  title: 'Identity/Handle',
  component: 'doras-handle',
  parameters: { doras: { spec: specs.handle } },
  argTypes: argTypesFromSpec(specs.handle),
  args: { handle: 'sam.bsky.social' },
  render: (args) => html`<p>Signed in as <doras-handle handle=${args.handle}></doras-handle>.</p>`,
};

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const bdi = host(canvasElement, 'doras-handle').shadowRoot?.querySelector('bdi');
    await expect(bdi?.textContent).toBe('@sam.bsky.social');
  },
};

export const InArabicText: Story = {
  name: 'Inside Arabic text',
  render: (args) =>
    html`<p dir="rtl" lang="ar">
      سجّلت الدخول باسم <doras-handle handle=${args.handle}></doras-handle>.
    </p>`,
};

export const Long: Story = {
  render: () =>
    html`<p style="max-inline-size: 14rem">
      Signed in as
      <doras-handle handle="averyveryverylonghandlethatkeepsgoing.blacksky.app"></doras-handle>.
    </p>`,
  play: async ({ canvasElement }) => {
    const p = canvasElement.querySelector('p');
    await expect((p?.scrollWidth ?? 0) <= (p?.clientWidth ?? 0) + 1).toBe(true);
  },
};
