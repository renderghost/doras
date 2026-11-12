// Divider: a plain rule, or one with “or” between two ways to do the same thing.
import { LocaleController } from '@doras/i18n/lit';
import type { DorasDividerProps } from '@doras/specs';
import { LitElement, css, html } from 'lit';
import { define } from '../shared/define.ts';

export class DorasDivider extends LitElement implements DorasDividerProps {
  static override properties = {
    variant: { type: String, reflect: true },
  };

  declare variant: DorasDividerProps['variant'];

  #i18n = new LocaleController(this);

  constructor() {
    super();
    this.variant = 'plain';
  }

  static override styles = css`
    :host {
      display: block;
      margin-block: var(--doras-space-stack-md);
    }

    hr {
      margin: 0;
      border: 0;
      border-block-start: var(--doras-border-width-default) solid var(--doras-color-border-default);
    }

    .or {
      display: flex;
      gap: var(--doras-space-inline-md);
      align-items: center;
      color: var(--doras-color-text-subtle);
      font-size: var(--doras-type-body-sm-font-size);
      line-height: var(--doras-type-body-sm-line-height);
    }

    .line {
      flex: 1;
      border-block-start: var(--doras-border-width-default) solid var(--doras-color-border-default);
    }
  `;

  override render() {
    // A separator's content isn't read, so the “or” version is plain text
    // between two decorative lines.
    return this.variant === 'or'
      ? html`<div class="or" part="divider">
          <span class="line" aria-hidden="true"></span><span>${this.#i18n.t('divider.or')}</span
          ><span class="line" aria-hidden="true"></span>
        </div>`
      : html`<hr part="divider" />`;
  }
}

define('doras-divider', DorasDivider);

declare global {
  interface HTMLElementTagNameMap {
    'doras-divider': DorasDivider;
  }
}
