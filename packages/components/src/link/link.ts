// Link: goes somewhere. Says when it opens a new tab.
import { LocaleController } from '@doras/i18n/lit';
import type { DorasLinkProps } from '@doras/specs';
import { LitElement, css, html, nothing } from 'lit';
import { define } from '../shared/define.ts';
import { focusRing } from '../shared/styles.ts';

export class DorasLink extends LitElement implements DorasLinkProps {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override properties = {
    href: { type: String },
    newTab: { type: Boolean, attribute: 'new-tab' },
  };

  declare href: string;
  declare newTab: boolean;

  #i18n = new LocaleController(this);

  constructor() {
    super();
    this.href = '';
    this.newTab = false;
  }

  static override styles = [
    focusRing,
    css`
      :host {
        display: inline;
      }

      a {
        border-radius: 2px;
        color: var(--doras-color-link-text);
        font-weight: inherit;
        text-decoration: underline;
        text-decoration-color: var(--doras-color-link-decoration);
        text-decoration-thickness: 2px;
        text-underline-offset: 3px;
        transition: text-decoration-color var(--doras-motion-duration-fast)
          var(--doras-motion-easing-standard);
      }

      a:hover {
        text-decoration-color: var(--doras-color-link-decoration-hover);
      }
    `,
  ];

  override render() {
    return html`<a
      part="link"
      href=${this.href}
      target=${this.newTab ? '_blank' : nothing}
      rel=${this.newTab ? 'noopener noreferrer' : nothing}
      ><slot></slot>${this.newTab ? html` ${this.#i18n.t('link.opensInNewTab')}` : nothing}</a
    >`;
  }
}

define('doras-link', DorasLink);

declare global {
  interface HTMLElementTagNameMap {
    'doras-link': DorasLink;
  }
}
