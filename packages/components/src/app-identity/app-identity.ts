// App identity: the app's name, logo and verified domain, as on the Connect
// page (“Potluck, potluck.kitchen”).
import type { DorasAppIdentityProps } from '@doras/specs';
import { LitElement, css, html } from 'lit';
import { initialsFor } from '../avatar/initials.ts';
import '../icon/icon.ts';
import { define } from '../shared/define.ts';

export class DorasAppIdentity extends LitElement implements DorasAppIdentityProps {
  static override properties = {
    name: { type: String },
    domain: { type: String },
    logo: { type: String },
  };

  declare name: string;
  declare domain: string;
  declare logo: string | undefined;

  constructor() {
    super();
    this.name = '';
    this.domain = '';
  }

  static override styles = css`
    :host {
      display: flex;
      gap: var(--doras-space-inline-md);
      align-items: center;
      min-inline-size: 0;
      color: var(--doras-color-text-default);
    }

    .tile {
      display: grid;
      place-items: center;
      flex: none;
      box-sizing: border-box;
      inline-size: var(--doras-size-avatar-md);
      block-size: var(--doras-size-avatar-md);
      overflow: hidden;
      border: var(--doras-border-width-default) solid var(--doras-color-border-default);
      border-radius: var(--doras-radius-control);
      background: var(--doras-color-surface-subtle);
      font-weight: var(--doras-type-label-md-font-weight);
    }

    img {
      inline-size: 100%;
      block-size: 100%;
      object-fit: cover;
    }

    .text {
      display: flex;
      flex-direction: column;
      gap: var(--doras-space-stack-2xs);
      min-inline-size: 0;
    }

    .name {
      font-weight: var(--doras-type-label-lg-font-weight);
      overflow-wrap: anywhere;
    }

    .domain {
      display: inline-flex;
      gap: var(--doras-space-inline-xs);
      align-items: center;
      color: var(--doras-color-text-subtle);
      font-size: var(--doras-type-body-sm-font-size);
    }

    .domain bdi {
      overflow-wrap: anywhere;
    }
  `;

  override render() {
    return html`<span class="tile" part="tile" aria-hidden="true"
        >${this.logo ? html`<img src=${this.logo} alt="" />` : initialsFor(this.name).slice(0, 1)}</span
      >
      <span class="text">
        <span class="name" part="name">${this.name}</span>
        <span class="domain" part="domain"
          ><doras-icon name="shield-check" size="sm"></doras-icon><bdi>${this.domain}</bdi></span
        >
      </span>`;
  }
}

define('doras-app-identity', DorasAppIdentity);

declare global {
  interface HTMLElementTagNameMap {
    'doras-app-identity': DorasAppIdentity;
  }
}
