import '@doras/components';
import { withoutIsolation } from '@doras/i18n';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect } from 'storybook/test';
import { argTypesFromSpec, argsFromSpec } from '../../docs/controls.ts';
import { host, textIn } from '../helpers.ts';

interface Args {
  name: string;
  handle: string;
  avatar: string;
  provider: string;
  didYouMean: boolean;
}

const meta: Meta<Args> = {
  title: 'Identity/Account row',
  component: 'doras-account-row',
  parameters: { doras: { spec: specs['account-row'] } },
  argTypes: argTypesFromSpec(specs['account-row']),
  args: {
    ...(argsFromSpec(specs['account-row']) as Partial<Args>),
    name: 'Sam Rivera',
    handle: 'sam.bsky.social',
    avatar: '',
    provider: 'bluesky',
  },
  render: (args) =>
    html`<div style="max-inline-size: 28rem">
      <doras-account-row
        name=${args.name}
        handle=${args.handle}
        avatar=${args.avatar}
        provider=${args.provider}
        ?did-you-mean=${args.didYouMean}
      ></doras-account-row>
    </div>`,
};

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const row = host(canvasElement, 'doras-account-row');
    await expect(row.shadowRoot?.textContent).toContain('Sam Rivera');
    const badge = row.shadowRoot?.querySelector('doras-provider-badge');
    // The provider's name is isolated, so compare without the isolation marks.
    await expect(withoutIsolation(badge?.shadowRoot?.textContent ?? '')).toContain(
      textIn(row, 'identity.hostedBy', { provider: 'Bluesky' }),
    );
  },
};

export const DidYouMean: Story = { name: 'Did you mean', args: { didYouMean: true } };

export const LongNameAndHandle: Story = {
  name: 'Long name and handle',
  args: {
    name: 'Maximilian Alexander von Hohenzollern-Sigmaringen',
    handle: 'maximilian-alexander-von-hohenzollern.eurosky.social',
    provider: 'eurosky',
  },
};

export const RightToLeftName: Story = {
  name: 'Right-to-left name',
  args: { name: 'رنا خليل', handle: 'rana.blacksky.app', provider: 'blacksky' },
};

export const EmojiName: Story = { name: 'Emoji in the name', args: { name: '🌻 Sunny Day' } };

export const OwnProvider: Story = {
  name: 'On a provider someone runs',
  args: { handle: 'jo.example.org', provider: 'pds.example.org' },
};
