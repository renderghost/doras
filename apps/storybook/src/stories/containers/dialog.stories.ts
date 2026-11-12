import '@doras/components';
import type { DorasDialog } from '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import { argTypesFromSpec } from '../../docs/controls.ts';
import { host } from '../helpers.ts';

interface Args {
  heading: string;
  onClose: (event: Event) => void;
}

const meta: Meta<Args> = {
  title: 'Containers/Dialog',
  component: 'doras-dialog',
  parameters: {
    doras: { spec: specs.dialog },
    docs: { story: { inline: false, height: '420px' } },
  },
  argTypes: {
    heading: argTypesFromSpec(specs.dialog).heading ?? {},
    onClose: { table: { disable: true } },
  },
  args: { heading: 'Remove this passkey?', onClose: fn() },
  render: (args) =>
    html`<div style="min-block-size: 360px">
      <doras-dialog heading=${args.heading} @doras-close=${args.onClose}>
        <p>
          You won’t be able to sign in with the passkey on your old phone. Your other passkeys keep
          working.
        </p>
        <doras-button
          slot="actions"
          variant="secondary"
          @click=${(e: Event) => (((e.target as Element).closest('doras-dialog') as DorasDialog).open = false)}
          >Keep it</doras-button
        >
        <doras-button
          slot="actions"
          @click=${(e: Event) => (((e.target as Element).closest('doras-dialog') as DorasDialog).open = false)}
          >Remove passkey</doras-button
        >
      </doras-dialog>
    </div>`,
};

export default meta;
type Story = StoryObj<Args>;

export const Open: Story = {
  play: async ({ canvasElement, args }) => {
    const dialog = host<DorasDialog>(canvasElement, 'doras-dialog');
    dialog.open = true;
    await dialog.updateComplete;
    const native = dialog.shadowRoot?.querySelector('dialog') as HTMLDialogElement;
    await expect(native.matches(':modal')).toBe(true);
    await expect(native).toHaveAttribute('role', 'alertdialog');
    const keep = dialog
      .querySelector('doras-button')
      ?.shadowRoot?.querySelector('button') as HTMLButtonElement;
    await userEvent.click(keep);
    await waitFor(() => expect(native.open).toBe(false));
    await waitFor(() => expect(args.onClose).toHaveBeenCalledTimes(1));
  },
};
