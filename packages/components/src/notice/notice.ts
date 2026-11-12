// Notice: info, success, error or automated, with an icon and words. The
// four failures use locked copy from the catalogue and announce
// doras.failure_shown.
import { LocaleController } from '@doras/i18n/lit';
import type { DorasNoticeProps } from '@doras/specs';
import { LitElement, css, html, nothing } from 'lit';
import '../icon/icon.ts';
import { define } from '../shared/define.ts';
import { TONE_ICONS, feedbackStyles } from '../shared/feedback.ts';

type Failure = Exclude<DorasNoticeProps['failure'], 'none'>;

const FAILURE_TONE: Record<Failure, DorasNoticeProps['tone']> = {
  network: 'error',
  'too-many-attempts': 'error',
  'session-expired': 'info',
  'provider-unavailable': 'info',
};

export class DorasNotice extends LitElement implements DorasNoticeProps {
  static override properties = {
    tone: { type: String, reflect: true },
    heading: { type: String },
    failure: { type: String, reflect: true },
    provider: { type: String },
    minutes: { type: Number },
  };

  declare tone: DorasNoticeProps['tone'];
  declare heading: string | undefined;
  declare failure: DorasNoticeProps['failure'];
  declare provider: string | undefined;
  declare minutes: number;

  #i18n = new LocaleController(this);
  #measured = '';

  constructor() {
    super();
    this.tone = 'info';
    this.failure = 'none';
    this.minutes = 5;
  }

  protected override willUpdate(): void {
    // The tone, after any failure's own, styles the host.
    this.dataset.tone = this.#effectiveTone;
  }

  protected override updated(): void {
    // Each failure shown is counted once.
    if (this.failure !== 'none' && this.#measured !== this.failure) {
      this.#measured = this.failure;
      this.dispatchEvent(
        new CustomEvent('doras-measure', {
          detail: { name: 'doras.failure_shown', failure: this.failure.replace(/-/g, '_') },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  get #effectiveTone(): DorasNoticeProps['tone'] {
    return this.failure === 'none' ? this.tone : FAILURE_TONE[this.failure];
  }

  #failureText(failure: Failure): string {
    const t = this.#i18n.t.bind(this.#i18n);
    switch (failure) {
      case 'network':
        return t('failure.network');
      case 'too-many-attempts':
        return t('failure.tooManyAttempts', { minutes: this.minutes });
      case 'session-expired':
        return t('failure.sessionExpired');
      case 'provider-unavailable':
        return t('failure.providerUnavailable', { provider: this.provider ?? '' });
    }
  }

  static override styles = [
    feedbackStyles,
    css`
      :host {
        --surface: var(--doras-color-feedback-info-surface);
        --border: var(--doras-color-feedback-info-border);
        --icon: var(--doras-color-feedback-info-icon);
        --text: var(--doras-color-feedback-info-text);

        display: block;
      }

      :host([data-tone='success']) {
        --surface: var(--doras-color-feedback-success-surface);
        --border: var(--doras-color-feedback-success-border);
        --icon: var(--doras-color-feedback-success-icon);
        --text: var(--doras-color-feedback-success-text);
      }

      :host([data-tone='error']) {
        --surface: var(--doras-color-feedback-error-surface);
        --border: var(--doras-color-feedback-error-border);
        --icon: var(--doras-color-feedback-error-icon);
        --text: var(--doras-color-feedback-error-text);
      }

      :host([data-tone='automated']) {
        --surface: var(--doras-color-feedback-automated-surface);
        --border: var(--doras-color-feedback-automated-border);
        --icon: var(--doras-color-feedback-automated-icon);
        --text: var(--doras-color-feedback-automated-text);
      }

      .notice {
        padding: var(--doras-space-inset-md);
        border: var(--doras-border-width-default) solid var(--border);
        border-radius: var(--doras-radius-card);
        background: var(--surface);
        color: var(--text);
        font-size: var(--doras-type-body-md-font-size);
        line-height: var(--doras-type-body-md-line-height);
      }

      doras-icon {
        color: var(--icon);
      }

      .text {
        display: flex;
        flex-direction: column;
        gap: var(--doras-space-stack-xs);
        min-inline-size: 0;
      }

      .heading {
        font-weight: var(--doras-type-label-md-font-weight);
      }

      ::slotted(p) {
        margin: 0;
      }
    `,
  ];

  override render() {
    const tone = this.#effectiveTone;
    return html`<div class="notice feedback" part="notice">
      <doras-icon name=${TONE_ICONS[tone]}></doras-icon>
      <div class="text">
        ${this.heading ? html`<span class="heading">${this.heading}</span>` : nothing}
        ${this.failure === 'none' ? html`<slot></slot>` : html`<span>${this.#failureText(this.failure)}</span>`}
        <slot name="actions"></slot>
      </div>
    </div>`;
  }
}

define('doras-notice', DorasNotice);

declare global {
  interface HTMLElementTagNameMap {
    'doras-notice': DorasNotice;
  }
}
