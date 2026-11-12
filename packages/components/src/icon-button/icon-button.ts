// Icon button: an action with only an icon. Always named, always 44px.
import type { DorasIconButtonProps } from '@doras/specs';
import { LitElement, css, html } from 'lit';
import { define } from '../shared/define.ts';
import { focusRing } from '../shared/styles.ts';

export class DorasIconButton extends LitElement implements DorasIconButtonProps {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override properties = {
    label: { type: String },
  };

  declare label: string;

  constructor() {
    super();
    this.label = '';
  }

  static override styles = [
    focusRing,
    css`
      :host {
        display: inline-block;
        vertical-align: middle;
      }

      button {
        display: inline-grid;
        place-items: center;
        inline-size: var(--doras-size-target-min);
        block-size: var(--doras-size-target-min);
        padding: 0;
        border: 0;
        border-radius: var(--doras-radius-pill);
        background: none;
        color: var(--doras-color-icon-default);
        cursor: pointer;
        transition: background-color var(--doras-motion-duration-fast)
          var(--doras-motion-easing-standard);
      }

      button:hover {
        background: var(--doras-color-action-secondary-surface-hover);
      }

      ::slotted(svg) {
        inline-size: var(--doras-size-icon-md);
        block-size: var(--doras-size-icon-md);
      }
    `,
  ];

  override render() {
    return html`<button part="button" type="button" aria-label=${this.label}>
      <slot></slot>
    </button>`;
  }
}

define('doras-icon-button', DorasIconButton);

declare global {
  interface HTMLElementTagNameMap {
    'doras-icon-button': DorasIconButton;
  }
}
