// Mock of the browser's account chooser (FedCM). The browser lists the
// Atmosphere accounts used on this device; the app learns nothing until one
// is picked. Storybook only: real browsers draw this themselves.
import '@doras/components';
import { providerById } from '@doras/components/provider-badge/providers';
import { define } from '@doras/components/shared/define';
import { css, html } from 'lit';
import { BROWSER_LANG, chrome, closeButton, send, tag } from '../shared/chrome.ts';
import { MockDialog } from '../shared/mock-dialog.ts';

/** An account the browser remembers. */
export interface MockAccount {
  handle: string;
  name: string;
  /** A provider id from the provider list, such as "bluesky". */
  provider: string;
  avatar?: string;
}

/**
 * @fires doras-mock-pick - An account was picked. `detail.handle` names it.
 * @fires doras-mock-other - “Use another Atmosphere account” was pressed.
 * @fires doras-mock-dismiss - The person closed it without picking.
 */
export class DorasMockAccountChooser extends MockDialog {
  static override properties = {
    ...MockDialog.properties,
    appName: { type: String, attribute: 'app-name' },
    appDomain: { type: String, attribute: 'app-domain' },
    accounts: { type: Array },
    picked: { state: true },
  };

  declare appName: string;
  declare appDomain: string;
  declare accounts: MockAccount[];
  declare picked: MockAccount | null;

  constructor() {
    super();
    this.appName = '';
    this.appDomain = '';
    this.accounts = [];
    this.picked = null;
  }

  protected override opened(): void {
    this.picked = null;
  }

  protected override dismissed(): void {
    send(this, 'doras-mock-dismiss');
  }

  #pick(account: MockAccount): void {
    this.picked = account;
    send(this, 'doras-mock-pick', { handle: account.handle });
    // The list has gone, so focus the status that replaced it.
    void this.updateComplete.then(() =>
      this.renderRoot.querySelector<HTMLElement>('.busy')?.focus(),
    );
  }

  #other = (): void => {
    send(this, 'doras-mock-other');
  };

  static override styles = [
    chrome,
    css`
      /* Large screens: below the address bar, at the end, as browsers place it. */
      dialog.card {
        margin-block: var(--doras-space-inset-lg) auto;
        margin-inline: auto var(--doras-space-inset-lg);
      }

      /* Every row the same width, so they wrap alike. */
      .option doras-account-row {
        flex: 1;
        min-inline-size: 0;
      }

      ul {
        margin: 0;
        padding: 0 0 var(--doras-space-inset-xs);
        list-style: none;
      }

      .one {
        display: flex;
        flex-direction: column;
        gap: var(--doras-space-stack-md);
        padding: var(--doras-space-inset-xs) var(--doras-space-inset-md) var(--doras-space-inset-md);
      }

      .other {
        border-block-start: var(--doras-border-width-default) solid
          var(--doras-color-border-default);
        font-weight: 600;
      }

      /* Phones: a sheet from the bottom of the screen. */
      @media (width < 37.5rem) {
        dialog.card {
          inline-size: 100%;
          max-inline-size: 100%;
          margin: auto 0 0;
          border-end-start-radius: 0;
          border-end-end-radius: 0;
        }
      }
    `,
  ];

  #row(account: MockAccount) {
    return html`<doras-account-row
      name=${account.name}
      handle=${account.handle}
      provider=${account.provider}
      .avatar=${account.avatar ?? ''}
    ></doras-account-row>`;
  }

  #choices() {
    const [one] = this.accounts;
    if (this.accounts.length === 1 && one) {
      const first = one.name.split(' ')[0] ?? one.name;
      return html`<div class="one">
        ${this.#row(one)}
        <button class="button primary" type="button" autofocus @click=${() => this.#pick(one)}>
          Continue as ${first}
        </button>
      </div>`;
    }
    return html`<ul>
      ${this.accounts.map(
        (account, i) =>
          html`<li>
            <button
              class="option"
              type="button"
              ?autofocus=${i === 0}
              @click=${() => this.#pick(account)}
            >
              ${this.#row(account)}
            </button>
          </li>`,
      )}
    </ul>`;
  }

  override render() {
    const picked = this.picked;
    const provider = picked ? (providerById(picked.provider)?.name ?? picked.provider) : '';
    return html`<dialog
      class="card"
      part="dialog"
      lang=${BROWSER_LANG.lang}
      dir=${BROWSER_LANG.dir}
      aria-labelledby="title"
      @close=${this.onClose}
    >
      ${tag()}
      <div class="head">
        <doras-atmosphere-mark decorative size="md"></doras-atmosphere-mark>
        <p class="title" id="title">
          <strong>Sign in to ${this.appDomain}</strong>
          <span class="sub"
            >${
              this.accounts.length === 1
                ? 'with your Atmosphere account'
                : 'Choose an Atmosphere account'
            }</span
          >
        </p>
        ${closeButton(this.dismiss)}
      </div>
      ${
        picked
          ? html`<p class="busy" role="status" tabindex="-1">
              <span class="spinner"><doras-icon name="loader-circle"></doras-icon></span>
              Connecting to ${provider}…
            </p>`
          : html`${this.#choices()}
              <button class="option other" type="button" @click=${this.#other}>
                <doras-icon name="user-plus"></doras-icon>Use another Atmosphere account
              </button>
              <p class="fine">
                Your browser shows Atmosphere accounts you’ve used on this device. ${this.appName}
                doesn’t see them unless you pick one.
              </p>`
      }
    </dialog>`;
  }
}

define('doras-mock-account-chooser', DorasMockAccountChooser);

declare global {
  interface HTMLElementTagNameMap {
    'doras-mock-account-chooser': DorasMockAccountChooser;
  }
}
