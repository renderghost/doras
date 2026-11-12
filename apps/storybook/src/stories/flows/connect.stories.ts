import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { expect, waitFor } from 'storybook/test';
import { flowMeta, measured, press, type FlowArgs } from './flow-meta.ts';

const meta: Meta<FlowArgs> = { ...flowMeta, title: 'Flows/Connect' };
export default meta;
type Story = StoryObj<FlowArgs>;

/** What Potluck can and can't do, in its own words, and the optional permission. */
export const Full: Story = {
  tags: ['page'],
  args: { start: 'pv-connect' },
};

/** Potluck hosts the new account, so there's nothing to approve. */
export const Short: Story = {
  tags: ['page'],
  args: { start: 'pv-ready', scenario: 'jo' },
};

/** Cancelled: back in Potluck, not signed in, and told so. */
export const Cancelled: Story = {
  args: { start: 'pv-connect' },
  play: async ({ canvasElement, args }) => {
    await press(canvasElement, /^Cancel$/);
    await waitFor(() =>
      expect(canvasElement.querySelector('doras-notice')?.textContent).toMatch(
        /You didn’t connect/,
      ),
    );
    await expect(measured(args.onMeasure)).toEqual(['doras.connect_cancelled']);
  },
};
