import '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import { argTypesFromSpec, argsFromSpec } from '../../docs/controls.ts';
import { ICONS, focusInside, host, inner, textFor } from './helpers.ts';

interface Args {
  label: string;
  variant: 'primary' | 'secondary' | 'tertiary';
  type: 'button' | 'submit' | 'reset';
  busy: boolean;
  busyLabel: string;
  fullWidth: boolean;
  onClick: (event: Event) => void;
}

/** The label: the app's text, or the catalogue's “Continue” in the toolbar's locale. */
const labelFor = (args: Args, globals: Record<string, unknown>) =>
  args.label || textFor(globals, 'common.continue');

const meta: Meta<Args> = {
  title: 'Actions/Button',
  component: 'doras-button',
  parameters: { doras: { spec: specs.button } },
  argTypes: {
    label: {
      control: 'text',
      description: 'The label, in the default slot. Empty uses “Continue” in the current locale.',
    },
    ...argTypesFromSpec(specs.button),
    onClick: { table: { disable: true } },
  },
  args: {
    ...(argsFromSpec(specs.button) as Partial<Args>),
    label: '',
    busyLabel: '',
    onClick: fn(),
  },
  render: (args, { globals }) =>
    html`<doras-button
      variant=${args.variant}
      type=${args.type}
      ?busy=${args.busy}
      busy-label=${args.busyLabel || nothing}
      ?full-width=${args.fullWidth}
      @click=${args.onClick}
      >${labelFor(args, globals)}</doras-button
    >`,
};

export default meta;
type Story = StoryObj<Args>;

export const Primary: Story = {
  play: async ({ canvasElement, args }) => {
    const button = await inner(canvasElement, 'button');
    await expect(focusInside(host(canvasElement, 'doras-button'))).toBe(button);
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(3);
  },
};

export const Secondary: Story = { args: { variant: 'secondary' } };

export const Tertiary: Story = { args: { variant: 'tertiary', label: 'Try another provider' } };

export const Hover: Story = { parameters: { pseudo: { hover: true } } };

export const Focus: Story = { parameters: { pseudo: { focusVisible: true } } };

/** While busy, the label says what's happening, and presses do nothing. */
export const Busy: Story = {
  args: { busy: true, busyLabel: 'Checking…' },
  play: async ({ canvasElement, args }) => {
    const button = await inner(canvasElement, 'button');
    await expect(button).toHaveAccessibleName('Checking…');
    await userEvent.click(button);
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
    const status = canvasElement
      .querySelector('doras-button')
      ?.shadowRoot?.querySelector('[role="status"]');
    await expect(status).toHaveTextContent('Checking…');
  },
};

export const BusyWithoutLabel: Story = {
  name: 'Busy, keeping its label',
  args: { busy: true },
};

export const FullWidth: Story = { name: 'Full width', args: { fullWidth: true } };

export const WithIcons: Story = {
  name: 'With icons',
  render: (args) =>
    html`<doras-button variant=${args.variant}
      ><span slot="icon-start">${ICONS.keyRound}</span>Use a passkey</doras-button
    >`,
};

export const LongLabel: Story = {
  name: 'Long label',
  args: { label: 'Kontowiederherstellungsschlüssel anfordern' },
  render: (args) =>
    html`<div style="max-inline-size: 16rem">
      <doras-button full-width variant=${args.variant}>${args.label}</doras-button>
    </div>`,
};

/** A submit button submits its form. While busy, it doesn't. */
export const SubmitsItsForm: Story = {
  name: 'Submits its form',
  args: { type: 'submit' },
  render: (args) =>
    html`<form
      @submit=${(e: SubmitEvent) => {
        e.preventDefault();
        args.onClick(e);
      }}
    >
      <doras-button type="submit" ?busy=${args.busy}>Send the code</doras-button>
    </form>`,
  play: async ({ canvasElement, args }) => {
    await userEvent.click(await inner(canvasElement, 'button'));
    await waitFor(() => expect(args.onClick).toHaveBeenCalledTimes(1));
    const submitted = (args.onClick as ReturnType<typeof fn>).mock.calls[0]?.[0] as Event;
    await expect(submitted.type).toBe('submit');
  },
};

export const ButtonsSideBySide: Story = {
  name: 'Primary and secondary together',
  render: () =>
    html`<div style="display: flex; flex-wrap: wrap; gap: 0.75rem">
      <doras-button>Send the code</doras-button>
      <doras-button variant="secondary">Use a password</doras-button>
      <doras-button variant="tertiary">Try another provider</doras-button>
    </div>`,
};
