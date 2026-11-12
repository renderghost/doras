// Code field: one input for a sign-in or verification code. Accepts pasted
// codes with spaces, and submits the digits alone.
import type { DorasCodeFieldProps } from '@doras/specs';
import { css, html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { define } from '../shared/define.ts';
import { DorasField } from '../shared/field.ts';

export class DorasCodeField extends DorasField implements DorasCodeFieldProps {
  static override properties = {
    ...DorasField.properties,
    length: { type: Number },
  };

  declare length: number;

  constructor() {
    super();
    this.length = 6;
  }

  /** The code without the spaces or dashes people type or paste. */
  get code(): string {
    return this.value.replace(/[\s-]/g, '');
  }

  protected override formValue(): string {
    return this.code;
  }

  static override styles = [
    DorasField.fieldStyles,
    css`
      input {
        max-inline-size: 16rem;
        font-family: var(--doras-type-code-font-family);
        font-size: var(--doras-type-code-font-size);
        font-variant-numeric: tabular-nums;
        font-weight: var(--doras-type-code-font-weight);
        letter-spacing: var(--doras-type-code-letter-spacing);
      }
    `,
  ];

  protected renderControl() {
    return html`<input
      id="control"
      part="input"
      type="text"
      dir="ltr"
      .value=${this.value}
      inputmode="numeric"
      autocomplete="one-time-code"
      maxlength=${this.length + 2}
      spellcheck="false"
      aria-describedby=${ifDefined(this.describedBy || undefined)}
      aria-invalid=${this.invalid ? 'true' : 'false'}
      ?required=${this.required}
      @input=${this.onInput}
      @change=${this.onChange}
      @keydown=${this.onKeydown}
      @compositionstart=${this.onCompositionStart}
      @compositionend=${this.onCompositionEnd}
    />`;
  }

  protected override renderAfterControl() {
    return html`<slot name="suggestion"></slot>`;
  }
}

define('doras-code-field', DorasCodeField);

declare global {
  interface HTMLElementTagNameMap {
    'doras-code-field': DorasCodeField;
  }
}
