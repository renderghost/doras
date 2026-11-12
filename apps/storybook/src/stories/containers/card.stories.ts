import '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
  title: 'Containers/Card',
  component: 'doras-card',
  parameters: { doras: { spec: specs.card } },
  render: () =>
    html`<doras-card style="max-inline-size: 26rem">
      <h1 style="margin: 0 0 1rem; font-size: 1.5rem">Sign in to Bluesky</h1>
      <doras-password-field label="Password" purpose="current"></doras-password-field>
      <p><doras-button full-width>Sign in</doras-button></p>
    </doras-card>`,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};
