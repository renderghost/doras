// Text field: a label, a hint, an input and a message.
import type { DorasTextFieldProps } from '@doras/specs';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { define } from '../shared/define.ts';
import { DorasField } from '../shared/field.ts';

export class DorasTextField extends DorasField implements DorasTextFieldProps {
  static override properties = {
    ...DorasField.properties,
    autocomplete: { type: String },
  };

  declare autocomplete: string | undefined;

  static override styles = DorasField.fieldStyles;

  protected renderControl() {
    return html`<input
      id="control"
      part="input"
      type="text"
      .value=${this.value}
      autocomplete=${ifDefined(this.autocomplete)}
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
}

define('doras-text-field', DorasTextField);

declare global {
  interface HTMLElementTagNameMap {
    'doras-text-field': DorasTextField;
  }
}
