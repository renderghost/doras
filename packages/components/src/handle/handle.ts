// Handle: always with an @, isolated so it reads correctly inside Arabic
// text, and breaking safely when long.
import type { DorasHandleProps } from '@doras/specs';
import { LitElement, css, html } from 'lit';
import { define } from '../shared/define.ts';

/** Lets a long handle break after its dots, not mid-word. */
const breakable = (handle: string) =>
  handle.split('.').flatMap((part, i) => (i === 0 ? [part] : [html`.<wbr />`, part]));

export class DorasHandle extends LitElement implements DorasHandleProps {
  static override properties = {
    handle: { type: String },
  };

  declare handle: string;

  constructor() {
    super();
    this.handle = '';
  }

  static override styles = css`
    :host {
      display: inline;
    }

    bdi {
      overflow-wrap: anywhere;
    }
  `;

  override render() {
    return html`<bdi part="handle">@${breakable(this.handle.replace(/^@+/, ''))}</bdi>`;
  }
}

define('doras-handle', DorasHandle);

declare global {
  interface HTMLElementTagNameMap {
    'doras-handle': DorasHandle;
  }
}
