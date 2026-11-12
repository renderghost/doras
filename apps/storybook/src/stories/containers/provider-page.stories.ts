import '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';
import { host, textIn } from '../helpers.ts';

const meta: Meta = {
  title: 'Containers/Provider page shell',
  component: 'doras-provider-page',
  parameters: { doras: { spec: specs['provider-page'] }, layout: 'fullscreen' },
  render: () =>
    html`<doras-provider-page provider="bluesky" app-name="Potluck">
      <doras-card>
        <h1 style="margin: 0 0 1rem; font-size: 1.5rem">Sign in to Bluesky</h1>
        <doras-password-field label="Password" purpose="current"></doras-password-field>
        <p><doras-button full-width>Sign in</doras-button></p>
      </doras-card>
    </doras-provider-page>`,
};

export default meta;
type Story = StoryObj;

/** Landmarks for the header, main and footer; the footer says the app never sees the password. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const page = host(canvasElement, 'doras-provider-page');
    const shadow = within(canvasElement);
    await expect(await shadow.findByShadowRole('main')).toBeTruthy();
    await expect(await shadow.findByShadowRole('banner')).toBeTruthy();
    const footer = page.shadowRoot?.querySelector('footer')?.textContent ?? '';
    await expect(footer.replace(/[⁨⁩]/g, '')).toContain(
      textIn(page, 'provider.foot', { provider: 'Bluesky', app: 'Potluck' }),
    );
  },
};
