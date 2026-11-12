// Dialog: a confirmation that needs an answer. A native modal dialog with
// the alertdialog role; Escape counts as cancelling.
import type { DorasDialogProps } from '@doras/specs';
import { LitElement, css, html, type PropertyValues } from 'lit';
import { define } from '../shared/define.ts';

export class DorasDialog extends LitElement implements DorasDialogProps {
  static override properties = {
    open: { type: Boolean, reflect: true },
    heading: { type: String },
  };

  declare open: boolean;
  declare heading: string;

  constructor() {
    super();
    this.open = false;
    this.heading = '';
  }

  protected override updated(changed: PropertyValues): void {
    if (!changed.has('open')) return;
    const dialog = this.renderRoot.querySelector('dialog');
    if (!dialog) return;
    if (this.open && !dialog.open) dialog.showModal();
    else if (!this.open && dialog.open) dialog.close();
  }

  #onClose = (): void => {
    if (this.open) this.open = false;
    this.dispatchEvent(new CustomEvent('doras-close', { bubbles: true, composed: true }));
  };

  static override styles = css`
    dialog {
      box-sizing: border-box;
      inline-size: min(100% - 2 * var(--doras-space-inset-lg), var(--doras-size-content-narrow));
      padding: var(--doras-space-inset-xl);
      border: var(--doras-border-width-default) solid var(--doras-color-border-default);
      border-radius: var(--doras-radius-card);
      background: var(--doras-color-surface-raised);
      box-shadow: var(--doras-shadow-overlay);
      color: var(--doras-color-text-default);
    }

    dialog::backdrop {
      background: var(--doras-color-surface-overlay, rgb(0 0 0 / 36%));
    }

    h2 {
      margin: 0 0 var(--doras-space-stack-sm);
      font-family: var(--doras-type-heading-md-font-family);
      font-size: var(--doras-type-heading-md-font-size);
      font-weight: var(--doras-type-heading-md-font-weight);
      line-height: var(--doras-type-heading-md-line-height);
      letter-spacing: var(--doras-type-heading-md-letter-spacing);
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--doras-space-inline-sm);
      justify-content: flex-end;
      margin-block-start: var(--doras-space-stack-xl);
    }
  `;

  override render() {
    return html`<dialog
      part="dialog"
      role="alertdialog"
      aria-labelledby="heading"
      aria-describedby="body"
      @close=${this.#onClose}
    >
      <h2 id="heading">${this.heading}</h2>
      <div id="body" part="body"><slot></slot></div>
      <div class="actions" part="actions"><slot name="actions"></slot></div>
    </dialog>`;
  }
}

define('doras-dialog', DorasDialog);

declare global {
  interface HTMLElementTagNameMap {
    'doras-dialog': DorasDialog;
  }
}
