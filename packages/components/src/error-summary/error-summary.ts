// Error summary: at the top of a page with more than one field. show()
// fills it and moves focus to it; each link moves focus to its field.
import { LocaleController } from '@doras/i18n/lit';
import type { DorasErrorSummaryProps } from '@doras/specs';
import { LitElement, css, html, nothing } from 'lit';
import '../icon/icon.ts';
import { define } from '../shared/define.ts';
import { focusRing } from '../shared/styles.ts';

export interface SummaryError {
  /** The message, as it appears under the field. */
  message: string;
  /** The field's id, in the same document or shadow root as the summary. */
  target: string;
}

export class DorasErrorSummary extends LitElement implements DorasErrorSummaryProps {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override properties = {
    errors: { attribute: false },
  };

  declare errors: SummaryError[];

  #i18n = new LocaleController(this);

  constructor() {
    super();
    this.errors = [];
  }

  /**
   * Shows the errors and moves focus to the summary, so screen readers read
   * it. Call it on submit. Update errors directly as people fix them, which
   * doesn't move focus.
   */
  async show(errors: SummaryError[]): Promise<void> {
    this.errors = errors;
    await this.updateComplete;
    if (errors.length) this.focus();
  }

  #go(event: Event, target: string): void {
    event.preventDefault();
    const root = this.getRootNode() as Document | ShadowRoot;
    const field = root.getElementById(target);
    if (!field) return;
    field.scrollIntoView({ block: 'center' });
    (field as HTMLElement).focus();
  }

  static override styles = [
    focusRing,
    css`
      :host {
        display: block;
      }

      .summary {
        padding: var(--doras-space-inset-lg);
        border: var(--doras-border-width-focus) solid var(--doras-color-border-error);
        border-radius: var(--doras-radius-card);
        background: var(--doras-color-surface-default);
        color: var(--doras-color-text-default);
      }

      h2 {
        display: flex;
        gap: var(--doras-space-inline-sm);
        align-items: center;
        margin: 0 0 var(--doras-space-stack-sm);
        font-family: var(--doras-type-heading-sm-font-family);
        font-size: var(--doras-type-heading-sm-font-size);
        font-weight: var(--doras-type-heading-sm-font-weight);
        line-height: var(--doras-type-heading-sm-line-height);
      }

      doras-icon {
        color: var(--doras-color-feedback-error-icon);
      }

      ul {
        display: flex;
        flex-direction: column;
        gap: var(--doras-space-stack-xs);
        margin: 0;
        padding-inline-start: var(--doras-space-inset-lg);
      }

      a {
        color: var(--doras-color-text-error);
        font-weight: var(--doras-type-label-md-font-weight);
        text-decoration: underline;
        text-decoration-thickness: 2px;
        text-underline-offset: 3px;
      }
    `,
  ];

  override render() {
    if (!this.errors.length) return nothing;
    return html`<div class="summary" part="summary" tabindex="-1" aria-labelledby="heading">
      <h2 id="heading">
        <doras-icon name="circle-alert"></doras-icon>${this.#i18n.t('errorSummary.heading')}
      </h2>
      <ul>
        ${this.errors.map(
          (e) =>
            html`<li>
              <a href=${`#${e.target}`} @click=${(ev: Event) => this.#go(ev, e.target)}
                >${e.message}</a
              >
            </li>`,
        )}
      </ul>
    </div>`;
  }
}

define('doras-error-summary', DorasErrorSummary);

declare global {
  interface HTMLElementTagNameMap {
    'doras-error-summary': DorasErrorSummary;
  }
}
