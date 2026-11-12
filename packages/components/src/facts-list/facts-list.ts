// Facts list: label and value pairs, such as “Your handle” and “Your sign-in
// code”. Handles and codes are isolated, so they read correctly in Arabic.
import type { DorasFactsListProps } from '@doras/specs';
import { LitElement, css, html } from 'lit';
import { renderCode } from '../formatted-code/format.ts';
import { codeStyles } from '../formatted-code/formatted-code.ts';
import { define } from '../shared/define.ts';
import { visuallyHidden } from '../shared/styles.ts';

export interface Fact {
  label: string;
  value: string;
  /** handle: shown with an @, isolated. code: grouped and read digit by digit. */
  kind?: 'text' | 'handle' | 'code';
}

export class DorasFactsList extends LitElement implements DorasFactsListProps {
  static override properties = {
    facts: { attribute: false },
  };

  declare facts: Fact[];

  constructor() {
    super();
    this.facts = [];
  }

  static override styles = [
    visuallyHidden,
    codeStyles,
    css`
      :host {
        display: block;
      }

      dl {
        display: grid;
        gap: var(--doras-space-stack-sm);
        margin: 0;
        padding: var(--doras-space-inset-md);
        border-radius: var(--doras-radius-card);
        background: var(--doras-color-surface-subtle);
        color: var(--doras-color-text-default);
      }

      dt {
        color: var(--doras-color-text-subtle);
        font-size: var(--doras-type-body-sm-font-size);
        line-height: var(--doras-type-body-sm-line-height);
      }

      dd {
        margin: 0;
        font-weight: var(--doras-type-label-md-font-weight);
        overflow-wrap: anywhere;
      }
    `,
  ];

  #value(fact: Fact) {
    switch (fact.kind) {
      case 'handle':
        return html`<bdi>@${fact.value.replace(/^@+/, '')}</bdi>`;
      case 'code':
        return renderCode(fact.value);
      default:
        return fact.value;
    }
  }

  override render() {
    return html`<dl part="list">
      ${this.facts.map(
        (fact) =>
          html`<div>
            <dt>${fact.label}</dt>
            <dd>${this.#value(fact)}</dd>
          </div>`,
      )}
    </dl>`;
  }
}

define('doras-facts-list', DorasFactsList);

declare global {
  interface HTMLElementTagNameMap {
    'doras-facts-list': DorasFactsList;
  }
}
