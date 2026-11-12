// Handle field: a combobox (ARIA 1.2) that forgives how people type handles
// and suggests accounts as they type. The app looks accounts up: the field
// sends doras-query, and shows the suggestions the app gives it.
import { format, withoutIsolation } from '@doras/i18n';
import type { DorasHandleFieldProps } from '@doras/specs';
import { css, html, nothing, type PropertyValues } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { define } from '../shared/define.ts';
import { DorasField } from '../shared/field.ts';
import { wandSparkles } from '../shared/icons.ts';
import {
  DEFAULT_DOMAINS,
  readHandle,
  type HandleDomains,
  type HandleReading,
} from './read-handle.ts';

export interface HandleSuggestion {
  /** The handle, without an @. */
  handle: string;
  /** The account's display name. */
  name?: string;
  /** The provider that hosts it, such as Bluesky. */
  hostedBy?: string;
  /** Shown as “Did you mean”, in the automated style, when it corrects a slip. */
  didYouMean?: boolean;
}

export class DorasHandleField extends DorasField implements DorasHandleFieldProps {
  static override properties = {
    ...DorasField.properties,
    suggestions: { attribute: false },
    domains: { attribute: false },
    active: { state: true },
    expanded: { state: true },
    reading: { state: true },
  };

  declare suggestions: HandleSuggestion[];
  declare domains: HandleDomains;
  declare active: number;
  declare expanded: boolean;
  declare reading: HandleReading | null;

  constructor() {
    super();
    this.suggestions = [];
    this.domains = DEFAULT_DOMAINS;
    this.active = -1;
    this.expanded = false;
    this.reading = null;
  }

  /** The handle the field reads from what was typed, without an @. */
  get handle(): string {
    return readHandle(this.value, this.domains).handle;
  }

