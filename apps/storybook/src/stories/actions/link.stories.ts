import '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect } from 'storybook/test';
import { argTypesFromSpec, argsFromSpec } from '../../docs/controls.ts';
import { host, inner, textIn } from '../helpers.ts';

interface Args {
  text: string;
  href: string;
  newTab: boolean;
}

const meta: Meta<Args> = {
  title: 'Actions/Link',
  component: 'doras-link',
  parameters: { doras: { spec: specs.link } },
  argTypes: {
    text: { control: 'text', description: 'The link’s text, in the default slot.' },
    ...argTypesFromSpec(specs.link),
  },
  args: {
    ...(argsFromSpec(specs.link) as Partial<Args>),
    text: 'Manage your account on Bluesky',
    href: 'https://bsky.app/settings',
  },
  render: (args) =>
    html`<doras-link href=${args.href} ?new-tab=${args.newTab}>${args.text}</doras-link>`,
};

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const link = await inner(canvasElement, 'link');
    await expect(link).toHaveAttribute('href', 'https://bsky.app/settings');
    await expect(link).not.toHaveAttribute('target');
  },
};

/** A link that opens a new tab says so, in its name too. */
export const NewTab: Story = {
  name: 'Opens a new tab',
  args: { newTab: true },
  play: async ({ canvasElement }) => {
    const link = await inner(canvasElement, 'link');
    const hint = textIn(host(canvasElement, 'doras-link'), 'link.opensInNewTab');
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(link).toHaveAccessibleName(`Manage your account on Bluesky ${hint}`);
  },
};

export const InRunningText: Story = {
  name: 'In running text',
  render: (args) =>
    html`<p style="max-inline-size: 30rem">
      Your account is hosted by Bluesky. To change your password,
      <doras-link href=${args.href} ?new-tab=${args.newTab}>go to your Bluesky settings</doras-link
      >.
    </p>`,
};

export const Hover: Story = { parameters: { pseudo: { hover: true } } };

export const Focus: Story = { parameters: { pseudo: { focusVisible: true } } };
