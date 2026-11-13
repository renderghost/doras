// Provider link: “Manage account on Bluesky”. It names the provider, and
// opens a new tab, saying so, unless sameTab is set.
import { LocaleController } from '@doras/i18n/lit';
import type { DorasProviderLinkProps } from '@doras/specs';
import { LitElement, css, html } from 'lit';
import '../icon/icon.ts';
import '../link/link.ts';
import { providerById } from '../provider-badge/providers.ts';
import { define } from '../shared/define.ts';

export class DorasProviderLink extends LitElement implements DorasProviderLinkProps {
  static override properties = {
    provider: { type: String },
    href: { type: String },
    sameTab: { type: Boolean, attribute: 'same-tab' },
  };

  declare provider: string;
  declare href: string;
  declare sameTab: boolean;

  #i18n = new LocaleController(this);

  constructor() {
    super();
    this.provider = '';
    this.href = '';
    this.sameTab = false;
  }

  static override styles = css`
    :host {
      display: inline-block;
    }

    doras-icon {
      margin-inline-start: var(--doras-space-inline-xs);
    }
  `;

  override render() {
    const name = providerById(this.provider)?.name ?? this.provider;
    return html`<doras-link standalone href=${this.href} ?new-tab=${!this.sameTab}
      >${this.#i18n.t('providerLink.manage', { provider: name })}<doras-icon
        name="external-link"
        size="sm"
      ></doras-icon
    ></doras-link>`;
  }
}

define('doras-provider-link', DorasProviderLink);

declare global {
  interface HTMLElementTagNameMap {
    'doras-provider-link': DorasProviderLink;
  }
}
