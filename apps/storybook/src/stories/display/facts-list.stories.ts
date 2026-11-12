import '@doras/components';
import type { Fact } from '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect } from 'storybook/test';
import { host } from '../helpers.ts';

const FACTS: Fact[] = [
  { label: 'Your handle', value: 'rae.blacksky.app', kind: 'handle' },
  { label: 'Your sign-in code', value: '482913', kind: 'code' },
];

const meta: Meta = {
  title: 'Display/Facts list',
  component: 'doras-facts-list',
  parameters: { doras: { spec: specs['facts-list'] } },
  render: () =>
    html`<div style="max-inline-size: 24rem">
      <doras-facts-list .facts=${FACTS}></doras-facts-list>
    </div>`,
};

export default meta;
type Story = StoryObj;

/** Handles are isolated; codes are grouped and read digit by digit. */
export const RecoveryEmail: Story = {
  name: 'In the recovery email',
  play: async ({ canvasElement }) => {
    const list = host(canvasElement, 'doras-facts-list').shadowRoot;
    await expect(list?.querySelector('bdi')?.textContent).toBe('@rae.blacksky.app');
    await expect(list?.querySelector('.code')?.textContent?.trim()).toBe('482 913');
    await expect(list?.querySelector('.visually-hidden')?.textContent).toBe('4 8 2 9 1 3');
  },
};

export const InArabic: Story = {
  name: 'Inside Arabic text',
  render: () =>
    html`<div dir="rtl" lang="ar" style="max-inline-size: 24rem">
      <doras-facts-list
        .facts=${[
          { label: 'معرّفك', value: 'rae.blacksky.app', kind: 'handle' },
          { label: 'رمز تسجيل الدخول', value: '482913', kind: 'code' },
        ]}
      ></doras-facts-list>
    </div>`,
};
