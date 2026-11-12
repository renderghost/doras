import '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { argTypesFromSpec } from '../../docs/controls.ts';

interface Args {
  name: string;
  domain: string;
  logo: string;
}

const meta: Meta<Args> = {
  title: 'Identity/App identity',
  component: 'doras-app-identity',
  parameters: { doras: { spec: specs['app-identity'] } },
  argTypes: argTypesFromSpec(specs['app-identity']),
  args: { name: 'Potluck', domain: 'potluck.kitchen', logo: '' },
  render: (args) =>
    html`<doras-app-identity
      name=${args.name}
      domain=${args.domain}
      logo=${args.logo}
    ></doras-app-identity>`,
};

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const InArabic: Story = {
  name: 'Right to left',
  render: (args) =>
    html`<div dir="rtl" lang="ar">
      <doras-app-identity name=${args.name} domain=${args.domain}></doras-app-identity>
    </div>`,
};
