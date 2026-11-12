import '@doras/components';
import type { DorasSheet } from '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import { host } from '../helpers.ts';

interface Args {
  onMeasure: (event: Event) => void;
  onClose: (event: Event) => void;
}

const step = html`<h2 style="margin: 0 0 0.75rem">Sign in to Potluck</h2>
  <p style="margin: 0 0 1rem">
    Use your Atmosphere account. If you use Bluesky or another Atmosphere app, you already have one.
  </p>
  <doras-handle-field
    label="Your handle"
    hint="It’s on your profile, like sam.bsky.social."
  ></doras-handle-field>
  <p><doras-button full-width>Continue</doras-button></p>`;

const meta: Meta<Args> = {
  title: 'Containers/Sheet',
  component: 'doras-sheet',
  // Modal stories render in their own frame on the docs page.
  parameters: {
    doras: { spec: specs.sheet },
    docs: { story: { inline: false, height: '640px' } },
    layout: 'fullscreen',
  },
  args: { onMeasure: fn(), onClose: fn() },
  render: (args) =>
    html`<div style="padding: 1.5rem; min-block-size: 600px">
      <doras-continue-with-atmosphere
        @click=${(e: Event) => {
          const sheet = (e.target as Element).ownerDocument.querySelector<DorasSheet>(
            'doras-sheet',
          );
          if (sheet) sheet.open = true;
        }}
      ></doras-continue-with-atmosphere>
      <doras-sheet
        label="Sign in to Potluck"
        app-name="Potluck"
        @doras-measure=${args.onMeasure}
        @doras-close=${args.onClose}
      >
        <doras-sheet-header slot="header"></doras-sheet-header>
        ${step}
      </doras-sheet>
    </div>`,
};

export default meta;
type Story = StoryObj<Args>;

/** Opens as a true modal, counts the door opening, and returns focus to the button when closed. */
export const OpenAndClose: Story = {
  name: 'Open and close',
  play: async ({ canvasElement, args }) => {
    const trigger = host<HTMLElement>(canvasElement, 'doras-continue-with-atmosphere');
    const sheet = host<DorasSheet>(canvasElement, 'doras-sheet');
    const triggerButton = trigger.shadowRoot?.querySelector('button') as HTMLButtonElement;
    triggerButton.focus();
    await userEvent.click(triggerButton);
    const dialog = sheet.shadowRoot?.querySelector('dialog') as HTMLDialogElement;
    await waitFor(() => expect(dialog.matches(':modal')).toBe(true));
    await expect(args.onMeasure).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { name: 'doras.door_opened' } }),
    );
    await expect(sheet.contains(document.activeElement) || document.activeElement === sheet).toBe(
      true,
    );
    const close = sheet
      .querySelector('doras-sheet-header')
      ?.shadowRoot?.querySelector('doras-icon-button')
      ?.shadowRoot?.querySelector('button') as HTMLButtonElement;
    await userEvent.click(close);
    await waitFor(() => expect(dialog.open).toBe(false));
    await waitFor(() => expect(args.onClose).toHaveBeenCalled());
    // Once only: the header's own doras-close stays inside the sheet.
    await new Promise((resolve) => setTimeout(resolve, 50));
    await expect(args.onClose).toHaveBeenCalledTimes(1);
    await expect(trigger.shadowRoot?.activeElement).toBe(triggerButton);
  },
};

const openSheet = async (canvasElement: HTMLElement) => {
  const sheet = host<DorasSheet>(canvasElement, 'doras-sheet');
  sheet.open = true;
  await sheet.updateComplete;
  // Let the opening animation finish, so the accessibility check sees the settled sheet.
  const dialog = sheet.shadowRoot?.querySelector('dialog');
  await Promise.all((dialog?.getAnimations() ?? []).map((animation) => animation.finished));
  return sheet;
};

export const Open: Story = {
  play: async ({ canvasElement }) => {
    const sheet = await openSheet(canvasElement);
    // Short content: no scrolling, so no extra tab stop.
    await expect(sheet.shadowRoot?.querySelector('.body')).not.toHaveAttribute('tabindex');
  },
};

/**
 * A close request (Escape, or the Android back gesture) closes the sheet, and
 * consumers hear doras-close once. Simulated keys are untrusted, so the test
 * makes the request directly; real Escape is checked in the browser matrix.
 */
export const CloseRequest: Story = {
  name: 'Close request',
  play: async ({ canvasElement, args }) => {
    const sheet = await openSheet(canvasElement);
    const dialog = sheet.shadowRoot?.querySelector('dialog') as HTMLDialogElement & {
      requestClose(): void;
    };
    dialog.requestClose();
    await waitFor(() => expect(dialog.open).toBe(false));
    await waitFor(() => expect(sheet.open).toBe(false));
    await waitFor(() => expect(args.onClose).toHaveBeenCalledTimes(1));
  },
};

export const Phone: Story = {
  parameters: { viewport: { defaultViewport: 'phone' } },
  globals: { viewport: { value: 'phone' } },
  play: async ({ canvasElement }) => void (await openSheet(canvasElement)),
};

/** Very tall content scrolls, and the header and foot stay put. */
export const TallContent: Story = {
  name: 'Tall content',
  render: () =>
    html`<doras-sheet label="Why choose a provider?" app-name="Potluck">
      <doras-sheet-header slot="header" back></doras-sheet-header>
      ${Array.from({ length: 14 }, (_, i) => html`<p>Paragraph ${i + 1}: providers keep your Atmosphere account safe and online.</p>`)}
    </doras-sheet>`,
  play: async ({ canvasElement }) => {
    const sheet = await openSheet(canvasElement);
    const body = sheet.shadowRoot?.querySelector('.body') as HTMLElement;
    const dialog = sheet.shadowRoot?.querySelector('dialog') as HTMLElement;
    await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    // It scrolls, so it takes keyboard focus.
    await waitFor(() => expect(body).toHaveAttribute('tabindex', '0'));
    const foot = sheet.shadowRoot?.querySelector('.foot')?.getBoundingClientRect();
    await expect(foot?.bottom ?? 0).toBeLessThanOrEqual(dialog.getBoundingClientRect().bottom + 1);
  },
};
