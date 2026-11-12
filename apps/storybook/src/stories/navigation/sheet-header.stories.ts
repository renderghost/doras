import '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect, fn, userEvent } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';
import { argTypesFromSpec, argsFromSpec } from '../../docs/controls.ts';
import { host, textIn } from '../helpers.ts';

interface Args {
  back: boolean;
  onBack: (event: Event) => void;
  onClose: (event: Event) => void;
}

const meta: Meta<Args> = {
  title: 'Navigation/Sheet header',
  component: 'doras-sheet-header',
  parameters: { doras: { spec: specs['sheet-header'] } },
  argTypes: {
    ...argTypesFromSpec(specs['sheet-header']),
    onBack: { table: { disable: true } },
    onClose: { table: { disable: true } },
  },
  args: { ...(argsFromSpec(specs['sheet-header']) as Partial<Args>), onBack: fn(), onClose: fn() },
  render: (args) =>
    html`<div style="max-inline-size: 26rem">
      <doras-sheet-header
        ?back=${args.back}
        @doras-back=${args.onBack}
        @doras-close=${args.onClose}
      ></doras-sheet-header>
    </div>`,
};

export default meta;
type Story = StoryObj<Args>;

export const FirstStep: Story = {
  name: 'First step',
  play: async ({ canvasElement, args }) => {
    const header = host(canvasElement, 'doras-sheet-header');
    const buttons = await within(canvasElement).findAllByShadowRole('button');
    await expect(buttons).toHaveLength(1);
    await expect(buttons[0]).toHaveAccessibleName(textIn(header, 'common.close'));
    await userEvent.click(buttons[0] as HTMLElement);
    await expect(args.onClose).toHaveBeenCalledTimes(1);
  },
};

export const LaterStep: Story = {
  name: 'Later step',
  args: { back: true },
  play: async ({ canvasElement, args }) => {
    const header = host(canvasElement, 'doras-sheet-header');
    const back = await within(canvasElement).findByShadowRole('button', {
      name: textIn(header, 'common.back'),
    });
    await userEvent.click(back);
    await expect(args.onBack).toHaveBeenCalledTimes(1);
  },
};

/** In right-to-left layouts, back points the other way. */
export const RightToLeft: Story = {
  name: 'Right to left',
  args: { back: true },
  render: (args) =>
    html`<div dir="rtl" lang="ar" style="max-inline-size: 26rem">
      <doras-sheet-header ?back=${args.back}></doras-sheet-header>
    </div>`,
  play: async ({ canvasElement }) => {
    const icon = host(canvasElement, 'doras-sheet-header').shadowRoot?.querySelector(
      'doras-icon[name="arrow-left"]',
    );
    const svg = icon?.shadowRoot?.querySelector('svg');
    await expect(getComputedStyle(svg as Element).transform).toBe('matrix(-1, 0, 0, 1, 0, 0)');
  },
};
