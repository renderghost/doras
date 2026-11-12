import '@doras/components';
import { announce } from '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect, waitFor } from 'storybook/test';

const meta: Meta = {
  title: 'System feedback/Announcer',
  component: 'doras-announcer',
  parameters: { doras: { spec: specs.announcer } },
  render: () =>
    html`<doras-announcer></doras-announcer>
      <doras-button
        @click=${() => {
          announce('Passkey saved');
          announce('Signed in to Potluck');
        }}
        >Announce two messages</doras-button
      >`,
};

export default meta;
type Story = StoryObj;

/** Several messages at once are all read, in order. */
export const SeveralAtOnce: Story = {
  name: 'Several messages at once',
  play: async ({ canvasElement }) => {
    (canvasElement.querySelector('doras-button') as HTMLElement).click();
    await waitFor(() => {
      const lines = [...document.querySelectorAll('[data-doras-announcer] [role="status"] p')].map(
        (p) => p.textContent,
      );
      return expect(lines).toEqual(
        expect.arrayContaining(['Passkey saved', 'Signed in to Potluck']),
      );
    });
  },
};
