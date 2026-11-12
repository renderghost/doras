// How codes are shown: grouped for reading, left to right in any language,
// and read out digit by digit by screen readers.
import { formatCode } from '@doras/i18n';
import { html } from 'lit';

/** Each character, spaced, so screen readers read “1 2 3”, not “one hundred and twenty-three”. */
export const spokenCode = (code: string): string => [...code.replace(/\s+/g, '')].join(' ');

export function renderCode(code: string) {
  return html`<span class="code" aria-hidden="true"><bdi dir="ltr">${formatCode(code)}</bdi></span
    ><span class="visually-hidden">${spokenCode(code)}</span>`;
}
