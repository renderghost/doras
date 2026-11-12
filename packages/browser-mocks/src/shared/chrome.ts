// What every mock shares. Mocks copy the browser's look, not Doras's: the
// system font and plain, compact controls, so nobody mistakes one for
// something an app should build. Colours still come from the tokens, so
// mocks stay readable in every theme and in forced colours.
//
// Mock text is English only, and left to right, as a browser set to English
// draws it on any page: the browser speaks its own language, not the app's.
// None of it is ever shipped.
import { focusRing, spinner, visuallyHidden } from '@doras/components/shared/styles';
import { css, html } from 'lit';

/** The browser's language, not the page's: put it on each mock's card. */
export const BROWSER_LANG = { lang: 'en-GB', dir: 'ltr' } as const;

/** Shown on every mock, so it's never mistaken for production UI. */
export const tag = () => html`<p class="tag" part="tag">Drawn by the browser</p>`;

/** Closes a mock: the same button in every one. */
export const closeButton = (onClick: () => void) =>
  html`<button class="close" type="button" aria-label="Close" @click=${onClick}>
    <doras-icon name="x"></doras-icon>
  </button>`;

export const chrome = [
  focusRing,
  spinner,
  visuallyHidden,
  css`
    :host {
      color: var(--doras-color-text-default);
      font-family: system-ui, sans-serif;
      font-size: 0.875rem;
      line-height: 1.45;
    }

    p {
      margin: 0;
    }

    button {
      font: inherit;
      cursor: pointer;
    }

    .card {
      box-sizing: border-box;
      padding: 0;
      border: var(--doras-border-width-default) solid var(--doras-color-border-default);
      border-radius: var(--doras-radius-card);
      background: var(--doras-color-surface-raised);
      box-shadow: var(--doras-shadow-overlay);
      color: inherit;
    }

    dialog.card {
      inline-size: min(100% - 2 * var(--doras-space-inset-lg), 25rem);
      overscroll-behavior: contain;
    }

    dialog::backdrop {
      background: var(--doras-color-surface-overlay, rgb(0 0 0 / 36%));
    }

    .tag {
      padding: var(--doras-space-inset-xs) var(--doras-space-inset-md);
      border-block-end: var(--doras-border-width-default) dashed var(--doras-color-border-automated);
      color: var(--doras-color-text-automated);
      font-size: 0.75rem;
      text-align: center;
    }

    .head {
      display: flex;
      gap: var(--doras-space-inline-sm);
      align-items: flex-start;
      padding: var(--doras-space-inset-md) var(--doras-space-inset-md) var(--doras-space-inset-sm);
    }

    .title {
      display: flex;
      flex: 1;
      flex-direction: column;
      padding-block-start: var(--doras-space-inset-xs);
    }

    .title strong {
      font-size: 1rem;
      font-weight: 600;
    }

    .sub,
    .fine {
      color: var(--doras-color-text-subtle);
    }

    .body {
      display: flex;
      flex-direction: column;
      gap: var(--doras-space-stack-sm);
      padding: var(--doras-space-inset-xs) var(--doras-space-inset-md) var(--doras-space-inset-md);
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--doras-space-inline-sm);
      justify-content: flex-end;
      padding: 0 var(--doras-space-inset-md) var(--doras-space-inset-md);
    }

    .fine {
      padding: var(--doras-space-inset-sm) var(--doras-space-inset-md) var(--doras-space-inset-md);
      border-block-start: var(--doras-border-width-default) solid var(--doras-color-border-default);
      font-size: 0.75rem;
    }

    .button {
      min-block-size: 2.5rem;
      padding-inline: var(--doras-space-inset-md);
      border: var(--doras-border-width-default) solid var(--doras-color-action-secondary-border);
      border-radius: var(--doras-radius-pill);
      background: var(--doras-color-action-secondary-surface);
      color: var(--doras-color-action-secondary-text);
      font-weight: 600;
    }

    .button:hover {
      background: var(--doras-color-action-secondary-surface-hover);
    }

    .button.primary {
      border-color: var(--doras-color-action-primary-border);
      background: var(--doras-color-action-primary-surface);
      color: var(--doras-color-action-primary-text);
    }

    .button.primary:hover {
      background: var(--doras-color-action-primary-surface-hover);
    }

    /* A row in the browser's list: an account, or another way in. */
    .option {
      display: flex;
      gap: var(--doras-space-inline-sm);
      align-items: center;
      box-sizing: border-box;
      inline-size: 100%;
      min-block-size: 2.75rem;
      padding: var(--doras-space-inset-sm) var(--doras-space-inset-md);
      border: var(--doras-border-width-default) solid transparent;
      background: transparent;
      color: inherit;
      text-align: start;
    }

    .option:hover {
      background: var(--doras-color-surface-subtle);
    }

    /* Rows run edge to edge, so the ring sits inside, not clipped by the card. */
    .option:focus-visible {
      outline-offset: calc(-2 * var(--doras-border-width-focus));
    }

    .close {
      display: grid;
      flex: none;
      place-items: center;
      inline-size: 2.5rem;
      block-size: 2.5rem;
      border: var(--doras-border-width-default) solid transparent;
      border-radius: var(--doras-radius-pill);
      background: transparent;
      color: inherit;
    }

    .close:hover {
      background: var(--doras-color-surface-subtle);
    }

    /* While the browser works: the person waits, and is told what for. */
    .busy {
      display: flex;
      gap: var(--doras-space-inline-sm);
      align-items: center;
      padding: var(--doras-space-inset-lg) var(--doras-space-inset-md);
    }

    .busy:focus {
      outline: none;
    }
  `,
];

/** Sends a mock's event from the element, out of its shadow root. */
export function send(element: HTMLElement, name: string, detail?: unknown): void {
  element.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
}
