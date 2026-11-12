// Busy state: marks an area as loading with aria-busy, and shows a spinner
// and what's happening over it. The spinner's speed comes from the motion
// tokens, so it stops for reduced motion.
import type { DorasBusyStateProps } from '@doras/specs';
import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { announce } from '../announcer/announce.ts';
import { define } from '../shared/define.ts';
import { loaderCircle } from '../shared/icons.ts';
import { spinner } from '../shared/styles.ts';

export class DorasBusyState extends LitElement implements DorasBusyStateProps {
  static override properties = {
    busy: { type: Boolean, reflect: true },
    label: { type: String },
  };

  declare busy: boolean;
  declare label: string | undefined;

  constructor() {
    super();
    this.busy = false;
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('busy') && this.busy && this.label) announce(this.label);
  }

  static override styles = [
    spinner,
    css`
      :host {
        position: relative;
        display: block;
      }

      .overlay {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        gap: var(--doras-space-stack-xs);
        align-items: center;
        justify-content: center;
        border-radius: inherit;
        background: color-mix(in srgb, var(--doras-color-surface-default) 85%, transparent);
        color: var(--doras-color-text-default);
        font-weight: var(--doras-type-label-md-font-weight);
      }

      .spinner svg {
        inline-size: var(--doras-size-icon-lg);
        block-size: var(--doras-size-icon-lg);
      }
    `,
  ];

  override render() {
    return html`<div aria-busy=${this.busy ? 'true' : 'false'} part="region">
      <slot></slot>
      ${
        this.busy
          ? html`<div class="overlay" part="overlay">
              <span class="spinner" aria-hidden="true">${loaderCircle}</span>
              ${this.label ? html`<span>${this.label}</span>` : nothing}
            </div>`
          : nothing
      }
    </div>`;
  }
}

define('doras-busy-state', DorasBusyState);

declare global {
  interface HTMLElementTagNameMap {
    'doras-busy-state': DorasBusyState;
  }
}
