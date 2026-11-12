// Icon: a Lucide icon. Decorative unless given a label. Icons that point a
// direction mirror in right-to-left layouts.
import type { DorasIconProps } from '@doras/specs';
import { LitElement, css, html, nothing } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { define } from '../shared/define.ts';
import { ICON_BY_NAME, type DorasIcon as IconData } from './icons.ts';

const escape = (value: unknown): string =>
  String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// Lucide's drawings are trusted data from the package, never from people.
const cache = new Map<string, string>();
function drawing(icon: IconData): string {
  let svg = cache.get(icon.name);
  if (!svg) {
    svg = icon.node
      .map(
        ([tag, attrs]) =>
          `<${tag} ${Object.entries(attrs)
            .map(([k, v]) => `${k}="${escape(v)}"`)
            .join(' ')} />`,
      )
      .join('');
    cache.set(icon.name, svg);
  }
  return svg;
}

export class DorasIcon extends LitElement implements DorasIconProps {
  static override properties = {
    name: { type: String, reflect: true },
    label: { type: String },
    size: { type: String, reflect: true },
  };

  declare name: string;
  declare label: string | undefined;
  declare size: DorasIconProps['size'];

  constructor() {
    super();
    this.name = '';
    this.size = 'md';
  }

  static override styles = css`
    :host {
      display: inline-grid;
      flex: none;
      inline-size: var(--doras-size-icon-md);
      block-size: var(--doras-size-icon-md);
      color: inherit;
      vertical-align: middle;
    }

    :host([size='sm']) {
      inline-size: var(--doras-size-icon-sm);
      block-size: var(--doras-size-icon-sm);
    }

    :host([size='lg']) {
      inline-size: var(--doras-size-icon-lg);
      block-size: var(--doras-size-icon-lg);
    }

    :host([size='xl']) {
      inline-size: var(--doras-size-icon-xl);
      block-size: var(--doras-size-icon-xl);
    }

    svg {
      inline-size: 100%;
      block-size: 100%;
    }

    :host(:dir(rtl)) svg.mirrors {
      transform: scaleX(-1);
    }
  `;

  override render() {
    const icon = ICON_BY_NAME.get(this.name);
    if (!icon) return nothing;
    return html`<svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      focusable="false"
      class=${icon.mirrors ? 'mirrors' : ''}
      role=${ifDefined(this.label ? 'img' : undefined)}
      aria-label=${ifDefined(this.label || undefined)}
      aria-hidden=${ifDefined(this.label ? undefined : 'true')}
    >
      ${unsafeSVG(drawing(icon))}
    </svg>`;
  }
}

define('doras-icon', DorasIcon);

declare global {
  interface HTMLElementTagNameMap {
    'doras-icon': DorasIcon;
  }
}
