// Details: content that's hidden until asked for, such as “Technical
// details” on the Connect page. Native details and summary, so find in page
// opens it in browsers that support that.
import type { DorasDetailsProps } from '@doras/specs';
import { LitElement, css, html } from 'lit';
import '../icon/icon.ts';
import { define } from '../shared/define.ts';
import { focusRing } from '../shared/styles.ts';

export class DorasDetails extends LitElement implements DorasDetailsProps {
  static override properties = {
    open: { type: Boolean, reflect: true },
  };

  declare open: boolean;

  constructor() {
    super();
    this.open = false;
  }

  #onToggle(event: Event): void {
    this.open = (event.target as HTMLDetailsElement).open;
    this.dispatchEvent(
      new CustomEvent('doras-toggle', {
        detail: { open: this.open },
        bubbles: true,
        composed: true,
      }),
    );
  }

  static override styles = [
    focusRing,
    css`
      :host {
        display: block;
      }

      details {
        border: var(--doras-border-width-default) solid var(--doras-color-border-strong);
        border-radius: var(--doras-radius-control);
        background: var(--doras-color-surface-default);
        color: var(--doras-color-text-default);
      }

      summary {
        display: flex;
        gap: var(--doras-space-inline-sm);
        align-items: center;
        min-block-size: var(--doras-size-target-min);
        box-sizing: border-box;
        padding-inline: var(--doras-space-inset-md);
        border-radius: var(--doras-radius-control);
        font-weight: var(--doras-type-label-md-font-weight);
        list-style: none;
        cursor: pointer;
      }

      summary::-webkit-details-marker {
        display: none;
      }

      doras-icon {
        transition: transform var(--doras-motion-duration-fast) var(--doras-motion-easing-standard);
      }

      details[open] doras-icon {
        transform: rotate(180deg);
      }

      .content {
        padding: 0 var(--doras-space-inset-md) var(--doras-space-inset-md);
        overflow-wrap: anywhere;
      }
    `,
  ];

  override render() {
    return html`<details part="details" ?open=${this.open} @toggle=${this.#onToggle}>
      <summary part="summary">
        <doras-icon name="chevron-down"></doras-icon><slot name="summary"></slot>
      </summary>
      <div class="content" part="content"><slot></slot></div>
    </details>`;
  }
}

define('doras-details', DorasDetails);

declare global {
  interface HTMLElementTagNameMap {
    'doras-details': DorasDetails;
  }
}
