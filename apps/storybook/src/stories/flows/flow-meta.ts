// What every flow story shares (#16): the harness, its Controls, and
// helpers to walk a journey the way a person would.
import '../../flows/harness.ts';
import type { FlowHarness, Failure, PasskeyVariation, Step } from '../../flows/harness.ts';
import { SCENARIOS, type ScenarioId } from '../../flows/data.ts';
import {
  format,
  localeOf,
  withoutIsolation,
  type MessageKey,
  type MessageValues,
} from '@doras/i18n';
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

/**
 * What to look for: a catalogue key (with its values), resolved in the
 * page's locale, so a walk works in every locale; or a pattern, for the
 * app's and the browser's own English.
 */
export type Text = RegExp | MessageKey | [MessageKey, MessageValues];

const plain = (s: string): string =>
  s
    .replace(/[\u2068\u2069]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/** Matches the whole text, or, with prefix, its start (labels can carry more). */
function matches(canvasElement: HTMLElement, text: Text, prefix = false): (s: string) => boolean {
  if (text instanceof RegExp) return (s) => text.test(plain(s));
  const [key, values] = Array.isArray(text) ? text : [text, undefined];
  const where = canvasElement.querySelector('flow-harness') ?? canvasElement;
  const wanted = plain(withoutIsolation(format(localeOf(where), key, values)));
  return (s) => (prefix ? plain(s).startsWith(wanted) : plain(s) === wanted);
}

/** Waits for a step to show, by its heading. */
export async function onStep(canvasElement: HTMLElement, name: Text): Promise<HTMLElement> {
  const match = matches(canvasElement, name);
  let found: HTMLElement | undefined;
  await waitFor(
    () => {
      found = [...canvasElement.querySelectorAll<HTMLElement>('[data-step-heading]')].find((h) =>
        match(h.textContent ?? ''),
      );
      expect(found, `step ${String(name)}`).toBeTruthy();
    },
    { timeout: 3000 },
  );
  return found as HTMLElement;
}

/** Presses a button by its accessible name, wherever its shadow root is. */
export async function press(canvasElement: HTMLElement, name: Text): Promise<void> {
  const match = matches(canvasElement, name);
  const button = await within(canvasElement).findByShadowRole(
    'button',
    { name: (accessibleName) => match(accessibleName) },
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
export async function choose(canvasElement: HTMLElement, name: Text): Promise<void> {
  const match = matches(canvasElement, name, true);
  const radio = await within(canvasElement).findByShadowRole(
    'radio',
    { name: (accessibleName) => match(accessibleName) },
    { timeout: 3000 },
  );
  await userEvent.click(radio);
}

/** Types into a field by its label. */
export async function type(canvasElement: HTMLElement, label: Text, text: string): Promise<void> {
  const match = matches(canvasElement, label, true);
  const labelled = await within(canvasElement).findAllByShadowLabelText(
    (content) => match(content),
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

/** One move in a walk through a journey. */
export type Move =
  | { press: Text }
  | { step: Text }
  | { type: Text; value: string }
  | { choose: Text }
  | { pick: string };

/** Walks a journey, move by move, as a person would. */
export async function walk(canvasElement: HTMLElement, moves: Move[]): Promise<void> {
  for (const move of moves) {
    if ('press' in move) await press(canvasElement, move.press);
    else if ('step' in move) await onStep(canvasElement, move.step);
    else if ('type' in move) await type(canvasElement, move.type, move.value);
    else if ('choose' in move) await choose(canvasElement, move.choose);
    else await pickAccount(canvasElement, move.pick);
  }
}

/** The measurement events sent so far, by name. */
export const measured = (onMeasure: FlowArgs['onMeasure']): string[] =>
  (onMeasure as unknown as { mock: { calls: [CustomEvent<{ name: string }>][] } }).mock.calls.map(
    ([event]) => event.detail.name,
  );
