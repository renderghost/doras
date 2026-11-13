// Skip link: the first thing on a provider page. Hidden until focused, it
// moves focus past the header to the main content.
import { LocaleController } from '@doras/i18n/lit';
import type { DorasSkipLinkProps } from '@doras/specs';
import { LitElement, css, html } from 'lit';
import { define } from '../shared/define.ts';
import { focusRing } from '../shared/styles.ts';

export class DorasSkipLink extends LitElement implements DorasSkipLinkProps {
  static override properties = {
    target: { type: String },
  };

  declare target: string;

  #i18n = new LocaleController(this);

  constructor() {
    super();
    this.target = 'main';
  }

  #skip(event: Event): void {
    const root = this.getRootNode() as Document | ShadowRoot;
    const target = root.getElementById(this.target);
    if (!target) return;
    event.preventDefault();
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus();
  }

  static override styles = [
    focusRing,
    css`
      a {
        position: absolute;
        z-index: 100;
        display: inline-flex;
        align-items: center;
        min-block-size: var(--doras-size-target-min);
        inset-block-start: var(--doras-space-inset-sm);
        inset-inline-start: var(--doras-space-inset-sm);
        padding: 0 var(--doras-space-inset-md);
        border-radius: var(--doras-radius-control);
        background: var(--doras-color-surface-raised);
        color: var(--doras-color-link-text);
        font-weight: var(--doras-type-label-md-font-weight);
        text-decoration: underline;
        transform: translateY(-200%);
      }

      /* The shadow only when shown: off screen, its blur would still peek in. */
      a:focus {
        box-shadow: var(--doras-shadow-overlay);
        transform: none;
      }
    `,
  ];

  override render() {
    return html`<a part="link" href=${`#${this.target}`} @click=${this.#skip}
      >${this.#i18n.t('skipLink.label')}</a
    >`;
  }
}

define('doras-skip-link', DorasSkipLink);

declare global {
  interface HTMLElementTagNameMap {
    'doras-skip-link': DorasSkipLink;
  }
}
