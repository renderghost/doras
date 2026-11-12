// Button: makes something happen. Never disabled; while busy, presses do nothing.
import type { DorasButtonProps } from '@doras/specs';
import { LitElement, css, html, nothing } from 'lit';
import { define } from '../shared/define.ts';
import { loaderCircle } from '../shared/icons.ts';
import { focusRing, spinner, visuallyHidden } from '../shared/styles.ts';

export class DorasButton extends LitElement implements DorasButtonProps {
  /** It takes part in forms, as a native button does. */
  static formAssociated = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override properties = {
    variant: { type: String, reflect: true },
    type: { type: String },
    busy: { type: Boolean, reflect: true },
    busyLabel: { type: String, attribute: 'busy-label' },
    fullWidth: { type: Boolean, reflect: true, attribute: 'full-width' },
  };

  declare variant: DorasButtonProps['variant'];
  declare type: DorasButtonProps['type'];
  declare busy: boolean;
  declare busyLabel: string | undefined;
  declare fullWidth: boolean;

  #internals = this.attachInternals();

  constructor() {
    super();
    this.variant = 'primary';
    this.type = 'button';
    this.busy = false;
    this.fullWidth = false;
    // A capture listener on the host runs before the app's own listeners, so
    // presses while busy never reach them.
    this.addEventListener('click', this.#onClick, { capture: true });
  }

  /** The form it belongs to, as on a native button. */
  get form(): HTMLFormElement | null {
    return this.#internals.form;
  }

  #onClick = (event: MouseEvent): void => {
    if (this.busy) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (this.type === 'button') return;
    // After every listener has run, so an app that cancels the click stops
    // the submit, as with a native button.
    setTimeout(() => {
      if (event.defaultPrevented) return;
      if (this.type === 'submit') this.#internals.form?.requestSubmit();
      else this.#internals.form?.reset();
    });
  };

  static override styles = [
    focusRing,
    visuallyHidden,
    spinner,
    css`
      :host {
        display: inline-block;
        vertical-align: middle;
      }

      :host([full-width]) {
        display: block;
      }

      button {
        --surface: var(--doras-color-action-primary-surface);
        --surface-hover: var(--doras-color-action-primary-surface-hover);
        --surface-border: var(--doras-color-action-primary-border);
        --text: var(--doras-color-action-primary-text);

        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--doras-space-inline-sm);
        box-sizing: border-box;
        inline-size: 100%;
        min-block-size: var(--doras-size-control-height);
        min-inline-size: var(--doras-size-target-min);
        padding-block: 0;
        padding-inline: var(--doras-space-inset-lg);
        border: var(--doras-border-width-strong) solid var(--surface-border);
        border-radius: var(--doras-radius-control);
        background: var(--surface);
        color: var(--text);
        font-family: var(--doras-type-label-md-font-family);
        font-size: var(--doras-type-label-md-font-size);
        font-weight: var(--doras-type-label-md-font-weight);
        line-height: var(--doras-type-label-md-line-height);
        letter-spacing: var(--doras-type-label-md-letter-spacing);
        text-align: center;
        cursor: pointer;
        transition:
          background-color var(--doras-motion-duration-fast) var(--doras-motion-easing-standard),
          text-decoration-color var(--doras-motion-duration-fast)
            var(--doras-motion-easing-standard);
      }

      button:hover {
        background: var(--surface-hover);
      }

      :host([busy]) button {
        cursor: progress;
      }

      :host([variant='secondary']) button {
        --surface: var(--doras-color-action-secondary-surface);
        --surface-hover: var(--doras-color-action-secondary-surface-hover);
        --surface-border: var(--doras-color-action-secondary-border);
        --text: var(--doras-color-action-secondary-text);
      }

      /* Tertiary looks like a link, but keeps a 44px target. */
      :host([variant='tertiary']) button {
        min-block-size: var(--doras-size-target-min);
        padding-inline: 0;
        border-color: transparent;
        background: none;
        color: var(--doras-color-link-text);
        text-decoration: underline;
        text-decoration-color: var(--doras-color-link-decoration);
        text-decoration-thickness: 2px;
        text-underline-offset: 3px;
      }

      :host([variant='tertiary']) button:hover {
        background: none;
        text-decoration-color: var(--doras-color-link-decoration-hover);
      }

      ::slotted(svg),
      .spinner svg {
        inline-size: var(--doras-size-icon-md);
        block-size: var(--doras-size-icon-md);
        flex: none;
      }

      [hidden] {
        display: none;
      }
    `,
  ];

  override render() {
    const swapLabel = this.busy && Boolean(this.busyLabel);
    return html`
      <button part="button" type="button">
        ${
          this.busy
            ? html`<span class="spinner" aria-hidden="true">${loaderCircle}</span>`
            : html`<slot name="icon-start"></slot>`
        }
        <span ?hidden=${swapLabel}><slot></slot></span>
        ${swapLabel ? html`<span>${this.busyLabel}</span>` : nothing}
        ${this.busy ? nothing : html`<slot name="icon-end"></slot>`}
      </button>
      <span class="visually-hidden" role="status">${swapLabel ? this.busyLabel : ''}</span>
    `;
  }
}

define('doras-button', DorasButton);

declare global {
  interface HTMLElementTagNameMap {
    'doras-button': DorasButton;
  }
}
