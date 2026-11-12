import '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect, userEvent } from 'storybook/test';
import { argTypesFromSpec, argsFromSpec } from '../../docs/controls.ts';
import { host, inner, textIn } from '../helpers.ts';

interface Args {
  label: string;
  hint: string;
  error: string;
  value: string;
  purpose: 'current' | 'new';
}

const meta: Meta<Args> = {
  title: 'User input/Password field',
  component: 'doras-password-field',
  parameters: { doras: { spec: specs['password-field'] } },
  argTypes: argTypesFromSpec(specs['password-field']),
  args: {
    ...(argsFromSpec(specs['password-field']) as Partial<Args>),
    label: 'Password',
    hint: '',
    error: '',
    value: '',
  },
  render: (args) =>
    html`<doras-password-field
      label=${args.label}
      hint=${args.hint}
      error=${args.error}
      purpose=${args.purpose}
      name="password"
      .value=${args.value}
    ></doras-password-field>`,
};

export default meta;
type Story = StoryObj<Args>;

export const SigningIn: Story = {
  name: 'Signing in',
  play: async ({ canvasElement }) => {
    const element = host(canvasElement, 'doras-password-field');
    const input = element.shadowRoot?.querySelector('input');
    await expect(input).toHaveAttribute('type', 'password');
    await expect(input).toHaveAttribute('autocomplete', 'current-password webauthn');
    const toggle = await inner(canvasElement, 'button');
    await expect(toggle).toHaveAccessibleName(textIn(element, 'password.show'));
    await userEvent.click(toggle);
    await expect(input).toHaveAttribute('type', 'text');
    await expect(toggle).toHaveAccessibleName(textIn(element, 'password.hide'));
  },
};

export const ChoosingOne: Story = {
  name: 'Choosing a password',
  args: { purpose: 'new', label: 'Choose a password', hint: 'At least 8 characters.' },
  play: async ({ canvasElement }) => {
    const input = host(canvasElement, 'doras-password-field').shadowRoot?.querySelector('input');
    await expect(input).toHaveAttribute('autocomplete', 'new-password');
  },
};

export const Invalid: Story = { args: { error: 'Enter your password' } };

/** The browser's passkey suggestion goes in the suggestion slot. Browser mocks (#15) will draw it. */
export const WithPasskeySuggestion: Story = {
  name: 'With a passkey suggestion',
  render: (args) =>
    html`<doras-password-field label=${args.label} purpose="current" name="password">
      <p slot="suggestion" style="margin: 0; font-size: 0.875rem">
        Sample slot content: the browser offers a saved passkey here.
      </p>
    </doras-password-field>`,
};
