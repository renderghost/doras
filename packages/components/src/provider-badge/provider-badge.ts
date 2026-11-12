// Provider badge: the provider's name and logo. Uses the provider's logo
// when its permission is recorded, a plain initial tile when not, and a
// globe for an address someone typed in.
import type { DorasProviderBadgeProps } from '@doras/specs';
import { LitElement, css, html } from 'lit';
import { initialsFor } from '../avatar/initials.ts';
import '../icon/icon.ts';
import { define } from '../shared/define.ts';
import { providerById } from './providers.ts';

export class DorasProviderBadge extends LitElement implements DorasProviderBadgeProps {
  static override properties = {
    provider: { type: String },
    name: { type: String },
    label: { type: String },
    size: { type: String, reflect: true },
  };

  declare provider: string | undefined;
  declare name: string | undefined;
  declare label: string | undefined;
  declare size: DorasProviderBadgeProps['size'];

  constructor() {
    super();
    this.size = 'md';
  }

  static override styles = css`
    :host {
      --tile: var(--doras-size-icon-lg);

      display: inline-flex;
      gap: var(--doras-space-inline-xs);
      align-items: center;
      color: var(--doras-color-text-default);
      font-weight: var(--doras-type-label-md-font-weight);
      vertical-align: middle;
    }

    :host([size='sm']) {
      --tile: var(--doras-size-icon-md);

      font-size: var(--doras-type-body-sm-font-size);
    }

    .tile {
      display: grid;
      place-items: center;
      flex: none;
      box-sizing: border-box;
      inline-size: var(--tile);
      block-size: var(--tile);
      overflow: hidden;
      border: var(--doras-border-width-default) solid var(--doras-color-border-default);
      border-radius: var(--doras-radius-badge);
      background: var(--doras-color-surface-subtle);
      font-size: calc(var(--tile) * 0.5);
      line-height: 1;
    }

    img {
      inline-size: 100%;
      block-size: 100%;
      object-fit: contain;
    }

    doras-icon {
      inline-size: calc(var(--tile) * 0.65);
      block-size: calc(var(--tile) * 0.65);
    }

    .name {
      overflow-wrap: anywhere;
    }
  `;

  override render() {
    const known = this.provider ? providerById(this.provider) : undefined;
    const name = this.name ?? known?.name ?? this.provider ?? '';
    const tile = known?.logo
      ? html`<img src=${known.logo.src} alt="" />`
      : known
        ? html`<span>${initialsFor(known.name).slice(0, 1)}</span>`
        : html`<doras-icon name="globe"></doras-icon>`;
    return html`<span class="tile" part="tile" aria-hidden="true">${tile}</span
      ><span class="name" part="name">${this.label ?? html`<bdi>${name}</bdi>`}</span>`;
  }
}

define('doras-provider-badge', DorasProviderBadge);

declare global {
  interface HTMLElementTagNameMap {
    'doras-provider-badge': DorasProviderBadge;
  }
}
