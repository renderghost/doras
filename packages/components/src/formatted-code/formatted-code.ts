// Formatted code: a code shown for reading, such as in the recovery email.
import type { DorasFormattedCodeProps } from '@doras/specs';
import { LitElement, css, html } from 'lit';
import { define } from '../shared/define.ts';
import { visuallyHidden } from '../shared/styles.ts';
import { renderCode } from './format.ts';

export const codeStyles = css`
  .code {
    font-family: var(--doras-type-code-font-family);
    font-size: var(--doras-type-code-font-size);
    font-variant-numeric: tabular-nums;
    font-weight: var(--doras-type-code-font-weight);
    letter-spacing: var(--doras-type-code-letter-spacing);
    line-height: var(--doras-type-code-line-height);
    white-space: nowrap;
  }
`;

export class DorasFormattedCode extends LitElement implements DorasFormattedCodeProps {
  static override properties = {
    code: { type: String },
  };

  declare code: string;

  constructor() {
    super();
    this.code = '';
  }

  static override styles = [
    visuallyHidden,
    codeStyles,
    css`
      :host {
        display: inline-block;
        color: var(--doras-color-text-default);
      }
    `,
  ];

  override render() {
    return html`${renderCode(this.code)}`;
  }
}

define('doras-formatted-code', DorasFormattedCode);

declare global {
  interface HTMLElementTagNameMap {
    'doras-formatted-code': DorasFormattedCode;
  }
}
