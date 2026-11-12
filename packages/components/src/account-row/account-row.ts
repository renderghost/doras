// Account row: avatar, name, handle and “Hosted by [provider]”, with a
// “Did you mean” style for corrections.
import { LocaleController } from '@doras/i18n/lit';
import type { DorasAccountRowProps } from '@doras/specs';
import { LitElement, css, html, nothing } from 'lit';
import '../avatar/avatar.ts';
import '../handle/handle.ts';
import '../icon/icon.ts';
import '../provider-badge/provider-badge.ts';
import { providerById } from '../provider-badge/providers.ts';
import { define } from '../shared/define.ts';

export class DorasAccountRow extends LitElement implements DorasAccountRowProps {
  static override properties = {
    name: { type: String },
    handle: { type: String },
    avatar: { type: String },
    provider: { type: String },
    didYouMean: { type: Boolean, reflect: true, attribute: 'did-you-mean' },
  };

  declare name: string;
  declare handle: string;
  declare avatar: string | undefined;
  declare provider: string | undefined;
  declare didYouMean: boolean;

  #i18n = new LocaleController(this);

  constructor() {
    super();
    this.name = '';
    this.handle = '';
    this.didYouMean = false;
  }

  static override styles = css`
    :host {
      display: block;
      color: var(--doras-color-text-default);
    }

    .row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--doras-space-stack-xs) var(--doras-space-inline-md);
      align-items: center;
    }

    :host([did-you-mean]) .row {
      padding: var(--doras-space-inset-sm);
      border-radius: var(--doras-radius-control);
      background: var(--doras-color-feedback-automated-surface);
    }

    .did-you-mean {
      display: flex;
      flex-basis: 100%;
      gap: var(--doras-space-inline-xs);
      align-items: center;
      color: var(--doras-color-text-automated);
      font-size: var(--doras-type-caption-font-size);
      font-weight: var(--doras-type-label-sm-font-weight);
    }

    .text {
      display: flex;
      flex: 1 1 10rem;
      flex-direction: column;
      min-inline-size: 0;
    }

    .name {
      font-weight: var(--doras-type-label-md-font-weight);
      overflow-wrap: anywhere;
    }

    doras-handle,
    .hosted {
      color: var(--doras-color-text-subtle);
      font-size: var(--doras-type-body-sm-font-size);
    }
  `;

  override render() {
    return html`<div class="row" part="row">
      ${
        this.didYouMean
          ? html`<span class="did-you-mean"
              ><doras-icon name="wand-sparkles" size="sm"></doras-icon
              >${this.#i18n.t('handle.didYouMean')}</span
            >`
          : nothing
      }
      <doras-avatar name=${this.name} .src=${this.avatar} decorative></doras-avatar>
      <span class="text">
        <span class="name">${this.name}</span>
        <doras-handle .handle=${this.handle}></doras-handle>
      </span>
      ${
        this.provider
          ? html`<doras-provider-badge
              class="hosted"
              provider=${this.provider}
              size="sm"
              label=${this.#i18n.t('identity.hostedBy', {
                provider: providerById(this.provider)?.name ?? this.provider,
              })}
            ></doras-provider-badge>`
          : nothing
      }
    </div>`;
  }
}

define('doras-account-row', DorasAccountRow);

declare global {
  interface HTMLElementTagNameMap {
    'doras-account-row': DorasAccountRow;
  }
}
