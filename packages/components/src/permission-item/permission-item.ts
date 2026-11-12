// Permission item: what an app can do, and why, on the Connect page.
import { LocaleController } from '@doras/i18n/lit';
import type { DorasPermissionItemProps } from '@doras/specs';
import { LitElement, css, html } from 'lit';
import '../icon/icon.ts';
import { define } from '../shared/define.ts';

export class DorasPermissionItem extends LitElement implements DorasPermissionItemProps {
  static override properties = {
    icon: { type: String },
    label: { type: String },
    reason: { type: String },
  };

  declare icon: string;
  declare label: string;
  declare reason: string;

  #i18n = new LocaleController(this);

  constructor() {
    super();
    this.icon = 'check';
    this.label = '';
    this.reason = '';
  }

  override connectedCallback(): void {
    super.connectedCallback();
    // Permission items sit in a list, so each is a list item. An attribute,
    // not ElementInternals, so accessibility checkers can see it too.
    if (!this.hasAttribute('role')) this.setAttribute('role', 'listitem');
  }

  static override styles = css`
    :host {
      display: flex;
      gap: var(--doras-space-inline-md);
      align-items: flex-start;
      padding-block: var(--doras-space-stack-sm);
      color: var(--doras-color-text-default);
    }

    doras-icon {
      color: var(--doras-color-icon-default);
      margin-block-start: 0.1em;
    }

    .text {
      display: flex;
      flex-direction: column;
      gap: var(--doras-space-stack-2xs);
    }

    .label {
      font-weight: var(--doras-type-label-md-font-weight);
    }

    .reason {
      margin: 0;
      color: var(--doras-color-text-subtle);
      font-size: var(--doras-type-body-sm-font-size);
      line-height: var(--doras-type-body-sm-line-height);
    }
  `;

  override render() {
    return html`<doras-icon name=${this.icon}></doras-icon>
      <span class="text">
        <span class="label">${this.label}</span>
        <p class="reason">${this.#i18n.t('permission.why')} ${this.reason}</p>
      </span>`;
  }
}

define('doras-permission-item', DorasPermissionItem);

declare global {
  interface HTMLElementTagNameMap {
    'doras-permission-item': DorasPermissionItem;
  }
}
