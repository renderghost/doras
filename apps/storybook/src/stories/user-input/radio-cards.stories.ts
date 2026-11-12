import '@doras/components';
import type { DorasRadioCards, RadioCardOption } from '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect, fn, userEvent } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';
import { argTypesFromSpec, argsFromSpec } from '../../docs/controls.ts';
import { host } from '../helpers.ts';

interface Args {
  label: string;
  hint: string;
  error: string;
  value: string;
  required: boolean;
  onChange: (event: Event) => void;
}

const PROVIDERS: RadioCardOption[] = [
  {
    value: 'bluesky',
    label: 'Bluesky',
    description: 'The biggest provider, run by Bluesky Social.',
  },
  { value: 'blacksky', label: 'Blacksky', description: 'Run by and for Black communities.' },
  { value: 'eurosky', label: 'Eurosky', description: 'Hosted in the European Union.' },
];

const meta: Meta<Args> = {
  title: 'User input/Radio cards',
  component: 'doras-radio-cards',
  parameters: { doras: { spec: specs['radio-cards'] } },
  argTypes: { ...argTypesFromSpec(specs['radio-cards']), onChange: { table: { disable: true } } },
  args: {
    ...(argsFromSpec(specs['radio-cards']) as Partial<Args>),
    label: 'Where should your account live?',
    hint: 'Your provider keeps your account safe. You can move later.',
    error: '',
    value: '',
    onChange: fn(),
  },
  render: (args) =>
    html`<doras-radio-cards
      label=${args.label}
      hint=${args.hint}
      error=${args.error}
      name="provider"
      .value=${args.value}
      .options=${PROVIDERS}
      ?required=${args.required}
      @change=${args.onChange}
    ></doras-radio-cards>`,
};

export default meta;
type Story = StoryObj<Args>;

/** Nothing is chosen until someone chooses. */
export const NothingChosen: Story = {
  name: 'Nothing chosen',
  play: async ({ canvasElement, args }) => {
    const group = host<DorasRadioCards>(canvasElement, 'doras-radio-cards');
    const radios = await within(canvasElement).findAllByShadowRole('radio');
    await expect(radios).toHaveLength(3);
    for (const radio of radios) await expect(radio).not.toBeChecked();
    await userEvent.click(radios[1] as HTMLElement);
    await expect(radios[1]).toBeChecked();
    await expect(group.value).toBe('blacksky');
    await expect(args.onChange).toHaveBeenCalledTimes(1);
  },
};

export const Chosen: Story = { args: { value: 'eurosky' } };

export const Invalid: Story = { args: { error: 'Choose where your account should live' } };
