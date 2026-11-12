// Step link: a quiet way to another step, such as “Search by name instead”
// or “Try another provider”. With back, an arrow that mirrors right to left.
import type { DorasStepLinkProps } from '@doras/specs';
import { LitElement, css, html, nothing } from 'lit';
import '../icon/icon.ts';
import { define } from '../shared/define.ts';
import { focusRing } from '../shared/styles.ts';

export class DorasStepLink extends LitElement implements DorasStepLinkProps {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override properties = {
    back: { type: Boolean, reflect: true },
  };

  declare back: boolean;

  constructor() {
    super();
    this.back = false;
  }

  static override styles = [
    focusRing,
    css`
      :host {
        display: inline-block;
      }

      button {
        display: inline-flex;
        gap: var(--doras-space-inline-xs);
        align-items: center;
        min-block-size: var(--doras-size-target-min);
        padding: 0;
        border: 0;
        background: none;
        color: var(--doras-color-link-text);
        font: inherit;
        font-weight: var(--doras-type-label-md-font-weight);
        text-decoration: underline;
        text-decoration-color: var(--doras-color-link-decoration);
        text-decoration-thickness: 2px;
        text-underline-offset: 3px;
        cursor: pointer;
      }

      button:hover {
        text-decoration-color: var(--doras-color-link-decoration-hover);
      }
    `,
  ];

  override render() {
    return html`<button part="button" type="button">
      ${this.back ? html`<doras-icon name="arrow-left" size="sm"></doras-icon>` : nothing}<slot
      ></slot>
    </button>`;
  }
}

define('doras-step-link', DorasStepLink);

declare global {
  interface HTMLElementTagNameMap {
    'doras-step-link': DorasStepLink;
  }
}
