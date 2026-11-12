// Email field: a text field tuned for email addresses.
import type { DorasEmailFieldProps } from '@doras/specs';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { define } from '../shared/define.ts';
import { DorasField } from '../shared/field.ts';

export class DorasEmailField extends DorasField implements DorasEmailFieldProps {
  static override styles = DorasField.fieldStyles;

  protected renderControl() {
    return html`<input
      id="control"
      part="input"
      type="email"
      .value=${this.value}
      autocomplete="email"
      autocapitalize="none"
      spellcheck="false"
      enterkeyhint="next"
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

define('doras-email-field', DorasEmailField);

declare global {
  interface HTMLElementTagNameMap {
    'doras-email-field': DorasEmailField;
  }
}
