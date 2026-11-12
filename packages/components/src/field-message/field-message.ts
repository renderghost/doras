// Field message: the error, hint or automated message under a field. Give
// it an id, and point the field's aria-describedby at it.
import { LocaleController } from '@doras/i18n/lit';
import type { DorasFieldMessageProps } from '@doras/specs';
import { LitElement, css, html, nothing } from 'lit';
import '../icon/icon.ts';
import { define } from '../shared/define.ts';
import { TONE_ICONS, feedbackStyles } from '../shared/feedback.ts';
import { visuallyHidden } from '../shared/styles.ts';

export class DorasFieldMessage extends LitElement implements DorasFieldMessageProps {
  static override properties = {
    tone: { type: String, reflect: true },
  };

  declare tone: DorasFieldMessageProps['tone'];

  #i18n = new LocaleController(this);

  constructor() {
    super();
    this.tone = 'hint';
  }

  static override styles = [
    visuallyHidden,
    feedbackStyles,
    css`
      :host {
        display: block;
        color: var(--doras-color-text-subtle);
        font-size: var(--doras-type-body-sm-font-size);
        line-height: var(--doras-type-body-sm-line-height);
      }

      :host([tone='error']) {
        color: var(--doras-color-text-error);
        font-weight: var(--doras-type-label-sm-font-weight);
      }

      :host([tone='automated']) {
        color: var(--doras-color-text-automated);
      }
    `,
  ];

  override render() {
    return html`<span class="feedback" part="message"
      >${
        this.tone === 'hint'
          ? nothing
          : html`<doras-icon name=${TONE_ICONS[this.tone]} size="sm"></doras-icon>`
      }<span
        >${
          this.tone === 'error'
            ? html`<span class="visually-hidden">${this.#i18n.t('field.errorPrefix')} </span>`
            : nothing
        }<slot></slot></span
    ></span>`;
  }
}

define('doras-field-message', DorasFieldMessage);

declare global {
  interface HTMLElementTagNameMap {
    'doras-field-message': DorasFieldMessage;
  }
}
