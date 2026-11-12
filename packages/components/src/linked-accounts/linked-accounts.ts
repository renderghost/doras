// Linked accounts: the app and the Atmosphere account, in two cards, with
// the link badge centred on the seam between them.
import { LocaleController } from '@doras/i18n/lit';
import type { DorasLinkedAccountsProps } from '@doras/specs';
import { LitElement, css, html } from 'lit';
import '../app-identity/app-identity.ts';
import '../avatar/avatar.ts';
import '../handle/handle.ts';
import '../icon/icon.ts';
import '../provider-badge/provider-badge.ts';
import { providerById } from '../provider-badge/providers.ts';
import { define } from '../shared/define.ts';

export class DorasLinkedAccounts extends LitElement implements DorasLinkedAccountsProps {
  static override properties = {
    appName: { type: String, attribute: 'app-name' },
    appDomain: { type: String, attribute: 'app-domain' },
    appLogo: { type: String, attribute: 'app-logo' },
    name: { type: String },
    handle: { type: String },
    avatar: { type: String },
    provider: { type: String },
  };

  declare appName: string;
  declare appDomain: string;
  declare appLogo: string | undefined;
  declare name: string;
  declare handle: string;
  declare avatar: string | undefined;
  declare provider: string;

  #i18n = new LocaleController(this);

  constructor() {
    super();
    this.appName = '';
    this.appDomain = '';
    this.name = '';
    this.handle = '';
    this.provider = '';
  }

  static override styles = css`
    :host {
      display: block;
    }

    .pair {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: var(--doras-space-stack-xs);
    }

    .card {
      display: flex;
      gap: var(--doras-space-inline-md);
      align-items: center;
      min-inline-size: 0;
      padding-block: var(--doras-space-inset-md);
      padding-inline: var(--doras-space-inset-lg);
      border: var(--doras-border-width-default) solid var(--doras-color-border-strong);
      border-radius: var(--doras-radius-card);
      background: var(--doras-color-surface-raised);
      color: var(--doras-color-text-default);
    }

    .text {
      display: flex;
      flex-direction: column;
      gap: var(--doras-space-stack-2xs);
      min-inline-size: 0;
    }

    doras-handle {
      font-weight: var(--doras-type-label-lg-font-weight);
    }

    .hosted {
      color: var(--doras-color-text-subtle);
      font-size: var(--doras-type-body-sm-font-size);
    }

    /* Centred on the seam, in both directions, with no transform to flip in RTL. */
    .link {
      position: absolute;
      inset: 0;
      z-index: 1;
      display: grid;
      place-items: center;
      box-sizing: border-box;
      inline-size: var(--doras-size-icon-lg);
      block-size: var(--doras-size-icon-lg);
      margin: auto;
      border: var(--doras-border-width-default) solid var(--doras-color-selected-border);
      border-radius: var(--doras-radius-pill);
      background: var(--doras-color-selected-surface);
      box-shadow: 0 0 0 3px var(--doras-color-surface-default);
      color: var(--doras-color-selected-icon);
    }
  `;

  override render() {
    const providerName = providerById(this.provider)?.name ?? this.provider;
    return html`<div class="pair" part="pair">
      <div class="card" part="app">
        <doras-app-identity
          name=${this.appName}
          domain=${this.appDomain}
          .logo=${this.appLogo}
        ></doras-app-identity>
      </div>
      <div class="card" part="account">
        <doras-avatar name=${this.name} .src=${this.avatar} decorative></doras-avatar>
        <span class="text">
          <doras-handle .handle=${this.handle}></doras-handle>
          <doras-provider-badge
            class="hosted"
            provider=${this.provider}
            size="sm"
            label=${this.#i18n.t('identity.hostedBy', { provider: providerName })}
          ></doras-provider-badge>
        </span>
      </div>
      <span class="link" aria-hidden="true"><doras-icon name="link-2" size="sm"></doras-icon></span>
    </div>`;
  }
}

define('doras-linked-accounts', DorasLinkedAccounts);

declare global {
  interface HTMLElementTagNameMap {
    'doras-linked-accounts': DorasLinkedAccounts;
  }
}
