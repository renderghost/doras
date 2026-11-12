// Fieldset: groups related fields under a legend, with a hint and a message
// for the group as a whole.
import { LocaleController } from '@doras/i18n/lit';
import type { DorasFieldsetProps } from '@doras/specs';
import { LitElement, css, html, nothing } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { define } from '../shared/define.ts';
import { circleAlert } from '../shared/icons.ts';
import { visuallyHidden } from '../shared/styles.ts';

export class DorasFieldset extends LitElement implements DorasFieldsetProps {
  static override properties = {
    legend: { type: String },
    hint: { type: String },
    error: { type: String },
  };

  declare legend: string;
  declare hint: string | undefined;
  declare error: string | undefined;

  #i18n = new LocaleController(this);

  constructor() {
    super();
    this.legend = '';
  }

  static override styles = [
    visuallyHidden,
    css`
      :host {
        display: block;
      }

      fieldset {
        display: flex;
        flex-direction: column;
        gap: var(--doras-space-stack-md);
        min-inline-size: 0;
        margin: 0;
        padding: 0;
        border: 0;
      }

      legend {
        padding: 0;
        margin-block-end: var(--doras-space-stack-xs);
        color: var(--doras-color-text-default);
        font-family: var(--doras-type-heading-sm-font-family);
        font-size: var(--doras-type-heading-sm-font-size);
        font-weight: var(--doras-type-heading-sm-font-weight);
        line-height: var(--doras-type-heading-sm-line-height);
      }

      .hint {
        margin: 0;
        color: var(--doras-color-text-subtle);
        font-size: var(--doras-type-body-sm-font-size);
        line-height: var(--doras-type-body-sm-line-height);
      }

      .message {
        display: flex;
        gap: var(--doras-space-inline-xs);
        color: var(--doras-color-text-error);
        font-size: var(--doras-type-body-sm-font-size);
        font-weight: var(--doras-type-label-sm-font-weight);
      }

      .message:empty {
        display: none;
      }

      .message svg {
        inline-size: var(--doras-size-icon-sm);
        block-size: var(--doras-size-icon-sm);
      }
    `,
  ];

  override render() {
    const describedBy = [this.hint ? 'hint' : '', this.error ? 'message' : '']
      .filter(Boolean)
      .join(' ');
    return html`<fieldset part="fieldset" aria-describedby=${ifDefined(describedBy || undefined)}>
      <legend part="legend">${this.legend}</legend>
      ${this.hint ? html`<p id="hint" class="hint">${this.hint}</p>` : nothing}
      <div id="message" class="message" aria-live="polite">
        ${
          this.error
            ? html`<span aria-hidden="true">${circleAlert}</span
                ><span
                  ><span class="visually-hidden">${this.#i18n.t('field.errorPrefix')} </span>${
                    this.error
                  }</span
                >`
            : nothing
        }
      </div>
      <slot></slot>
    </fieldset>`;
  }
}

define('doras-fieldset', DorasFieldset);

declare global {
  interface HTMLElementTagNameMap {
    'doras-fieldset': DorasFieldset;
  }
}
