import '@doras/components';
import type { DorasTextField } from '@doras/components';
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
  name: string;
  value: string;
  required: boolean;
  autocomplete: string;
  onInput: (event: Event) => void;
}

const meta: Meta<Args> = {
  title: 'User input/Text field',
  component: 'doras-text-field',
  parameters: { doras: { spec: specs['text-field'] } },
  argTypes: { ...argTypesFromSpec(specs['text-field']), onInput: { table: { disable: true } } },
  args: {
    ...(argsFromSpec(specs['text-field']) as Partial<Args>),
    label: 'Your name',
    hint: 'As you’d like people to see it.',
    error: '',
    value: '',
    name: 'name',
    autocomplete: 'name',
    onInput: fn(),
  },
  render: (args) =>
    html`<doras-text-field
      label=${args.label}
      hint=${args.hint}
      error=${args.error}
      name=${args.name}
      .value=${args.value}
      ?required=${args.required}
      autocomplete=${args.autocomplete}
      @doras-input=${args.onInput}
    ></doras-text-field>`,
};

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const field = host<DorasTextField>(canvasElement, 'doras-text-field');
    const input = await inner(canvasElement, 'textbox');
    await expect(input).toHaveAccessibleName('Your name');
    await expect(input).toHaveAccessibleDescription('As you’d like people to see it.');
    await expect(focusInside(field)).toBe(input);
    await userEvent.keyboard('Jo');
    await expect(args.onInput).toHaveBeenCalledTimes(2);
    await expect(field.value).toBe('Jo');
  },
};

export const Invalid: Story = {
  args: { error: 'Enter your name' },
  play: async ({ canvasElement }) => {
    const input = await inner(canvasElement, 'textbox');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription(/Error: Enter your name/);
  },
};

export const Filled: Story = { args: { value: 'Jo Park' } };

export const Focus: Story = { parameters: { pseudo: { focusVisible: true } } };

/** Text composed with an input method, such as Japanese, is never validated half-typed. */
export const ComposingText: Story = {
  name: 'Composing text (IME)',
  args: { label: '名前', hint: '' },
  play: async ({ canvasElement, args }) => {
    const input = (await inner(canvasElement, 'textbox')) as HTMLInputElement;
    input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    input.value = 'やま';
    input.dispatchEvent(
      new InputEvent('input', { bubbles: true, isComposing: true, composed: true }),
    );
    await expect(args.onInput).not.toHaveBeenCalled();
    input.value = '山';
    input.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
    await expect(args.onInput).toHaveBeenCalledTimes(1);
  },
};

/** Validation happens on submit, then live as people fix the error. */
export const ValidatesOnSubmitThenLive: Story = {
  name: 'Validates on submit, then live',
  render: () => {
    const validate = (field: DorasTextField) => {
      field.error = field.value.trim() ? '' : 'Enter your name';
    };
    return html`<form
      novalidate
      @submit=${(e: SubmitEvent) => {
        e.preventDefault();
        validate((e.target as HTMLFormElement).querySelector('doras-text-field') as DorasTextField);
      }}
    >
      <doras-text-field
        label="Your name"
        name="name"
        required
        @doras-input=${(e: Event) => {
          const field = e.target as DorasTextField;
          if (field.error) validate(field);
        }}
      ></doras-text-field>
      <p><doras-button type="submit">Continue</doras-button></p>
    </form>`;
  },
  play: async ({ canvasElement }) => {
    const field = host<DorasTextField>(canvasElement, 'doras-text-field');
    const input = (await inner(canvasElement, 'textbox')) as HTMLInputElement;
    focusInside(field);
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'));
    await userEvent.keyboard('J');
    await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'false'));
  },
};
