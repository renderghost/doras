import '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect, fn, userEvent } from 'storybook/test';
import { argTypesFromSpec, argsFromSpec } from '../../docs/controls.ts';
import { inner } from '../helpers.ts';

interface Args {
  label: string;
  back: boolean;
  onClick: (event: Event) => void;
}

const meta: Meta<Args> = {
  title: 'Navigation/Step link',
  component: 'doras-step-link',
  parameters: { doras: { spec: specs['step-link'] } },
  argTypes: {
    label: { control: 'text', description: 'The label, in the default slot.' },
    ...argTypesFromSpec(specs['step-link']),
    onClick: { table: { disable: true } },
  },
  args: {
    ...(argsFromSpec(specs['step-link']) as Partial<Args>),
    label: 'Search by name instead',
    onClick: fn(),
  },
  render: (args) =>
    html`<doras-step-link ?back=${args.back} @click=${args.onClick}
      >${args.label}</doras-step-link
    >`,
};

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const button = await inner(canvasElement, 'button');
    await expect(button).toHaveAccessibleName('Search by name instead');
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Back: Story = { args: { back: true, label: 'Try another provider' } };

export const UnderTheMainAction: Story = {
  name: 'Under the main action',
  render: () =>
    html`<div style="display: grid; gap: 0.5rem; justify-items: start; max-inline-size: 22rem">
      <doras-button full-width>I’ve got the email</doras-button>
      <doras-step-link>Try another provider</doras-step-link>
      <doras-step-link>Search by name instead</doras-step-link>
    </div>`,
};
