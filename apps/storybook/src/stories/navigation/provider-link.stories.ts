import '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect } from 'storybook/test';
import { argTypesFromSpec, argsFromSpec } from '../../docs/controls.ts';
import { host, textIn } from '../helpers.ts';

interface Args {
  provider: string;
  href: string;
  sameTab: boolean;
}

const meta: Meta<Args> = {
  title: 'Navigation/Provider link',
  component: 'doras-provider-link',
  parameters: { doras: { spec: specs['provider-link'] } },
  argTypes: argTypesFromSpec(specs['provider-link']),
  args: {
    ...(argsFromSpec(specs['provider-link']) as Partial<Args>),
    provider: 'bluesky',
    href: 'https://bsky.app/settings',
  },
  render: (args) =>
    html`<doras-provider-link
      provider=${args.provider}
      href=${args.href}
      ?same-tab=${args.sameTab}
    ></doras-provider-link>`,
};

export default meta;
type Story = StoryObj<Args>;

/** It names the provider, and says it opens a new tab. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const element = host(canvasElement, 'doras-provider-link');
    const link = element.shadowRoot?.querySelector('doras-link')?.shadowRoot?.querySelector('a');
    await expect(link).toHaveAttribute('target', '_blank');
    // The provider's name is isolated in the text, so allow the isolation marks.
    const expected = `${textIn(element, 'providerLink.manage', { provider: 'Bluesky' })} ${textIn(element, 'link.opensInNewTab')}`;
    const pattern = expected
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace('Bluesky', '\u2068?Bluesky\u2069?');
    await expect(link).toHaveAccessibleName(new RegExp(`^${pattern}$`));
  },
};

export const SameTab: Story = { name: 'Same tab', args: { sameTab: true } };
