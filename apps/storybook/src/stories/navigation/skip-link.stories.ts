import '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect } from 'storybook/test';
import { host } from '../helpers.ts';

const meta: Meta = {
  title: 'Navigation/Skip link',
  component: 'doras-skip-link',
  parameters: { doras: { spec: specs['skip-link'] } },
  render: () =>
    html`<div style="position: relative; min-block-size: 10rem">
      <doras-skip-link target="main-content"></doras-skip-link>
      <header style="padding: 1rem">Bluesky · Atmosphere provider</header>
      <main id="main-content" style="padding: 1rem">
        <h1 style="margin: 0">Sign in to Bluesky</h1>
      </main>
    </div>`,
};

export default meta;
type Story = StoryObj;

/** Hidden until focused; activating it moves focus to the main content. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const skip = host<HTMLElement>(canvasElement, 'doras-skip-link');
    const link = skip.shadowRoot?.querySelector('a') as HTMLAnchorElement;
    await expect(link.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      skip.getBoundingClientRect().top + 1,
    );
    link.focus();
    await expect(link.getBoundingClientRect().bottom).toBeGreaterThan(
      skip.getBoundingClientRect().top,
    );
    link.click();
    await expect(document.activeElement).toBe(canvasElement.querySelector('#main-content'));
  },
};

export const Focused: Story = { parameters: { pseudo: { focus: true } } };
