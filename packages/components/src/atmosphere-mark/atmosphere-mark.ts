// Atmosphere mark: the placeholder mark. Named “Atmosphere” on its own,
// decorative beside words that already say it.
import { LocaleController } from '@doras/i18n/lit';
import type { DorasAtmosphereMarkProps } from '@doras/specs';
import { LitElement, css, html } from 'lit';
import { define } from '../shared/define.ts';
import { atmosphereMark } from '../shared/icons.ts';

export class DorasAtmosphereMark extends LitElement implements DorasAtmosphereMarkProps {
  static override properties = {
    decorative: { type: Boolean, reflect: true },
    size: { type: String, reflect: true },
  };

  declare decorative: boolean;
  declare size: DorasAtmosphereMarkProps['size'];

  #i18n = new LocaleController(this);

  constructor() {
    super();
    this.decorative = false;
    this.size = 'lg';
  }

  static override styles = css`
    :host {
      display: inline-grid;
      inline-size: var(--doras-size-icon-lg);
      block-size: var(--doras-size-icon-lg);
      color: var(--doras-color-icon-default);
      vertical-align: middle;
    }

    :host([size='md']) {
      inline-size: var(--doras-size-icon-md);
      block-size: var(--doras-size-icon-md);
    }

    :host([size='xl']) {
      inline-size: var(--doras-size-icon-xl);
      block-size: var(--doras-size-icon-xl);
    }

    /* A real box: display: contents can drop the image from the accessibility tree. */
    span {
      display: block;
      inline-size: 100%;
      block-size: 100%;
    }

    svg {
      inline-size: 100%;
      block-size: 100%;
    }
  `;

  override render() {
    return this.decorative
      ? html`<span aria-hidden="true">${atmosphereMark}</span>`
      : html`<span role="img" aria-label=${this.#i18n.t('atmosphere.mark')}
          >${atmosphereMark}</span
        >`;
  }
}

define('doras-atmosphere-mark', DorasAtmosphereMark);

declare global {
  interface HTMLElementTagNameMap {
    'doras-atmosphere-mark': DorasAtmosphereMark;
  }
}