  protected override formValue(): string {
    const reading = readHandle(this.value, this.domains);
    return reading.kind === 'handle' ? reading.handle : this.value.trim();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('suggestions')) {
      this.active = -1;
      this.expanded = this.suggestions.length > 0 && this.matches(':focus-within');
    }
  }

  protected override emitInput(): void {
    super.emitInput();
    this.reading = null;
    this.dispatchEvent(
      new CustomEvent('doras-query', {
        detail: { text: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** On leaving the field, say how what was typed was read, if it was corrected. */
  protected override onChange(): void {
    const reading = readHandle(this.value, this.domains);
    this.reading = reading.fixes.length ? reading : null;
    super.onChange();
  }

  #select(index: number): void {
    const suggestion = this.suggestions[index];
    if (!suggestion) return;
    this.value = suggestion.handle;
    this.reading = null;
    this.expanded = false;
    this.active = -1;
    this.dispatchEvent(
      new CustomEvent('doras-select', {
        detail: { handle: suggestion.handle },
        bubbles: true,
        composed: true,
      }),
    );
  }

  protected override onKeydown(event: KeyboardEvent): void {
    if (event.isComposing) return;
    const count = this.suggestions.length;
    switch (event.key) {
      case 'ArrowDown':
        if (!count) return;
        event.preventDefault();
        this.expanded = true;
        this.active = (this.active + 1) % count;
        return;
      case 'ArrowUp':
        if (!count) return;
        event.preventDefault();
        this.expanded = true;
        this.active = this.active <= 0 ? count - 1 : this.active - 1;
        return;
      case 'Enter':
        if (this.expanded && this.active >= 0) {
          event.preventDefault();
          this.#select(this.active);
          return;
        }
        super.onKeydown(event);
        return;
      case 'Escape':
        if (this.expanded) {
          event.preventDefault();
          this.expanded = false;
          this.active = -1;
        }
        return;
    }
  }

  #onFocusOut = (event: FocusEvent): void => {
    if (
      !this.contains(event.relatedTarget as Node) &&
      !this.renderRoot.contains(event.relatedTarget as Node)
    ) {
      this.expanded = false;
      this.active = -1;
    }
  };

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('focusout', this.#onFocusOut);
  }

  override disconnectedCallback(): void {
    this.removeEventListener('focusout', this.#onFocusOut);
    super.disconnectedCallback();
  }

  protected override get messageShown(): boolean {
    return this.invalid || Boolean(this.reading);
  }

  protected override messageClassName(): string {
    return this.invalid || !this.reading ? 'message' : 'message automated';
  }

  protected override renderMessage() {
    if (this.error || !this.reading) return super.renderMessage();
    const t = this.i18n.t.bind(this.i18n);
    const fix = this.reading.fixes[this.reading.fixes.length - 1];
    const why =
      fix?.type === 'ending'
        ? t('handle.fixEnding', {
            ending: fix.ending,
            correct: fix.correct,
            provider: fix.provider,
          })
        : fix?.type === 'link'
          ? t('handle.fixLink')
          : t('handle.fixAtSign');
    return html`<span class="message-icon" aria-hidden="true">${wandSparkles}</span>
      <span
        >${t('handle.readAs', { typed: this.value.trim(), handle: `@${this.reading.handle}` })}
        ${why}</span
      >`;
  }

  static override styles = [
    DorasField.fieldStyles,
    css`
      .combo {
        position: relative;
      }

      [role='listbox'] {
        position: absolute;
        z-index: 3;
        inset-block-start: calc(100% + var(--doras-space-stack-xs));
        inset-inline: 0;
        box-sizing: border-box;
        max-block-size: 20rem;
        margin: 0;
        padding: var(--doras-space-inset-xs);
        overflow: auto;
        border: var(--doras-border-width-default) solid var(--doras-color-border-strong);
        border-radius: var(--doras-radius-card);
        background: var(--doras-color-surface-raised);
        box-shadow: var(--doras-shadow-overlay);
        list-style: none;
      }

      [role='listbox'][hidden] {
        display: none;
      }

      [role='option'] {
        display: flex;
        flex-wrap: wrap;
        gap: 0 var(--doras-space-inline-sm);
        align-items: baseline;
        min-block-size: var(--doras-size-target-min);
        box-sizing: border-box;
        padding-block: var(--doras-space-inset-xs);
        padding-inline: var(--doras-space-inset-sm);
        border-radius: var(--doras-radius-control);
        color: var(--doras-color-text-default);
        cursor: pointer;
        overflow-wrap: anywhere;
      }

      [role='option']:hover,
      [role='option'][aria-selected='true'] {
        background: var(--doras-color-action-secondary-surface-hover);
      }

      [role='option'].did-you-mean {
        background: var(--doras-color-feedback-automated-surface);
      }

      .did-you-mean-label {
        display: flex;
        flex-basis: 100%;
        gap: var(--doras-space-inline-xs);
        align-items: center;
        color: var(--doras-color-text-automated);
        font-size: var(--doras-type-caption-font-size);
        font-weight: var(--doras-type-label-sm-font-weight);
      }

      .did-you-mean-label svg {
        inline-size: var(--doras-size-icon-sm);
        block-size: var(--doras-size-icon-sm);
      }

      .name {
        font-weight: var(--doras-type-label-md-font-weight);
      }

      .handle,
      .hosted {
        color: var(--doras-color-text-subtle);
        font-size: var(--doras-type-body-sm-font-size);
      }
    `,
  ];

  protected renderControl() {
    const open = this.expanded && this.suggestions.length > 0;
    const t = (key: 'handle.didYouMean' | 'identity.hostedBy', values?: Record<string, string>) =>
      withoutIsolation(format(this.i18n.locale, key, values));
    return html`<div class="combo">
      <input
        id="control"
        part="input"
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded=${open ? 'true' : 'false'}
        aria-controls="suggestions"
        aria-activedescendant=${ifDefined(this.active >= 0 && open ? `option-${this.active}` : undefined)}
        .value=${this.value}
        autocomplete="username"
        autocapitalize="none"
        autocorrect="off"
        spellcheck="false"
        enterkeyhint="go"
        aria-describedby=${ifDefined(this.describedBy || undefined)}
        aria-invalid=${this.invalid ? 'true' : 'false'}
        ?required=${this.required}
        @input=${this.onInput}
        @change=${this.onChange}
        @keydown=${this.onKeydown}
        @compositionstart=${this.onCompositionStart}
        @compositionend=${this.onCompositionEnd}
      />
      <ul
        id="suggestions"
        role="listbox"
        part="suggestions"
        aria-label=${this.label}
        ?hidden=${!open}
      >
        ${this.suggestions.map(
          (s, i) =>
            html`<li
              id=${`option-${i}`}
              role="option"
              class=${s.didYouMean ? 'did-you-mean' : nothing}
              aria-selected=${i === this.active ? 'true' : 'false'}
              @mousedown=${(e: Event) => e.preventDefault()}
              @click=${() => this.#select(i)}
            >
              ${
                s.didYouMean
                  ? html`<span class="did-you-mean-label"
                      ><span aria-hidden="true">${wandSparkles}</span
                      >${t('handle.didYouMean')}</span
                    >`
                  : nothing
              }
              ${s.name ? html`<span class="name">${s.name}</span>` : nothing}
              <bdi class="handle">@${s.handle}</bdi>
              ${
                s.hostedBy
                  ? html`<span class="hosted"
                      >${t('identity.hostedBy', { provider: s.hostedBy })}</span
                    >`
                  : nothing
              }
            </li>`,
        )}
      </ul>
      <span class="visually-hidden" role="status"
        >${
          this.matches(':focus-within') && this.value.trim().length > 1
            ? this.i18n.t('handle.suggestionCount', { count: this.suggestions.length })
            : ''
        }</span
      >
    </div>`;
  }
}

define('doras-handle-field', DorasHandleField);

declare global {
  interface HTMLElementTagNameMap {
    'doras-handle-field': DorasHandleField;
  }
}
