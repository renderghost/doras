import '@doras/components';
import { readHandle, type DorasHandleField, type HandleSuggestion } from '@doras/components';
import { withoutIsolation } from '@doras/i18n';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import { argTypesFromSpec, argsFromSpec } from '../../docs/controls.ts';
import { focusInside, host, inner } from '../helpers.ts';

interface Args {
  label: string;
  hint: string;
  error: string;
  value: string;
  onSelect: (event: Event) => void;
}

/** Sample accounts. In an app, lookups go to the network. */
const ACCOUNTS: HandleSuggestion[] = [
  { handle: 'sam.bsky.social', name: 'Sam Rivera', hostedBy: 'Bluesky' },
  { handle: 'samira.eurosky.social', name: 'Samira Haddad', hostedBy: 'Eurosky' },
  { handle: 'rae.blacksky.app', name: 'Rae Okafor', hostedBy: 'Blacksky' },
];

/** What an app does on doras-query: look up accounts, and offer “Did you mean” for slips. */
function lookUp(text: string): HandleSuggestion[] {
  const reading = readHandle(text);
  const query = text.trim().toLowerCase().replace(/^@+/, '');
  if (reading.kind === 'email' || query.length < 2) return [];
  const exact = ACCOUNTS.find((a) => a.handle === reading.handle);
  const corrected = exact && reading.fixes.length ? [{ ...exact, didYouMean: true }] : [];
  const others = ACCOUNTS.filter(
    (a) =>
      a !== exact &&
      (a.handle.startsWith(reading.handle) ||
        (a.name ?? '')
          .toLowerCase()
          .split(/\s+/)
          .some((w) => w.startsWith(query))),
  );
  return [...corrected, ...(exact && !corrected.length ? [exact] : []), ...others].slice(0, 5);
}

const meta: Meta<Args> = {
  title: 'User input/Handle field',
  component: 'doras-handle-field',
  parameters: { doras: { spec: specs['handle-field'] } },
  argTypes: { ...argTypesFromSpec(specs['handle-field']), onSelect: { table: { disable: true } } },
  args: {
    ...(argsFromSpec(specs['handle-field']) as Partial<Args>),
    label: 'Your handle',
    hint: 'It’s on your profile, like sam.bsky.social or rae.blacksky.app. You can type your name instead.',
    error: '',
    value: '',
    onSelect: fn(),
  },
  render: (args) =>
    html`<div style="min-block-size: 22rem; max-inline-size: 28rem">
      <doras-handle-field
        label=${args.label}
        hint=${args.hint}
        error=${args.error}
        name="handle"
        .value=${args.value}
        @doras-query=${(e: CustomEvent<{ text: string }>) => {
          (e.target as DorasHandleField).suggestions = lookUp(e.detail.text);
        }}
        @doras-select=${args.onSelect}
      ></doras-handle-field>
    </div>`,
};

export default meta;
type Story = StoryObj<Args>;

/** Typing a name suggests accounts; the arrow keys and Enter choose one. */
export const Suggesting: Story = {
  play: async ({ canvasElement, args }) => {
    const field = host<DorasHandleField>(canvasElement, 'doras-handle-field');
    const input = await inner(canvasElement, 'combobox');
    focusInside(field);
    await userEvent.keyboard('sam');
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));
    await userEvent.keyboard('{ArrowDown}');
    await expect(input).toHaveAttribute('aria-activedescendant', 'option-0');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(field.value).toBe('samira.eurosky.social');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(args.onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { handle: 'samira.eurosky.social' } }),
    );
  },
};

/** A slip such as bsky.app is offered as “Did you mean”, in the automated style. */
export const DidYouMean: Story = {
  name: 'Did you mean',
  play: async ({ canvasElement }) => {
    const field = host<DorasHandleField>(canvasElement, 'doras-handle-field');
    focusInside(field);
    await userEvent.keyboard('sam.bsky.app');
    await waitFor(() => expect(field.shadowRoot?.querySelector('.did-you-mean')).not.toBeNull());
  },
};

/** After leaving the field, it says how it read what was typed. */
export const UnderstoodDifferently: Story = {
  name: 'Understood differently',
  play: async ({ canvasElement }) => {
    const field = host<DorasHandleField>(canvasElement, 'doras-handle-field');
    const input = (await inner(canvasElement, 'combobox')) as HTMLInputElement;
    focusInside(field);
    await userEvent.keyboard('sam@bsky.social');
    input.dispatchEvent(new Event('change'));
    await waitFor(() =>
      expect(
        withoutIsolation(field.shadowRoot?.querySelector('#message')?.textContent ?? ''),
      ).toMatch(/@sam\.bsky\.social/),
    );
    await expect(field.handle).toBe('sam.bsky.social');
  },
};

export const Invalid: Story = {
  args: { value: 'sam', error: 'Enter your whole handle, like sam.bsky.social' },
};

export const LongHandle: Story = {
  name: 'Long handle',
  args: { value: `${'averyveryverylonghandle'.repeat(8)}.bsky.social` },
};
