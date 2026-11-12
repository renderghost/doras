// Mock of the browser's autofill suggestions: a passkey saved for this
// site, offered in the username or password field, and a code “From Mail”,
// offered in a one-time-code field. The browser draws these under the
// focused field. Storybook only: real browsers draw this themselves.
import '@doras/components';
import { define } from '@doras/components/shared/define';
import { LitElement, css, html } from 'lit';
import { BROWSER_LANG, chrome, send, tag } from '../shared/chrome.ts';

export type AutofillKind = 'passkey' | 'code';

/** Codes are easier to check in groups of three, as Mail shows them. */
const grouped = (code: string): string => code.replace(/(\d{3})(?=\d)/g, '$1 ');

/**
 * @fires doras-mock-autofill - The suggestion was picked. `detail` has `kind` and `value`.
 */
export class DorasMockAutofill extends LitElement {
  static override properties = {
    kind: { type: String, reflect: true },
    value: { type: String },
  };

  declare kind: AutofillKind;
  /** The handle the passkey is for, or the code. */
  declare value: string;

  constructor() {
    super();
    this.kind = 'passkey';
    this.value = '';
  }

  #pick = (): void => {
    send(this, 'doras-mock-autofill', { kind: this.kind, value: this.value });
  };

  static override styles = [
    chrome,
    css`
      :host {
        display: block;
        max-inline-size: 20rem;
      }

      .card {
        overflow: hidden;
        margin-block-start: var(--doras-space-stack-2xs);
        border-radius: var(--doras-radius-control);
        box-shadow: var(--doras-shadow-raised);
      }

      .text {
        display: flex;
        flex-direction: column;
      }

      .value {
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }

      .source {
        color: var(--doras-color-text-subtle);
        font-size: 0.75rem;
      }
    `,
  ];

  override render() {
    const passkey = this.kind === 'passkey';
    return html`<div class="card" part="menu" lang=${BROWSER_LANG.lang} dir=${BROWSER_LANG.dir}>
      ${tag()}
      <button class="option" type="button" @click=${this.#pick}>
        <doras-icon name=${passkey ? 'key-round' : 'mail'}></doras-icon>
        <span class="text">
          <span class="value">${passkey ? this.value : grouped(this.value)}</span>
          <span class="source">${passkey ? 'Passkey saved in this browser' : 'From Mail'}</span>
        </span>
      </button>
    </div>`;
  }
}

define('doras-mock-autofill', DorasMockAutofill);

declare global {
  interface HTMLElementTagNameMap {
    'doras-mock-autofill': DorasMockAutofill;
  }
}
