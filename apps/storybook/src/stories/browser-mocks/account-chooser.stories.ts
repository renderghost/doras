import '@doras/browser-mocks';
import type { DorasMockAccountChooser, MockAccount } from '@doras/browser-mocks';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import type { MockDocs } from '../../docs/mock.ts';
import { host } from '../helpers.ts';
import { button, mockBanner, openMock } from './mock-banner.ts';

const docs: MockDocs = {
  summary:
    'The browser’s own list of the Atmosphere accounts used on this device. The app learns nothing until one is picked, and there’s nothing to type.',
  tag: 'doras-mock-account-chooser',
  triggers: [
    {
      api: 'FedCM',
      href: 'https://developer.mozilla.org/en-US/docs/Web/API/FedCM_API',
      when: 'When the app asks the browser for an identity, the browser lists the accounts it knows for that provider. For Atmosphere this needs providers to register with FedCM, which is still a proposal. Without it, Front Door asks for a handle instead.',
      code: `const credential = await navigator.credentials.get({
  identity: {
    providers: [
      {
        configURL: 'https://provider.example/fedcm.json',
        clientId: 'https://potluck.kitchen/client-metadata.json',
      },
    ],
  },
});`,
    },
  ],
  events: [
    {
      name: 'doras-mock-pick',
      when: 'An account was picked. detail.handle names it. The page’s call would return a credential.',
    },
    {
      name: 'doras-mock-other',
      when: '“Use another Atmosphere account” was pressed. Front Door asks for a handle.',
    },
    {
      name: 'doras-mock-dismiss',
      when: 'It was closed without a pick. The page’s call would be rejected, and Front Door asks for a handle.',
    },
  ],
  notes: [
    'Large screens: at the top, on the end side, where browsers put it below the address bar. Phones: a sheet from the bottom of the screen.',
    'After a pick it says “Connecting to Bluesky…”, and that’s announced.',
  ],
};

const SEVERAL: MockAccount[] = [
  { handle: 'alex.bsky.social', name: 'Alex Moreno', provider: 'bluesky' },
  { handle: 'alexcooks.eurosky.social', name: 'Alex Moreno', provider: 'eurosky' },
  { handle: 'alexmoreno.studio', name: 'Alex Moreno Studio', provider: 'bluesky' },
];
const ONE: MockAccount[] = [
  { handle: 'priya.bsky.social', name: 'Priya Shah', provider: 'bluesky' },
];

interface Args {
  accounts: MockAccount[];
  onPick: (event: Event) => void;
  onOther: (event: Event) => void;
  onDismiss: (event: Event) => void;
}

const meta: Meta<Args> = {
  title: 'Browser mocks/Account chooser',
  component: 'doras-mock-account-chooser',
  decorators: [mockBanner],
  parameters: {
    doras: { mock: docs },
    docs: { story: { inline: false, height: '560px' } },
    layout: 'fullscreen',
  },
  argTypes: {
    accounts: { control: false },
    onPick: { table: { disable: true } },
    onOther: { table: { disable: true } },
    onDismiss: { table: { disable: true } },
  },
  args: { accounts: SEVERAL, onPick: fn(), onOther: fn(), onDismiss: fn() },
  render: (args) =>
    html`<div style="padding: 1.5rem; min-block-size: 480px">
      <doras-mock-account-chooser
        app-name="Potluck"
        app-domain="potluck.kitchen"
        .accounts=${args.accounts}
        @doras-mock-pick=${args.onPick}
        @doras-mock-other=${args.onOther}
        @doras-mock-dismiss=${args.onDismiss}
      ></doras-mock-account-chooser>
    </div>`,
};

export default meta;
type Story = StoryObj<Args>;

const chooser = (canvasElement: HTMLElement) =>
  host<DorasMockAccountChooser>(canvasElement, 'doras-mock-account-chooser');

/** Alex has three Atmosphere accounts, and this browser has seen all three. */
export const SeveralAccounts: Story = {
  name: 'Several accounts',
  play: async ({ canvasElement }) => {
    const element = chooser(canvasElement);
    const dialog = await openMock(element);
    await expect(dialog.matches(':modal')).toBe(true);
    // The browser's language, not the page's: English, left to right, on any page.
    await expect(dialog).toHaveAttribute('lang', 'en-GB');
    await expect(dialog).toHaveAttribute('dir', 'ltr');
    const accounts = element.shadowRoot?.querySelectorAll('li button') ?? [];
    await expect(accounts).toHaveLength(3);
    // Focus starts on the first account.
    await expect(element.shadowRoot?.activeElement).toBe(accounts[0]);
  },
};

/** Priya came to make an account, but the browser already knows one. */
export const OneAccount: Story = {
  name: 'One account',
  args: { accounts: ONE },
  play: async ({ canvasElement }) => {
    const element = chooser(canvasElement);
    await openMock(element);
    await expect(element.shadowRoot?.activeElement).toBe(button(element, /Continue as Priya/));
  },
};

/** Picking an account: the page hears which, and the browser says it's connecting. */
export const Picked: Story = {
  name: 'Picking an account',
  play: async ({ canvasElement, args }) => {
    const element = chooser(canvasElement);
    await openMock(element);
    const accounts = element.shadowRoot?.querySelectorAll('li button') ?? [];
    await userEvent.click(accounts[1] as HTMLElement);
    await expect(args.onPick).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { handle: 'alexcooks.eurosky.social' } }),
    );
    const status = element.shadowRoot?.querySelector('[role="status"]');
    await expect(status?.textContent).toMatch(/Connecting to Eurosky/);
    await expect(element.shadowRoot?.activeElement).toBe(status);
  },
};

/** With one account, “Continue as Priya” picks it. */
export const PickedOne: Story = {
  name: 'Picking the one account',
  args: { accounts: ONE },
  play: async ({ canvasElement, args }) => {
    const element = chooser(canvasElement);
    await openMock(element);
    await userEvent.click(button(element, /Continue as Priya/));
    await expect(args.onPick).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { handle: 'priya.bsky.social' } }),
    );
  },
};

/** Closing it, or using another account, sends Front Door to handle entry. */
export const OtherOrClose: Story = {
  name: 'Another account, or closed',
  play: async ({ canvasElement, args }) => {
    const element = chooser(canvasElement);
    const dialog = await openMock(element);
    await userEvent.click(button(element, /Use another Atmosphere account/));
    await expect(args.onOther).toHaveBeenCalledTimes(1);
    await userEvent.click(button(element, 'Close'));
    await waitFor(() => expect(element.open).toBe(false));
    await expect(dialog.open).toBe(false);
    await waitFor(() => expect(args.onDismiss).toHaveBeenCalledTimes(1));
    // Opened again, it starts afresh.
    await openMock(element);
    await expect(element.shadowRoot?.querySelectorAll('li button')).toHaveLength(3);
  },
};

export const Phone: Story = {
  parameters: { viewport: { defaultViewport: 'phone' } },
  globals: { viewport: { value: 'phone' } },
  play: async ({ canvasElement }) => void (await openMock(chooser(canvasElement))),
};
