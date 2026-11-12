// Every browser mock story says what it is (#15).
import type { Decorator } from '@storybook/web-components-vite';
import { html } from 'lit';
import { MOCK_WARNING } from '../../docs/mock.ts';

export const mockBanner: Decorator = (story) =>
  html`<p
      role="note"
      style="margin: 0 0 1rem; padding: 0.5rem 0.75rem; border: 2px dashed var(--doras-color-border-automated); color: var(--doras-color-text-automated); font: 700 0.875rem/1.4 system-ui, sans-serif"
    >
      ${MOCK_WARNING}
    </p>
    ${story()}`;

/** Opens a modal mock, as the page's call to the browser would. */
export async function openMock<
  T extends HTMLElement & { open: boolean; updateComplete: Promise<boolean> },
>(element: T): Promise<HTMLDialogElement> {
  element.open = true;
  await element.updateComplete;
  return element.shadowRoot?.querySelector('dialog') as HTMLDialogElement;
}

/** The button in a mock's shadow root with this text. */
export function button(element: HTMLElement, text: string | RegExp): HTMLButtonElement {
  const found = [...(element.shadowRoot?.querySelectorAll('button') ?? [])].find((b) =>
    typeof text === 'string'
      ? (b.getAttribute('aria-label') ?? b.textContent ?? '').trim() === text
      : text.test(b.textContent ?? ''),
  );
  if (!found) throw new Error(`No button “${String(text)}”`);
  return found;
}
