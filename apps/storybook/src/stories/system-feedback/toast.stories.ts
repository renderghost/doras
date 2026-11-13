import '@doras/components';
import type { DorasToast } from '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import { argTypesFromSpec, argsFromSpec } from '../../docs/controls.ts';
import { host } from '../helpers.ts';

interface Args {
  open: boolean;
  tone: 'success' | 'info';
  onClose: (event: Event) => void;
}

const meta: Meta<Args> = {
  title: 'System feedback/Toast',
  component: 'doras-toast',
  parameters: { doras: { spec: specs.toast }, layout: 'fullscreen' },
  argTypes: { ...argTypesFromSpec(specs.toast), onClose: { table: { disable: true } } },
  args: { ...(argsFromSpec(specs.toast) as Partial<Args>), open: true, onClose: fn() },
  render: (args) =>
    html`<div style="block-size: 12rem">
      <doras-toast ?open=${args.open} tone=${args.tone} @doras-close=${args.onClose}
        >Passkey saved</doras-toast
      >
    </div>`,
};

export default meta;
type Story = StoryObj<Args>;

/** It's announced politely, and stays until it's closed: there's no timer. */
export const Open: Story = {
  play: async ({ canvasElement, args }) => {
    const toast = host<DorasToast>(canvasElement, 'doras-toast');
    await waitFor(() =>
      expect(document.querySelector('[data-doras-announcer] [role="status"]')).toHaveTextContent(
        'Passkey saved',
      ),
    );
    const close = toast.shadowRoot
      ?.querySelector('doras-icon-button')
      ?.shadowRoot?.querySelector('button');
    await userEvent.click(close as HTMLElement);
    await expect(toast.open).toBe(false);
    await expect(args.onClose).toHaveBeenCalledTimes(1);
    // Open again, so the docs page, the visual check and the accessibility
    // audit see the toast, not an empty page.
    toast.open = true;
    await toast.updateComplete;
    await expect(toast.open).toBe(true);
  },
};

export const Info: Story = { args: { tone: 'info' } };
