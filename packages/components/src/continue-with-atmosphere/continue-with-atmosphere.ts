// Continue with Atmosphere: the one door into signing in, the same in every app.
// Its look comes from its own component tokens, and its label is locked copy.
import { LocaleController } from '@doras/i18n/lit';
import type { DorasContinueWithAtmosphereProps } from '@doras/specs';
import { LitElement, css, html } from 'lit';
import { define } from '../shared/define.ts';
import { atmosphereMark } from '../shared/icons.ts';
import { focusRing } from '../shared/styles.ts';

export class DorasContinueWithAtmosphere
  extends LitElement
  implements DorasContinueWithAtmosphereProps
{
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override properties = {
    fullWidth: { type: Boolean, reflect: true, attribute: 'full-width' },
  };

  declare fullWidth: boolean;

  #i18n = new LocaleController(this);

  constructor() {
    super();
    this.fullWidth = false;
  }

  static override styles = [
    focusRing,
    css`
      :host {
        display: inline-block;
        vertical-align: middle;
      }

      :host([full-width]) {
        display: block;
      }

      button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--doras-space-inline-sm);
        box-sizing: border-box;
        inline-size: 100%;
        min-block-size: var(--doras-atmosphere-button-min-height);
        padding-block: var(--doras-space-inset-sm);
        padding-inline: var(--doras-atmosphere-button-padding-inline);
        border: var(--doras-atmosphere-button-border-width) solid
          var(--doras-atmosphere-button-border);
        border-radius: var(--doras-atmosphere-button-radius);
        background: var(--doras-atmosphere-button-surface);
        color: var(--doras-atmosphere-button-text);
        font-family: var(--doras-atmosphere-button-label-font-family);
        font-size: var(--doras-atmosphere-button-label-font-size);
        font-weight: var(--doras-atmosphere-button-label-font-weight);
        line-height: var(--doras-atmosphere-button-label-line-height);
        letter-spacing: var(--doras-atmosphere-button-label-letter-spacing);
        text-align: center;
        text-wrap: balance;
        cursor: pointer;
        transition: background-color var(--doras-motion-duration-fast)
          var(--doras-motion-easing-standard);
      }

      button:hover {
        background: var(--doras-atmosphere-button-surface-hover);
      }

      .mark {
        display: inline-grid;
        flex: none;
      }

      .mark svg {
        inline-size: var(--doras-size-icon-lg);
        block-size: var(--doras-size-icon-lg);
      }
    `,
  ];

  override render() {
    return html`<button part="button" type="button">
      <span class="mark">${atmosphereMark}</span>
      <span>${this.#i18n.t('atmosphere.continue')}</span>
    </button>`;
  }
}

define('doras-continue-with-atmosphere', DorasContinueWithAtmosphere);

declare global {
  interface HTMLElementTagNameMap {
    'doras-continue-with-atmosphere': DorasContinueWithAtmosphere;
  }
}
