// What every text-like field shares: a label, a hint, a message, form
// association, and input events that wait for text being composed with an
// input method (IME) to finish. The app validates; the field shows the result.
import { LocaleController } from '@doras/i18n/lit';
import { LitElement, css, html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { circleAlert } from './icons.ts';
import { focusRing, visuallyHidden } from './styles.ts';

export abstract class DorasField extends LitElement {
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
  };

  declare label: string;
  declare hint: string | undefined;
  declare error: string | undefined;
  declare name: string;
  declare value: string;
  declare required: boolean;

  protected readonly internals = this.attachInternals();
  protected readonly i18n = new LocaleController(this);
  #composing = false;

  constructor() {
    super();
    this.label = '';
    this.name = '';
    this.value = '';
    this.required = false;
  }

  /** The form it belongs to, as on a native input. */
  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  /** What the form submits. Fields that tidy their value override this. */
  protected formValue(): string {
    return this.value;
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('value')) this.internals.setFormValue(this.formValue());
  }

  formResetCallback(): void {
    this.value = '';
  }

  formStateRestoreCallback(state: string | null): void {
    this.value = state ?? '';
  }

  protected get invalid(): boolean {
    return Boolean(this.error);
  }

  protected onInput(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
    if (!this.#composing && !(event as InputEvent).isComposing) this.emitInput();
  }

  protected onCompositionStart(): void {
    this.#composing = true;
  }

  protected onCompositionEnd(event: CompositionEvent): void {
    this.#composing = false;
    this.value = (event.target as HTMLInputElement).value;
    this.emitInput();
  }

  /** doras-input: the value changed, and no text is being composed. Apps validate live on this. */
  protected emitInput(): void {
    this.dispatchEvent(
      new CustomEvent('doras-input', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** change doesn't cross shadow roots, so the field sends its own. */
  protected onChange(): void {
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /** Enter submits the form, as in a native form, even without a native submit button. */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.isComposing && this.internals.form) {
      event.preventDefault();
      this.internals.form.requestSubmit();
    }
  }

  protected get describedBy(): string {
    return [this.hint ? 'hint' : '', this.messageShown ? 'message' : ''].filter(Boolean).join(' ');
  }

  /** Whether the message area has something in it. */
  protected get messageShown(): boolean {
    return this.invalid;
  }

  protected renderMessage(): TemplateResult | typeof nothing {
    if (!this.error) return nothing;
    return html`<span class="message-icon" aria-hidden="true">${circleAlert}</span>
      <span
        ><span class="visually-hidden">${this.i18n.t('field.errorPrefix')} </span
        >${this.error}</span
      >`;
  }

  protected abstract renderControl(): TemplateResult;

  protected renderAfterControl(): TemplateResult | typeof nothing {
    return nothing;
  }

  static fieldStyles = [
    focusRing,
    visuallyHidden,
    css`
      :host {
        display: block;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: var(--doras-space-stack-xs);
      }

      label {
        color: var(--doras-color-text-default);
        font-family: var(--doras-type-label-md-font-family);
        font-size: var(--doras-type-label-md-font-size);
        font-weight: var(--doras-type-label-md-font-weight);
        line-height: var(--doras-type-label-md-line-height);
      }

      .hint {
        margin: 0;
        color: var(--doras-color-text-subtle);
        font-family: var(--doras-type-body-sm-font-family);
        font-size: var(--doras-type-body-sm-font-size);
        line-height: var(--doras-type-body-sm-line-height);
      }

      input {
        box-sizing: border-box;
        inline-size: 100%;
        min-block-size: var(--doras-size-control-height);
        padding-block: 0;
        padding-inline: var(--doras-space-inset-md);
        border: var(--doras-border-width-strong) solid var(--doras-color-border-control);
        border-radius: var(--doras-radius-control);
        background: var(--doras-color-surface-default);
        color: var(--doras-color-text-default);
        font-family: var(--doras-type-body-lg-font-family);
        font-size: var(--doras-type-body-lg-font-size);
        line-height: var(--doras-type-body-lg-line-height);
      }

      input:focus-visible {
        border-color: var(--doras-color-border-emphasis);
      }

      input[aria-invalid='true'] {
        border-color: var(--doras-color-border-error);
        background: var(--doras-color-feedback-error-surface);
      }

      /* Autofilled values keep the theme's colours. */
      input:autofill {
        box-shadow: inset 0 0 0 100vmax var(--doras-color-surface-default);
        -webkit-text-fill-color: var(--doras-color-text-default);
      }

      .message {
        display: flex;
        gap: var(--doras-space-inline-xs);
        align-items: flex-start;
        color: var(--doras-color-text-error);
        font-family: var(--doras-type-body-sm-font-family);
        font-size: var(--doras-type-body-sm-font-size);
        font-weight: var(--doras-type-label-sm-font-weight);
        line-height: var(--doras-type-body-sm-line-height);
      }

      .message:empty {
        display: none;
      }

      .message.automated {
        color: var(--doras-color-text-automated);
        font-weight: inherit;
      }

      .message-icon {
        display: inline-grid;
        flex: none;
        padding-block-start: 0.1em;
      }

      .message-icon svg {
        inline-size: var(--doras-size-icon-sm);
        block-size: var(--doras-size-icon-sm);
      }
    `,
  ];

  /** The message area's class: automated messages look different. */
  protected messageClassName(): string {
    return 'message';
  }

  override render() {
    return html`<div class="field">
      <label for="control" part="label">${this.label}</label>
      ${this.hint ? html`<p id="hint" class="hint" part="hint">${this.hint}</p>` : nothing}
      ${this.renderControl()} ${this.renderAfterControl()}
      <div id="message" class=${this.messageClassName()} part="message" aria-live="polite">
        ${this.renderMessage()}
      </div>
    </div>`;
  }
}
