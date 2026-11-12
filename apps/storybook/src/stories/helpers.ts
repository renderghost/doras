// Shared by the Actions stories.
import { format, localeOf, matchLocale, withoutIsolation, type MessageKey } from '@doras/i18n';
import { LOCALES, type Locale as ToolbarLocale } from '../../.storybook/settings.ts';
import { within } from 'shadow-dom-testing-library';
import { html } from 'lit';

/** A catalogue string in the locale an element is in, as people see it. */
export const textIn = (
  element: Element,
  key: MessageKey,
  values?: Record<string, string | number>,
): string => withoutIsolation(format(localeOf(element), key, values));

/** A catalogue string in the toolbar's locale, for a story's sample text. */
export const textFor = (globals: Record<string, unknown>, key: MessageKey): string =>
  withoutIsolation(
    format(matchLocale(LOCALES[(globals.locale as ToolbarLocale) ?? 'en-GB']?.lang), key),
  );

/** The native control inside a component's shadow root. */
export async function inner(canvasElement: HTMLElement, role: string): Promise<HTMLElement> {
  const [found] = await within(canvasElement).findAllByShadowRole(role);
  if (!found) throw new Error(`No ${role}`);
  return found;
}

/**
 * Focuses a component as a script or the Tab key would, and returns what
 * received focus inside its shadow root. Testing Library's simulated Tab
 * can't see into shadow roots, so real Tab order is checked in a real
 * browser instead.
 */
export function focusInside(element: HTMLElement): Element | null {
  element.focus();
  return element.shadowRoot?.activeElement ?? null;
}

/** The component a story rendered. */
export function host<T extends Element>(canvasElement: HTMLElement, tag: string): T {
  const found = canvasElement.querySelector(tag);
  if (!found) throw new Error(`No ${tag}`);
  return found as unknown as T;
}

/** Lucide icons for stories. The Icon component (#10) will replace them. */
const icon = (paths: ReturnType<typeof html>) =>
  html`<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    ${paths}
  </svg>`;

export const ICONS = {
  x: icon(html`<path d="M18 6 6 18" /><path d="m6 6 12 12" />`),
  arrowLeft: icon(html`<path d="m12 19-7-7 7-7" /><path d="M19 12H5" />`),
  arrowRight: icon(html`<path d="M5 12h14" /><path d="m12 5 7 7-7 7" />`),
  keyRound: icon(
    html`<path
        d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
      /><circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />`,
  ),
};
