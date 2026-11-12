// Switch: turns one optional thing on or off, such as an optional permission.
import type { DorasSwitchProps } from '@doras/specs';
import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { define } from '../shared/define.ts';
import { focusRing } from '../shared/styles.ts';

export class DorasSwitch extends LitElement implements DorasSwitchProps {
  static formAssociated = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override properties = {
    label: { type: String },
    description: { type: String },
    checked: { type: Boolean, reflect: true },
    name: { type: String, reflect: true },
    value: { type: String },
  };

  declare label: string;
  declare description: string | undefined;
  declare checked: boolean;
  declare name: string;
  declare value: string;

  #internals = this.attachInternals();

  constructor() {
    super();
    this.label = '';
    this.checked = false;
    this.name = '';
    this.value = 'on';
  }

  get form(): HTMLFormElement | null {
    return this.#internals.form;
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('checked') || changed.has('value')) {
      this.#internals.setFormValue(this.checked ? this.value : null);
    }
  }

  formResetCallback(): void {
    this.checked = false;
  }

  #toggle(): void {
    this.checked = !this.checked;
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }

  static override styles = [
    focusRing,
    css`
      :host {
        display: block;
      }

      button {
        display: flex;
        gap: var(--doras-space-inline-md);
        align-items: flex-start;
        justify-content: space-between;
        box-sizing: border-box;
        inline-size: 100%;
        min-block-size: var(--doras-size-target-min);
        padding-block: var(--doras-space-inset-xs);
        padding-inline: 0;
        border: 0;
        background: none;
        color: var(--doras-color-text-default);
        font: inherit;
        text-align: start;
        cursor: pointer;
      }

      .text {
        display: flex;
        flex-direction: column;
        gap: var(--doras-space-stack-2xs);
      }

      .label {
        font-family: var(--doras-type-label-md-font-family);
        font-size: var(--doras-type-label-md-font-size);
        font-weight: var(--doras-type-label-md-font-weight);
        line-height: var(--doras-type-label-md-line-height);
      }

      .description {
        color: var(--doras-color-text-subtle);
        font-size: var(--doras-type-body-sm-font-size);
        line-height: var(--doras-type-body-sm-line-height);
      }

      .track {
        position: relative;
        flex: none;
        box-sizing: border-box;
        inline-size: calc(var(--doras-size-icon-lg) * 1.85);
        block-size: var(--doras-size-icon-lg);
        border: var(--doras-border-width-strong) solid var(--doras-color-border-control);
        border-radius: var(--doras-radius-pill);
        background: var(--doras-color-surface-subtle);
        transition: background-color var(--doras-motion-duration-fast)
          var(--doras-motion-easing-standard);
      }

      .thumb {
        position: absolute;
        inset-block: 2px;
        inset-inline-start: 2px;
        aspect-ratio: 1;
        border-radius: var(--doras-radius-pill);
        background: var(--doras-color-border-control);
        transition: inset-inline-start var(--doras-motion-duration-fast)
          var(--doras-motion-easing-standard);
      }

      :host([checked]) .track {
        border-color: var(--doras-color-selected-border);
        background: var(--doras-color-selected-surface);
      }

      :host([checked]) .thumb {
        inset-inline-start: calc(100% - var(--doras-size-icon-lg) + 2px);
        background: var(--doras-color-selected-icon);
      }
    `,
  ];

  override render() {
    return html`<button
      part="switch"
      type="button"
      role="switch"
      aria-checked=${this.checked ? 'true' : 'false'}
      aria-labelledby="label"
      aria-describedby=${ifDefined(this.description ? 'description' : undefined)}
      @click=${this.#toggle}
    >
      <span class="text">
        <span id="label" class="label">${this.label}</span>
        ${
          this.description
            ? html`<span id="description" class="description">${this.description}</span>`
            : nothing
        }
      </span>
      <span class="track" aria-hidden="true"><span class="thumb"></span></span>
    </button>`;
  }
}

define('doras-switch', DorasSwitch);

declare global {
  interface HTMLElementTagNameMap {
    'doras-switch': DorasSwitch;
  }
}
