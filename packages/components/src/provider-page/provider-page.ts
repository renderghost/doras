// Provider page shell: the provider's own page. A skip link, a header with
// the provider and “Atmosphere provider”, the main content, and the
// reassuring footer: the app never sees the password.
import { LocaleController } from '@doras/i18n/lit';
import type { DorasProviderPageShellProps } from '@doras/specs';
import { LitElement, css, html } from 'lit';
import '../atmosphere-mark/atmosphere-mark.ts';
import '../icon/icon.ts';
import '../provider-badge/provider-badge.ts';
import { providerById } from '../provider-badge/providers.ts';
import { define } from '../shared/define.ts';
import '../skip-link/skip-link.ts';

export class DorasProviderPage extends LitElement implements DorasProviderPageShellProps {
  static override properties = {
    provider: { type: String },
    appName: { type: String, attribute: 'app-name' },
    appHosted: { type: Boolean, attribute: 'app-hosted' },
  };

  declare provider: string;
  declare appName: string;
  declare appHosted: boolean;

  #i18n = new LocaleController(this);

  constructor() {
    super();
    this.provider = '';
    this.appName = '';
    this.appHosted = false;
  }

  static override styles = css`
    :host {
      display: block;
      min-block-size: 100dvh;
      background: var(--doras-color-surface-subtle);
      color: var(--doras-color-text-default);
    }

    .page {
      display: flex;
      flex-direction: column;
      gap: var(--doras-space-stack-xl);
      box-sizing: border-box;
      inline-size: min(100%, var(--doras-size-content-narrow) + 2 * var(--doras-space-inset-lg));
      margin-inline: auto;
      padding: var(--doras-space-inset-lg);
    }

    header {
      display: flex;
      flex-wrap: wrap;
      gap: var(--doras-space-inline-md);
      align-items: center;
      justify-content: space-between;
    }

    /* Out of the header's layout: the link positions itself when focused. */
    doras-skip-link {
      display: contents;
    }

    .network {
      display: inline-flex;
      gap: var(--doras-space-inline-xs);
      align-items: center;
      color: var(--doras-color-text-subtle);
      font-size: var(--doras-type-caption-font-size);
    }

    main:focus {
      outline: none;
    }

    footer {
      display: flex;
      gap: var(--doras-space-inline-sm);
      align-items: flex-start;
      color: var(--doras-color-text-subtle);
      font-size: var(--doras-type-body-sm-font-size);
      line-height: var(--doras-type-body-sm-line-height);
    }
  `;

  override render() {
    const name = providerById(this.provider)?.name ?? this.provider;
    // The skip link opens the banner, so it is the first Tab stop and, like
    // everything else on the page, inside a landmark.
    return html`<div class="page">
      <header part="header">
        <doras-skip-link target="main"></doras-skip-link>
        <doras-provider-badge provider=${this.provider}></doras-provider-badge>
        <span class="network"
          ><doras-atmosphere-mark decorative size="md"></doras-atmosphere-mark
          >${this.#i18n.t('provider.label')}</span
        >
      </header>
      <main id="main" part="main"><slot></slot></main>
      <footer part="footer">
        <doras-icon name="lock" size="sm"></doras-icon>
        <span
          >${
            this.appHosted
              ? this.#i18n.t('provider.footApp', { app: this.appName })
              : this.#i18n.t('provider.foot', { provider: name, app: this.appName })
          }</span
        >
      </footer>
    </div>`;
  }
}

define('doras-provider-page', DorasProviderPage);

declare global {
  interface HTMLElementTagNameMap {
    'doras-provider-page': DorasProviderPage;
  }
}
