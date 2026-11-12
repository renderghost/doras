// Disclosure: shows and hides content most people don't need.
import type { DorasDisclosureEventMap, DorasDisclosureProps } from '@doras/specs';
import { LitElement, css, html } from 'lit';
import { define } from '../shared/define.ts';
import { chevronDown } from '../shared/icons.ts';
import { focusRing } from '../shared/styles.ts';

export class DorasDisclosure extends LitElement implements DorasDisclosureProps {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override properties = {
    open: { type: Boolean, reflect: true },
    variant: { type: String, reflect: true },
  };

  declare open: boolean;
  declare variant: DorasDisclosureProps['variant'];

  constructor() {
    super();
    this.open = false;
    this.variant = 'panel';
  }

  #toggle(): void {
    this.open = !this.open;
    const event: DorasDisclosureEventMap['doras-toggle'] = new CustomEvent('doras-toggle', {
      detail: { open: this.open },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  static override styles = [
    focusRing,
    css`
      :host {
        display: block;
      }

      .trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--doras-space-inline-sm);
        box-sizing: border-box;
        inline-size: 100%;
        min-block-size: var(--doras-size-target-min);
        padding-block: var(--doras-space-inset-md);
        padding-inline: var(--doras-space-inset-lg);
        border: var(--doras-border-width-default) solid var(--doras-color-border-strong);
        border-radius: var(--doras-radius-control);
        background: var(--doras-color-surface-default);
        color: var(--doras-color-text-default);
        font-family: var(--doras-type-label-md-font-family);
        font-size: var(--doras-type-label-md-font-size);
        font-weight: var(--doras-type-label-md-font-weight);
        line-height: var(--doras-type-label-md-line-height);
        text-align: start;
        cursor: pointer;
        transition: background-color var(--doras-motion-duration-fast)
          var(--doras-motion-easing-standard);
      }

      .trigger:hover {
        background: var(--doras-color-action-secondary-surface-hover);
      }

      :host([variant='link']) .trigger {
        justify-content: flex-start;
        inline-size: auto;
        padding-inline: 0;
        border-color: transparent;
        background: none;
        color: var(--doras-color-link-text);
        text-decoration: underline;
        text-decoration-color: var(--doras-color-link-decoration);
        text-decoration-thickness: 2px;
        text-underline-offset: 3px;
      }

      :host([variant='link']) .trigger:hover {
        text-decoration-color: var(--doras-color-link-decoration-hover);
      }

      .chevron {
        display: inline-grid;
        flex: none;
        color: var(--doras-color-icon-default);
        transition: transform var(--doras-motion-duration-fast) var(--doras-motion-easing-standard);
      }

      .chevron svg {
        inline-size: var(--doras-size-icon-md);
        block-size: var(--doras-size-icon-md);
      }

      :host([open]) .chevron {
        transform: rotate(180deg);
      }

      .content {
        padding-block-start: var(--doras-space-stack-md);
      }

      .content[hidden] {
        display: none;
      }
    `,
  ];

  override render() {
    return html`<button
        part="trigger"
        class="trigger"
        type="button"
        aria-expanded=${String(this.open)}
        aria-controls="content"
        @click=${this.#toggle}
      >
        <span><slot name="summary"></slot></span>
        <span class="chevron" aria-hidden="true">${chevronDown}</span>
      </button>
      <div id="content" part="content" class="content" ?hidden=${!this.open}><slot></slot></div>`;
  }
}

define('doras-disclosure', DorasDisclosure);

declare global {
  interface HTMLElementTagNameMap {
    'doras-disclosure': DorasDisclosure;
  }
}
