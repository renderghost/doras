// Avatar: an image, or initials in any script when there's no image or it
// fails to load. Decorative when the name is shown beside it.
import type { DorasAvatarProps } from '@doras/specs';
import { LitElement, css, html, type PropertyValues } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { define } from '../shared/define.ts';
import { initialsFor } from './initials.ts';

export class DorasAvatar extends LitElement implements DorasAvatarProps {
  static override properties = {
    name: { type: String },
    src: { type: String },
    size: { type: String, reflect: true },
    decorative: { type: Boolean, reflect: true },
    failed: { state: true },
  };

  declare name: string;
  declare src: string | undefined;
  declare size: DorasAvatarProps['size'];
  declare decorative: boolean;
  declare failed: boolean;

  constructor() {
    super();
    this.name = '';
    this.size = 'md';
    this.decorative = false;
    this.failed = false;
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('src')) this.failed = false;
  }

  static override styles = css`
    :host {
      --size: var(--doras-size-avatar-md);

      display: inline-grid;
      flex: none;
      inline-size: var(--size);
      block-size: var(--size);
      vertical-align: middle;
    }

    :host([size='sm']) {
      --size: var(--doras-size-avatar-sm);
    }

    :host([size='lg']) {
      --size: var(--doras-size-avatar-lg);
    }

    :host([size='xl']) {
      --size: var(--doras-size-avatar-xl);
    }

    .avatar {
      display: grid;
      place-items: center;
      box-sizing: border-box;
      inline-size: 100%;
      block-size: 100%;
      overflow: hidden;
      border: var(--doras-border-width-default) solid var(--doras-color-border-default);
      border-radius: var(--doras-radius-pill);
      background: var(--doras-color-surface-subtle);
      color: var(--doras-color-text-default);
      font-family: var(--doras-type-label-md-font-family);
      font-size: calc(var(--size) * 0.4);
      font-weight: var(--doras-type-label-md-font-weight);
      line-height: 1;
    }

    img {
      inline-size: 100%;
      block-size: 100%;
      object-fit: cover;
    }
  `;

  override render() {
    const label = this.decorative ? undefined : this.name;
    const image = this.src && !this.failed;
    return html`<span
      class="avatar"
      part="avatar"
      role=${ifDefined(label ? 'img' : undefined)}
      aria-label=${ifDefined(label)}
      aria-hidden=${ifDefined(label ? undefined : 'true')}
    >
      ${
        image
          ? html`<img src=${this.src ?? ''} alt="" @error=${() => (this.failed = true)} />`
          : html`<span>${initialsFor(this.name, this.lang || undefined)}</span>`
      }
    </span>`;
  }
}

define('doras-avatar', DorasAvatar);

declare global {
  interface HTMLElementTagNameMap {
    'doras-avatar': DorasAvatar;
  }
}
