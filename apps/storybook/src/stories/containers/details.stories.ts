import '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import { argTypesFromSpec, argsFromSpec } from '../../docs/controls.ts';
import { host } from '../helpers.ts';

interface Args {
  open: boolean;
  onToggle: (event: Event) => void;
}

const meta: Meta<Args> = {
  title: 'Containers/Details',
  component: 'doras-details',
  parameters: { doras: { spec: specs.details } },
  argTypes: { ...argTypesFromSpec(specs.details), onToggle: { table: { disable: true } } },
  args: { ...(argsFromSpec(specs.details) as Partial<Args>), onToggle: fn() },
  render: (args) =>
    html`<doras-details
      ?open=${args.open}
      @doras-toggle=${args.onToggle}
      style="max-inline-size: 30rem"
    >
      <span slot="summary">Technical details</span>
      <ul>
        <li><code>repo:app.potluck.recipe</code></li>
        <li><code>rpc:app.bsky.actor.getProfile?aud=did:web:api.bsky.app</code></li>
      </ul>
    </doras-details>`,
};

export default meta;
type Story = StoryObj<Args>;

export const Closed: Story = {
  play: async ({ canvasElement, args }) => {
    const details = host(canvasElement, 'doras-details').shadowRoot?.querySelector(
      'details',
    ) as HTMLDetailsElement;
    await userEvent.click(details.querySelector('summary') as HTMLElement);
    await waitFor(() => expect(details.open).toBe(true));
    await waitFor(() =>
      expect(args.onToggle).toHaveBeenCalledWith(
        expect.objectContaining({ detail: { open: true } }),
      ),
    );
  },
};

export const Open: Story = { args: { open: true } };
