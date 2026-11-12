import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { withoutIsolation } from '@doras/i18n';
import { within } from 'shadow-dom-testing-library';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import './example-chip.ts';
import { argTypesFromSpec, argsFromSpec } from '../docs/controls.ts';
import type { ComponentSpec } from '../docs/spec.ts';
import spec from './example-chip.spec.json';
import type { ChipTone } from './example-chip.ts';

interface Args {
  label: string;
  tone: ChipTone;
  selected: boolean;
  removable: boolean;
  onToggle: (event: Event) => void;
  onRemove: (event: Event) => void;
}

// Sample labels in each test locale, so the locale toolbar shows a change.
const LABELS: Record<string, string> = {
  'en-GB': 'Passkey',
  pseudo: '[Ƥáššķéý one]',
  ar: 'مفتاح المرور',
  de: 'Passkey',
  ja: 'パスキー',
};

const meta: Meta<Args> = {
  title: 'Contributing/Example chip',
  component: 'doras-example-chip',
  parameters: { doras: { spec } },
  // Controls come from the spec's props.
  argTypes: {
    ...argTypesFromSpec(spec as ComponentSpec),
    label: {
      ...argTypesFromSpec(spec as ComponentSpec).label,
      description: 'The chip’s text. Leave empty to use a sample label in the current locale.',
    },
    onToggle: { table: { disable: true } },
    onRemove: { table: { disable: true } },
  },
  args: {
    ...(argsFromSpec(spec as ComponentSpec) as Partial<Args>),
    label: '',
    onToggle: fn(),
    onRemove: fn(),
  },
  render: (args, { globals }) =>
    html`<doras-example-chip
      label=${args.label || LABELS[String(globals.locale)] || 'Passkey'}
      tone=${args.tone}
      ?selected=${args.selected}
      ?removable=${args.removable}
      @doras-toggle=${args.onToggle}
      @doras-remove=${args.onRemove}
    ></doras-example-chip>`,
};

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    // The chip draws its buttons in its shadow root, so queries pierce it.
    // Queries don't use names, so the test passes in every locale.
    const [chip] = await within(canvasElement).findAllByShadowRole('button');
    if (!chip) throw new Error('No chip');
    await expect(chip).toHaveAccessibleName();
    await expect(chip).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(chip);
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
    await expect(args.onToggle).toHaveBeenCalledTimes(1);
  },
};

export const Hover: Story = {
  parameters: { pseudo: { hover: true } },
};

export const Focus: Story = {
  parameters: { pseudo: { focusVisible: true } },
};

export const Selected: Story = { args: { selected: true } };

export const Removable: Story = {
  args: { removable: true },
  play: async ({ canvasElement, args }) => {
    const [chip, remove] = await within(canvasElement).findAllByShadowRole('button');
    if (!chip || !remove) throw new Error('No remove button');
    // The remove button names what it removes, in any language.
    const label = chip.textContent?.trim() ?? '';
    await expect(remove.getAttribute('aria-label')).toContain(label);
    await userEvent.click(remove);
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
  },
};

/** The remove button's name follows the page's language, even when it changes. */
export const FollowsLanguage: Story = {
  name: 'Follows the page language',
  args: { removable: true, label: 'Passkey' },
  play: async ({ canvasElement }) => {
    const wrapper = canvasElement.querySelector('.doras-story');
    if (!wrapper) throw new Error('No story wrapper');
    const removeName = async () => {
      const [, remove] = await within(canvasElement).findAllByShadowRole('button');
      return withoutIsolation(remove?.getAttribute('aria-label') ?? '');
    };
    const original = wrapper.getAttribute('lang');
    try {
      wrapper.setAttribute('lang', 'de');
      await waitFor(async () => expect(await removeName()).toBe('Passkey entfernen'));
      wrapper.setAttribute('lang', 'ja');
      await waitFor(async () => expect(await removeName()).toBe('Passkey を削除'));
    } finally {
      if (original) wrapper.setAttribute('lang', original);
    }
  },
};

export const Automated: Story = { args: { tone: 'automated', label: 'Found for you' } };

export const LongLabel: Story = {
  name: 'Long label',
  args: { label: 'Kontowiederherstellungsschlüssel', removable: true },
};
