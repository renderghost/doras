// A sample component for the docs template (#5). It lives only in Storybook
// and is deleted once the button's real docs land (#7, #8).
import { LocaleController } from '@doras/i18n/lit';
import { LitElement, css, html, nothing } from 'lit';

export type ChipTone = 'neutral' | 'info' | 'success' | 'automated';

const X_ICON = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  width="16"
  height="16"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  <path d="M18 6 6 18" />
  <path d="m6 6 12 12" />
</svg>`;

export class DorasExampleChip extends LitElement {
  static override properties = {
    label: { type: String },
    tone: { type: String, reflect: true },
    selected: { type: Boolean, reflect: true },
    removable: { type: Boolean },
  };

  declare label: string;
  declare tone: ChipTone;
  declare selected: boolean;
  declare removable: boolean;

  // Strings come from the catalogue, in the locale of the nearest lang attribute.
  #i18n = new LocaleController(this);

  constructor() {
    super();
    this.label = '';
    this.tone = 'neutral';
    this.selected = false;
    this.removable = false;
  }

  static override styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--doras-space-inline-xs);

      --chip-surface: var(--doras-color-surface-default);
      --chip-border: var(--doras-color-border-control);
    }

    :host([tone='info']) {
      --chip-surface: var(--doras-color-feedback-info-surface);
      --chip-border: var(--doras-color-feedback-info-border);
    }

    :host([tone='success']) {
      --chip-surface: var(--doras-color-feedback-success-surface);
      --chip-border: var(--doras-color-feedback-success-border);
    }

    :host([tone='automated']) {
      --chip-surface: var(--doras-color-feedback-automated-surface);
      --chip-border: var(--doras-color-feedback-automated-border);
    }

    :host([selected]) {
      --chip-surface: var(--doras-color-selected-surface);
      --chip-border: var(--doras-color-selected-border);
    }

    button {
      min-block-size: var(--doras-size-target-min);
      min-inline-size: var(--doras-size-target-min);
      padding-inline: var(--doras-space-inset-lg);
      border: var(--doras-border-width-default) solid var(--chip-border);
      border-radius: var(--doras-radius-pill);
      background: var(--chip-surface);
      color: var(--doras-color-text-default);
      font-family: var(--doras-type-label-md-font-family);
      font-size: var(--doras-type-label-md-font-size);
      font-weight: var(--doras-type-label-md-font-weight);
      line-height: var(--doras-type-label-md-line-height);
      cursor: pointer;
      transition: background-color var(--doras-motion-duration-fast)
        var(--doras-motion-easing-standard);
    }

    button:hover {
      background: var(--doras-color-action-secondary-surface-hover);
    }

    :host([selected]) button.chip {
      border-width: var(--doras-border-width-strong);
    }

    button:focus-visible {
      outline: var(--doras-border-width-focus) solid var(--doras-color-border-focus);
      outline-offset: var(--doras-focus-offset);
    }

    .remove {
      display: inline-grid;
      place-items: center;
      padding: 0;
      color: var(--doras-color-icon-default);
    }

    @media (forced-colors: active) {
      :host([selected]) button.chip {
        border-color: Highlight;
      }
    }
  `;

  #toggle() {
    this.selected = !this.selected;
    this.dispatchEvent(
      new CustomEvent('doras-toggle', {
        detail: { selected: this.selected },
        bubbles: true,
        composed: true,
      }),
    );
    if (this.selected) {
      this.dispatchEvent(
        new CustomEvent('doras-measure', {
          detail: { name: 'doras.example_chip_selected' },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  #remove() {
    this.dispatchEvent(new CustomEvent('doras-remove', { bubbles: true, composed: true }));
  }

  override render() {
    const removeLabel = this.#i18n.t('example.chip.remove', { label: this.label });
    return html`
      <button
        class="chip"
        type="button"
        aria-pressed=${String(this.selected)}
        @click=${this.#toggle}
      >
        ${this.label}
      </button>
      ${
        this.removable
          ? html`<button
              class="remove"
              type="button"
              aria-label=${removeLabel}
              @click=${this.#remove}
            >
              ${X_ICON}
            </button>`
          : nothing
      }
    `;
  }
}

if (!customElements.get('doras-example-chip')) {
  customElements.define('doras-example-chip', DorasExampleChip);
}

declare global {
  interface HTMLElementTagNameMap {
    'doras-example-chip': DorasExampleChip;
  }
}
