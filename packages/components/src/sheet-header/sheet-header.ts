// Sheet header: back and close, with “Atmosphere account” between them.
// The sheet (#14) moves focus and returns it to whatever opened it.
import { LocaleController } from '@doras/i18n/lit';
import type { DorasSheetHeaderProps } from '@doras/specs';
import { LitElement, css, html, nothing } from 'lit';
import '../atmosphere-mark/atmosphere-mark.ts';
import '../icon-button/icon-button.ts';
import '../icon/icon.ts';
import { define } from '../shared/define.ts';

export class DorasSheetHeader extends LitElement implements DorasSheetHeaderProps {
  static override properties = {
    back: { type: Boolean, reflect: true },
  };

  declare back: boolean;

  #i18n = new LocaleController(this);

  constructor() {
    super();
    this.back = false;
  }

  #send(name: 'doras-back' | 'doras-close'): void {
    this.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true }));
  }

  static override styles = css`
    :host {
      display: block;
    }

    header {
      display: grid;
      grid-template-columns: var(--doras-size-target-min) 1fr var(--doras-size-target-min);
      align-items: center;
      gap: var(--doras-space-inline-sm);
    }

    .brand {
      display: flex;
      gap: var(--doras-space-inline-xs);
      align-items: center;
      justify-content: center;
      color: var(--doras-color-text-default);
      font-family: var(--doras-type-label-sm-font-family);
      font-size: var(--doras-type-label-sm-font-size);
      font-weight: var(--doras-type-label-sm-font-weight);
      text-align: center;
      grid-column: 2;
    }

    .end {
      grid-column: 3;
    }
  `;

  override render() {
    return html`<header part="header">
      ${
        this.back
          ? html`<doras-icon-button
              label=${this.#i18n.t('common.back')}
              @click=${() => this.#send('doras-back')}
              ><doras-icon name="arrow-left"></doras-icon
            ></doras-icon-button>`
          : nothing
      }
      <span class="brand"
        ><doras-atmosphere-mark decorative size="md"></doras-atmosphere-mark
        >${this.#i18n.t('sheet.brand')}</span
      >
      <doras-icon-button
        class="end"
        label=${this.#i18n.t('common.close')}
        @click=${() => this.#send('doras-close')}
        ><doras-icon name="x"></doras-icon
      ></doras-icon-button>
    </header>`;
  }
}

define('doras-sheet-header', DorasSheetHeader);

declare global {
  interface HTMLElementTagNameMap {
    'doras-sheet-header': DorasSheetHeader;
  }
}
