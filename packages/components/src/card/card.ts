// Card: the provider page's main card.
import type { DorasCardProps } from '@doras/specs';
import { LitElement, css, html } from 'lit';
import { define } from '../shared/define.ts';

export class DorasCard extends LitElement implements DorasCardProps {
  static override styles = css`
    :host {
      display: block;
      box-sizing: border-box;
      padding: var(--doras-space-inset-xl);
      border: var(--doras-border-width-default) solid var(--doras-color-border-default);
      border-radius: var(--doras-radius-card);
      background: var(--doras-color-surface-raised);
      box-shadow: var(--doras-shadow-raised);
      color: var(--doras-color-text-default);
    }

    @media (width < 37.5rem) {
      :host {
        padding: var(--doras-space-inset-lg);
      }
    }
  `;

  override render() {
    return html`<slot></slot>`;
  }
}

define('doras-card', DorasCard);

declare global {
  interface HTMLElementTagNameMap {
    'doras-card': DorasCard;
  }
}
