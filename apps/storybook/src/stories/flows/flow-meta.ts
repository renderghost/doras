// What every flow story shares (#16): the harness, its Controls, and
// helpers to walk a journey the way a person would.
import '../../flows/harness.ts';
import type { FlowHarness, Failure, PasskeyVariation, Step } from '../../flows/harness.ts';
import { SCENARIOS, type ScenarioId } from '../../flows/data.ts';
import type { Meta } from '@storybook/web-components-vite';
import { html } from 'lit';
import { within } from 'shadow-dom-testing-library';
import { expect, fn, userEvent, waitFor } from 'storybook/test';

export interface FlowArgs {
  scenario: ScenarioId;
  failure: Failure;
  passkey: PasskeyVariation;
  appName: string;
  appDomain: string;
  appLogo: string;
  start: Step;
  onMeasure: (event: Event) => void;
}

/** The harness, its Controls and render. Each file spreads this into its own meta, with a title. */
export const flowMeta: Omit<Meta<FlowArgs>, 'title'> = {
  component: 'flow-harness',
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    scenario: {
      control: 'select',
      options: Object.keys(SCENARIOS),
      labels: Object.fromEntries(Object.entries(SCENARIOS).map(([k, v]) => [k, v.label])),
      description: 'Who is at the keyboard, and which accounts this browser already knows.',
    },
    failure: {
      control: 'inline-radio',
      options: ['none', 'network', 'too-many-attempts', 'session-expired', 'provider-unavailable'],
      description: 'The next submit on a step it fits fails this way, once. Try again goes on.',
    },
    passkey: {
      control: 'inline-radio',
      options: ['none', 'here', 'lost-phone', 'codes', 'passkey-only'],
      description:
        'What the account has: a passkey on this device, one only on a lost phone, verification codes, or passkey only.',
    },
    appName: { control: 'text', description: 'The app’s name.' },
    appDomain: { control: 'text', description: 'The app’s domain.' },
    appLogo: { control: 'text', description: 'A URL for the app’s logo. Empty shows its initial.' },
    start: { control: false, table: { disable: true } },
    onMeasure: { table: { disable: true } },
  },
  args: {
    scenario: 'sam',
    failure: 'none',
    passkey: 'none',
    appName: 'Potluck',
    appDomain: 'potluck.kitchen',
    appLogo: '',
    start: 'app',
    onMeasure: fn(),
  },
  render: (a) =>
    html`<flow-harness
      scenario=${a.scenario}
      failure=${a.failure}
      passkey=${a.passkey}
      app-name=${a.appName}
      app-domain=${a.appDomain}
      app-logo=${a.appLogo}
      start=${a.start}
      @doras-measure=${a.onMeasure}
    ></flow-harness>`,
};

export const harness = (canvasElement: HTMLElement): FlowHarness =>
  canvasElement.querySelector('flow-harness') as FlowHarness;

/** Waits for a step to show, by the text of its heading. */
export async function onStep(canvasElement: HTMLElement, name: RegExp): Promise<HTMLElement> {
  let found: HTMLElement | null = null;
  await waitFor(
    () => {
      found =
        [...canvasElement.querySelectorAll<HTMLElement>('[data-step-heading]')].find((h) =>
          name.test((h.textContent ?? '').replace(/[\u2068\u2069]/g, '')),
        ) ?? null;
      expect(found, `step ${name}`).toBeTruthy();
    },
    { timeout: 3000 },
  );
  return found as unknown as HTMLElement;
}

/** Presses a button by its accessible name, wherever its shadow root is. */
export async function press(canvasElement: HTMLElement, name: RegExp): Promise<void> {
  const button = await within(canvasElement).findByShadowRole(
    'button',
    { name },
    { timeout: 3000 },
  );
  await userEvent.click(button);
}

/**
 * Picks an account in the browser's chooser. Testing Library can't name a
 * button from text in nested shadow roots, so this finds the row by handle.
 */
export async function pickAccount(canvasElement: HTMLElement, handle: string): Promise<void> {
  let button: HTMLElement | undefined;
  await waitFor(() => {
    const chooser = canvasElement.querySelector('doras-mock-account-chooser');
    button = [...(chooser?.shadowRoot?.querySelectorAll<HTMLElement>('li button') ?? [])].find(
      (b) => b.querySelector('doras-account-row')?.getAttribute('handle') === handle,
    );
    expect(button, handle).toBeTruthy();
  });
  await userEvent.click(button as HTMLElement);
}

/** Chooses a radio card by its name. */
export async function choose(canvasElement: HTMLElement, name: RegExp): Promise<void> {
  const radio = await within(canvasElement).findByShadowRole('radio', { name }, { timeout: 3000 });
  await userEvent.click(radio);
}

/** Types into a field by its label. */
export async function type(canvasElement: HTMLElement, label: RegExp, text: string): Promise<void> {
  const labelled = await within(canvasElement).findAllByShadowLabelText(
    label,
    {},
    { timeout: 3000 },
  );
  const field = labelled.find(
    (el) => el instanceof HTMLInputElement && el.type !== 'radio' && el.type !== 'checkbox',
  ) as HTMLInputElement;
  // Testing Library can't see focus inside shadow roots, so focus the input
  // and type with the keyboard, replacing what's there.
  field.focus();
  field.select();
  await userEvent.keyboard(text);
}

/** The measurement events sent so far, by name. */
export const measured = (onMeasure: FlowArgs['onMeasure']): string[] =>
  (onMeasure as unknown as { mock: { calls: [CustomEvent<{ name: string }>][] } }).mock.calls.map(
    ([event]) => event.detail.name,
  );
