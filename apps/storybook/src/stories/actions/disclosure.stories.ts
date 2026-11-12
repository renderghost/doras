import '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect, fn, userEvent } from 'storybook/test';
import { argTypesFromSpec, argsFromSpec } from '../../docs/controls.ts';
import { host, inner } from '../helpers.ts';

interface Args {
  summary: string;
  open: boolean;
  variant: 'panel' | 'link';
  onToggle: (event: Event) => void;
}

const meta: Meta<Args> = {
  title: 'Actions/Disclosure',
  component: 'doras-disclosure',
  parameters: { doras: { spec: specs.disclosure } },
  argTypes: {
    summary: { control: 'text', description: 'The trigger’s text, in the summary slot.' },
    ...argTypesFromSpec(specs.disclosure),
    onToggle: { table: { disable: true } },
  },
  args: {
    ...(argsFromSpec(specs.disclosure) as Partial<Args>),
    summary: 'Set a new password instead',
    onToggle: fn(),
  },
  render: (args) =>
    html`<doras-disclosure
      ?open=${args.open}
      variant=${args.variant}
      @doras-toggle=${args.onToggle}
    >
      <span slot="summary">${args.summary}</span>
      <p dir="auto">You'll choose a new password on Bluesky's page. Your passkeys keep working.</p>
    </doras-disclosure>`,
};

export default meta;
type Story = StoryObj<Args>;

export const Closed: Story = {
  play: async ({ canvasElement, args }) => {
    const trigger = await inner(canvasElement, 'button');
    const element = host<HTMLElement>(canvasElement, 'doras-disclosure');
    const content = element.shadowRoot?.querySelector('#content');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(content).not.toBeVisible();

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(content).toBeVisible();
    await expect(args.onToggle).toHaveBeenLastCalledWith(
      expect.objectContaining({ detail: { open: true } }),
    );

    await userEvent.keyboard('{Enter}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(element.shadowRoot?.activeElement).toBe(trigger);
  },
};

export const Open: Story = { args: { open: true } };

export const LinkStyle: Story = {
  name: 'Link style',
  args: { variant: 'link', summary: 'Create another Atmosphere account anyway' },
};

export const Hover: Story = { parameters: { pseudo: { hover: true } } };

export const Focus: Story = { parameters: { pseudo: { focusVisible: true } } };
