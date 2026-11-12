// Password field: show and hide, the right autocomplete for signing in or up,
// and a slot for the browser's passkey suggestion.
import type { DorasPasswordFieldProps } from '@doras/specs';
import { css, html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { define } from '../shared/define.ts';
import { DorasField } from '../shared/field.ts';
import { eye, eyeOff } from '../shared/icons.ts';

const AUTOCOMPLETE: Record<DorasPasswordFieldProps['purpose'], string> = {
  current: 'current-password webauthn',
  new: 'new-password',
};

export class DorasPasswordField extends DorasField implements DorasPasswordFieldProps {
  static override properties = {
    ...DorasField.properties,
    purpose: { type: String },
    shown: { state: true },
  };

  declare purpose: DorasPasswordFieldProps['purpose'];
  declare shown: boolean;

  constructor() {
    super();
    this.purpose = 'current';
    this.shown = false;
  }

  static override styles = [
    DorasField.fieldStyles,
    css`
      .control {
        position: relative;
      }

      input {
        padding-inline-end: calc(var(--doras-size-target-min) + var(--doras-space-inset-xs));
      }

      .toggle {
        position: absolute;
        inset-block: 0;
        inset-inline-end: var(--doras-space-inset-xs);
        display: inline-grid;
        place-items: center;
        inline-size: var(--doras-size-target-min);
        margin-block: auto;
        block-size: var(--doras-size-target-min);
        padding: 0;
        border: 0;
        border-radius: var(--doras-radius-pill);
        background: none;
        color: var(--doras-color-icon-default);
        cursor: pointer;
      }

      .toggle:hover {
        background: var(--doras-color-action-secondary-surface-hover);
      }

      .toggle svg {
        inline-size: var(--doras-size-icon-md);
        block-size: var(--doras-size-icon-md);
      }
    `,
  ];

  #toggle(): void {
    this.shown = !this.shown;
  }

  protected renderControl() {
    return html`<div class="control">
      <input
        id="control"
        part="input"
        type=${this.shown ? 'text' : 'password'}
        .value=${this.value}
        autocomplete=${AUTOCOMPLETE[this.purpose]}
        autocapitalize="none"
        spellcheck="false"
        aria-describedby=${ifDefined(this.describedBy || undefined)}
        aria-invalid=${this.invalid ? 'true' : 'false'}
        ?required=${this.required}
        @input=${this.onInput}
        @change=${this.onChange}
        @keydown=${this.onKeydown}
        @compositionstart=${this.onCompositionStart}
        @compositionend=${this.onCompositionEnd}
      />
      <button
        class="toggle"
        part="toggle"
        type="button"
        aria-label=${this.i18n.t(this.shown ? 'password.hide' : 'password.show')}
        @click=${this.#toggle}
      >
        ${this.shown ? eyeOff : eye}
      </button>
    </div>`;
  }

  protected override renderAfterControl() {
    return html`<slot name="suggestion"></slot>`;
  }
}

define('doras-password-field', DorasPasswordField);

declare global {
  interface HTMLElementTagNameMap {
    'doras-password-field': DorasPasswordField;
  }
}
