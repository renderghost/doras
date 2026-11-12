// Radio cards: a choice between a few options, such as a provider or a way
// to sign in, drawn as cards. Native radios inside, so arrow keys and forms
// work as people expect. Nothing is chosen until someone chooses.
import type { DorasRadioCardsProps } from '@doras/specs';
import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { LocaleController } from '@doras/i18n/lit';
import { define } from '../shared/define.ts';
import { circleAlert } from '../shared/icons.ts';
import { focusRing, visuallyHidden } from '../shared/styles.ts';

export interface RadioCardOption {
  value: string;
  label: string;
  description?: string;
}

export class DorasRadioCards extends LitElement implements DorasRadioCardsProps {
  static formAssociated = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override properties = {
    label: { type: String },
    hint: { type: String },
    error: { type: String },
    name: { type: String, reflect: true },
    value: { type: String },
    required: { type: Boolean, reflect: true },
    options: { attribute: false },
  };

  declare label: string;
  declare hint: string | undefined;
  declare error: string | undefined;
  declare name: string;
  declare value: string;
  declare required: boolean;
  declare options: RadioCardOption[];

  #internals = this.attachInternals();
  #i18n = new LocaleController(this);

  constructor() {
    super();
    this.label = '';
    this.name = '';
    this.value = '';
    this.required = false;
    this.options = [];
  }

  get form(): HTMLFormElement | null {
    return this.#internals.form;
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('value')) this.#internals.setFormValue(this.value || null);
  }

  formResetCallback(): void {
    this.value = '';
  }

  #onChange(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }

  static override styles = [
    focusRing,
    visuallyHidden,
    css`
      :host {
        display: block;
      }

      fieldset {
        display: flex;
        flex-direction: column;
        gap: var(--doras-space-stack-sm);
        min-inline-size: 0;
        margin: 0;
        padding: 0;
        border: 0;
      }

      legend {
        padding: 0;
        margin-block-end: var(--doras-space-stack-xs);
        color: var(--doras-color-text-default);
        font-family: var(--doras-type-label-md-font-family);
        font-size: var(--doras-type-label-md-font-size);
        font-weight: var(--doras-type-label-md-font-weight);
        line-height: var(--doras-type-label-md-line-height);
      }

      .hint {
        margin: 0;
        color: var(--doras-color-text-subtle);
        font-size: var(--doras-type-body-sm-font-size);
        line-height: var(--doras-type-body-sm-line-height);
      }

      label {
        display: flex;
        gap: var(--doras-space-inline-md);
        align-items: flex-start;
        min-block-size: var(--doras-size-target-min);
        box-sizing: border-box;
        padding: var(--doras-space-inset-md);
        border: var(--doras-border-width-strong) solid var(--doras-color-border-control);
        border-radius: var(--doras-radius-card);
        background: var(--doras-color-surface-default);
        color: var(--doras-color-text-default);
        cursor: pointer;
      }

      label:hover {
        background: var(--doras-color-action-secondary-surface-hover);
      }

      label:has(input:checked) {
        border-color: var(--doras-color-selected-border);
        background: var(--doras-color-selected-surface);
      }

      label:has(input:focus-visible) {
        outline: var(--doras-border-width-focus) solid var(--doras-color-border-focus);
        outline-offset: var(--doras-focus-offset);
      }

      input {
        flex: none;
        inline-size: var(--doras-size-icon-md);
        block-size: var(--doras-size-icon-md);
        margin: 0;
        accent-color: var(--doras-color-selected-icon);
      }

      input:focus-visible {
        outline: none;
      }

      .text {
        display: flex;
        flex-direction: column;
        gap: var(--doras-space-stack-2xs);
      }

      .option-label {
        font-weight: var(--doras-type-label-md-font-weight);
      }

      .description {
        color: var(--doras-color-text-subtle);
        font-size: var(--doras-type-body-sm-font-size);
        line-height: var(--doras-type-body-sm-line-height);
      }

      .message {
        display: flex;
        gap: var(--doras-space-inline-xs);
        color: var(--doras-color-text-error);
        font-size: var(--doras-type-body-sm-font-size);
        font-weight: var(--doras-type-label-sm-font-weight);
      }

      .message:empty {
        display: none;
      }

      .message svg {
        inline-size: var(--doras-size-icon-sm);
        block-size: var(--doras-size-icon-sm);
      }
    `,
  ];

  override render() {
    const describedBy = [this.hint ? 'hint' : '', this.error ? 'message' : '']
      .filter(Boolean)
      .join(' ');
    return html`<fieldset
      role="radiogroup"
      aria-describedby=${ifDefined(describedBy || undefined)}
      aria-invalid=${this.error ? 'true' : 'false'}
      aria-required=${this.required ? 'true' : 'false'}
    >
      <legend part="legend">${this.label}</legend>
      ${this.hint ? html`<p id="hint" class="hint">${this.hint}</p>` : nothing}
      ${this.options.map(
        (option, i) =>
          html`<label part="card">
            <input
              type="radio"
              name="choice"
              .value=${option.value}
              .checked=${option.value === this.value}
              aria-describedby=${ifDefined(option.description ? `description-${i}` : undefined)}
              @change=${this.#onChange}
            />
            <span class="text">
              <span class="option-label">${option.label}</span>
              ${
                option.description
                  ? html`<span id=${`description-${i}`} class="description"
                      >${option.description}</span
                    >`
                  : nothing
              }
            </span>
          </label>`,
      )}
      <div id="message" class="message" aria-live="polite">
        ${
          this.error
            ? html`<span aria-hidden="true">${circleAlert}</span
                ><span
                  ><span class="visually-hidden">${this.#i18n.t('field.errorPrefix')} </span>${
                    this.error
                  }</span
                >`
            : nothing
        }
      </div>
    </fieldset>`;
  }
}

define('doras-radio-cards', DorasRadioCards);

declare global {
  interface HTMLElementTagNameMap {
    'doras-radio-cards': DorasRadioCards;
  }
}
