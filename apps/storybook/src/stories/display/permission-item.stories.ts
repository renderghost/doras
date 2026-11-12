import '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect } from 'storybook/test';
import { argTypesFromSpec, argsFromSpec } from '../../docs/controls.ts';

interface Args {
  icon: string;
  label: string;
  reason: string;
}

const meta: Meta<Args> = {
  title: 'Display/Permission item',
  component: 'doras-permission-item',
  parameters: { doras: { spec: specs['permission-item'] } },
  argTypes: argTypesFromSpec(specs['permission-item']),
  args: {
    ...(argsFromSpec(specs['permission-item']) as Partial<Args>),
    icon: 'user-round',
    label: 'See your name and avatar',
    reason: 'so friends recognise you.',
  },
  render: (args) =>
    html`<div role="list" style="max-inline-size: 30rem">
      <doras-permission-item
        icon=${args.icon}
        label=${args.label}
        reason=${args.reason}
      ></doras-permission-item>
    </div>`,
};

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const item = canvasElement.querySelector('doras-permission-item');
    await expect(item).toHaveRole('listitem');
  },
};

export const ConnectPageList: Story = {
  name: 'On the Connect page',
  render: () =>
    html`<div role="list" style="max-inline-size: 30rem">
      <doras-permission-item
        icon="user-round"
        label="See your name and avatar"
        reason="so friends recognise you."
      ></doras-permission-item>
      <doras-permission-item
        icon="send"
        label="Post as you"
        reason="so your recipes stay yours, even if you leave Potluck."
      ></doras-permission-item>
      <doras-permission-item
        icon="users-round"
        label="See who you follow"
        reason="so people who follow you on Bluesky can find you here."
      ></doras-permission-item>
    </div>`,
};
