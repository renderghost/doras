// Shared by the Actions stories.
import { format, localeOf, matchLocale, withoutIsolation, type MessageKey } from '@doras/i18n';
import { LOCALES, type Locale as ToolbarLocale } from '../../.storybook/settings.ts';
import { within } from 'shadow-dom-testing-library';

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
