// Sheet: Front Door's container inside the app. A native modal dialog, so
// focus moves in and stays in, Escape closes it, the page behind is inert,
// and focus returns to whatever opened it. Centred on large screens, a
// bottom sheet on phones; its header and foot stay put while the body scrolls.
import { LocaleController } from '@doras/i18n/lit';
import type { DorasSheetProps } from '@doras/specs';
import { LitElement, css, html, type PropertyValues } from 'lit';
import '../atmosphere-mark/atmosphere-mark.ts';
import { define } from '../shared/define.ts';

export class DorasSheet extends LitElement implements DorasSheetProps {
  static override properties = {
    open: { type: Boolean, reflect: true },
    label: { type: String },
    appName: { type: String, attribute: 'app-name' },
  };

  declare open: boolean;
  declare label: string;
  declare appName: string;

  #i18n = new LocaleController(this);

  // A body that scrolls must be reachable by keyboard (WCAG 2.1.1), but a
  // tab stop that scrolls nothing is noise, so it is focusable only when its
  // content overflows.
  #overflow = new ResizeObserver(() => {
    const body = this.renderRoot.querySelector<HTMLElement>('.body');
    if (!body) return;
    if (body.scrollHeight > body.clientHeight) body.tabIndex = 0;
    else body.removeAttribute('tabindex');
  });

  constructor() {
    super();
    this.open = false;
    this.label = '';
    this.appName = '';
    // The sheet header's close button closes the sheet. Registered before any
    // consumer's listener, so stopping it here means consumers hear doras-close
    // once, from the sheet, when the dialog has actually closed.
    this.addEventListener('doras-close', (event) => {
      if (event.target !== this) {
        event.stopImmediatePropagation();
        this.close();
      }
    });
  }

  get #dialog(): HTMLDialogElement | null {
    return this.renderRoot.querySelector('dialog');
  }

  /** Closes the sheet, returning focus to whatever opened it. */
  close(): void {
    this.open = false;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    // The body and its content: one changes when the viewport does, the other when the content does.
    void this.updateComplete.then(() => {
      for (const selector of ['.body', '.content']) {
        const element = this.renderRoot.querySelector(selector);
        if (element) this.#overflow.observe(element);
      }
    });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#overflow.disconnect();
  }

  protected override updated(changed: PropertyValues): void {
    if (!changed.has('open')) return;
    const dialog = this.#dialog;
    if (!dialog) return;
    if (this.open && !dialog.open) {
      dialog.showModal();
      this.dispatchEvent(
        new CustomEvent('doras-measure', {
          detail: { name: 'doras.door_opened' },
          bubbles: true,
          composed: true,
        }),
      );
    } else if (!this.open && dialog.open) {
      dialog.close();
    }
  }

  #onClose = (): void => {
    if (this.open) this.open = false;
    this.dispatchEvent(new CustomEvent('doras-close', { bubbles: true, composed: true }));
  };

  static override styles = css`
    dialog {
      box-sizing: border-box;
      display: none;
      flex-direction: column;
      inline-size: min(100% - 2 * var(--doras-space-inset-lg), var(--doras-size-content-narrow));
      max-block-size: calc(100dvh - 2 * var(--doras-space-inset-lg));
      padding: 0;
      border: var(--doras-border-width-default) solid var(--doras-color-border-default);
      border-radius: var(--doras-radius-sheet);
      background: var(--doras-color-surface-raised);
      box-shadow: var(--doras-shadow-overlay);
      color: var(--doras-color-text-default);
      overscroll-behavior: contain;
    }

    dialog[open] {
      display: flex;
      animation: doras-sheet-in var(--doras-motion-duration-moderate)
        var(--doras-motion-easing-enter);
    }

    dialog::backdrop {
      background: var(--doras-color-surface-overlay, rgb(0 0 0 / 36%));
    }

    .head,
    .foot {
      flex: none;
      padding-inline: var(--doras-space-inset-md);
    }

    .head {
      padding-block: var(--doras-space-inset-sm);
      border-block-end: var(--doras-border-width-default) solid var(--doras-color-border-default);
    }

    .body {
      flex: 1;
      min-block-size: 0;
      overflow: auto;
      padding: var(--doras-space-inset-xl);
      scroll-padding-block: var(--doras-space-inset-xl);
    }

    /* Inside the dialog, so the ring sits inside the edge, not clipped by it. */
    .body:focus-visible {
      outline: var(--doras-border-width-focus) solid var(--doras-color-border-focus);
      outline-offset: calc(-1 * var(--doras-border-width-focus));
    }

    .foot {
      display: flex;
      gap: var(--doras-space-inline-xs);
      align-items: center;
      justify-content: center;
      padding-block: var(--doras-space-inset-sm);
      border-block-start: var(--doras-border-width-default) solid var(--doras-color-border-default);
      color: var(--doras-color-text-subtle);
      font-size: var(--doras-type-caption-font-size);
      line-height: var(--doras-type-caption-line-height);
      text-align: start;
    }

    /* Phones: a bottom sheet, full width, rounded only at the top. */
    @media (width < 37.5rem) {
      dialog {
        inline-size: 100%;
        max-inline-size: 100%;
        max-block-size: calc(100dvh - var(--doras-space-inset-xl));
        margin-block-end: 0;
        border-end-start-radius: 0;
        border-end-end-radius: 0;
      }

      dialog[open] {
        animation-name: doras-sheet-up;
      }
    }

    @keyframes doras-sheet-in {
      from {
        opacity: 0;
        transform: scale(0.98);
      }
    }

    @keyframes doras-sheet-up {
      from {
        transform: translateY(100%);
      }
    }
  `;

  override render() {
    return html`<dialog part="dialog" aria-label=${this.label} @close=${this.#onClose}>
      <div class="head" part="head"><slot name="header"></slot></div>
      <div class="body" part="body">
        <div class="content"><slot></slot></div>
      </div>
      <div class="foot" part="foot">
        <slot name="foot"
          ><doras-atmosphere-mark decorative size="md"></doras-atmosphere-mark
          ><span>${this.#i18n.t('sheet.foot', { app: this.appName })}</span></slot
        >
      </div>
    </dialog>`;
  }
}

define('doras-sheet', DorasSheet);

declare global {
  interface HTMLElementTagNameMap {
    'doras-sheet': DorasSheet;
  }
}
