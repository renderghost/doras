// Toast: a short confirmation that needs no action, such as “Passkey
// saved”. Announced politely, and it stays until closed: no timer (WCAG
// 2.2.3, AAA).
import { LocaleController } from '@doras/i18n/lit';
import type { DorasToastProps } from '@doras/specs';
import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { announce } from '../announcer/announce.ts';
import '../icon-button/icon-button.ts';
import '../icon/icon.ts';
import { define } from '../shared/define.ts';
import { TONE_ICONS, feedbackStyles } from '../shared/feedback.ts';

export class DorasToast extends LitElement implements DorasToastProps {
  static override properties = {
    open: { type: Boolean, reflect: true },
    tone: { type: String, reflect: true },
  };

  declare open: boolean;
  declare tone: DorasToastProps['tone'];

  #i18n = new LocaleController(this);

  constructor() {
    super();
    this.open = false;
    this.tone = 'success';
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('open') && this.open) announce(this.textContent?.trim() ?? '');
  }

  #close(): void {
    this.open = false;
    this.dispatchEvent(new CustomEvent('doras-close', { bubbles: true, composed: true }));
  }

  static override styles = [
    feedbackStyles,
    css`
      :host {
        position: fixed;
        z-index: 10;
        inset-block-end: var(--doras-space-inset-xl);
        inset-inline: var(--doras-space-inset-lg);
        display: flex;
        justify-content: center;
        pointer-events: none;
      }

      :host(:not([open])) {
        display: none;
      }

      .toast {
        align-items: center;
        max-inline-size: 32rem;
        padding-block: var(--doras-space-inset-xs);
        padding-inline: var(--doras-space-inset-lg) var(--doras-space-inset-xs);
        border-radius: var(--doras-radius-card);
        background: var(--doras-color-surface-raised);
        box-shadow: var(--doras-shadow-overlay);
        color: var(--doras-color-text-default);
        pointer-events: auto;
      }

      doras-icon {
        margin: 0;
        color: var(--doras-color-feedback-success-icon);
      }

      :host([tone='info']) doras-icon {
        color: var(--doras-color-feedback-info-icon);
      }

      .message {
        flex: 1;
        font-weight: var(--doras-type-label-md-font-weight);
      }
    `,
  ];

  override render() {
    if (!this.open) return nothing;
    return html`<div class="toast feedback" part="toast">
      <doras-icon name=${TONE_ICONS[this.tone]}></doras-icon>
      <span class="message"><slot></slot></span>
      <doras-icon-button label=${this.#i18n.t('common.close')} @click=${this.#close}
        ><doras-icon name="x"></doras-icon
      ></doras-icon-button>
    </div>`;
  }
}

define('doras-toast', DorasToast);

declare global {
  interface HTMLElementTagNameMap {
    'doras-toast': DorasToast;
  }
}
