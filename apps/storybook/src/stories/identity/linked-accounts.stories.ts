import '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect } from 'storybook/test';
import { argTypesFromSpec } from '../../docs/controls.ts';
import { host } from '../helpers.ts';

interface Args {
  appName: string;
  appDomain: string;
  name: string;
  handle: string;
  provider: string;
}

const meta: Meta<Args> = {
  title: 'Identity/Linked accounts',
  component: 'doras-linked-accounts',
  parameters: { doras: { spec: specs['linked-accounts'] } },
  argTypes: argTypesFromSpec(specs['linked-accounts']),
  args: {
    appName: 'Potluck',
    appDomain: 'potluck.kitchen',
    name: 'Sam Rivera',
    handle: 'sam.bsky.social',
    provider: 'bluesky',
  },
  render: (args) =>
    html`<div style="max-inline-size: 26rem">
      <doras-linked-accounts
        app-name=${args.appName}
        app-domain=${args.appDomain}
        name=${args.name}
        handle=${args.handle}
        provider=${args.provider}
      ></doras-linked-accounts>
    </div>`,
};

export default meta;
type Story = StoryObj<Args>;

/** The link badge sits exactly on the centre of the seam, in either direction. */
async function expectBadgeCentred(canvasElement: HTMLElement) {
  const root = host(canvasElement, 'doras-linked-accounts').shadowRoot;
  const pair = root?.querySelector('.pair')?.getBoundingClientRect();
  const badge = root?.querySelector('.link')?.getBoundingClientRect();
  if (!pair || !badge) throw new Error('No pair or badge');
  await expect(Math.abs(badge.left + badge.width / 2 - (pair.left + pair.width / 2))).toBeLessThan(
    1,
  );
  await expect(Math.abs(badge.top + badge.height / 2 - (pair.top + pair.height / 2))).toBeLessThan(
    1,
  );
}

export const Default: Story = {
  play: async ({ canvasElement }) => expectBadgeCentred(canvasElement),
};

export const RightToLeft: Story = {
  name: 'Right to left',
  render: (args) =>
    html`<div dir="rtl" lang="ar" style="max-inline-size: 26rem">
      <doras-linked-accounts
        app-name=${args.appName}
        app-domain=${args.appDomain}
        name="رنا خليل"
        handle="rana.blacksky.app"
        provider="blacksky"
      ></doras-linked-accounts>
    </div>`,
  play: async ({ canvasElement }) => expectBadgeCentred(canvasElement),
};

export const LongHandle: Story = {
  name: 'Long handle',
  args: { handle: 'maximilian-alexander-von-hohenzollern.eurosky.social', provider: 'eurosky' },
  play: async ({ canvasElement }) => expectBadgeCentred(canvasElement),
};
