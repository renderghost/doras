// Mock of the browser's passkey prompts (WebAuthn). The browser, not the
// site, asks for the passkey, and only offers ones saved for that exact
// site, which is why a lookalike page gets nothing. Storybook only: real
// browsers draw this themselves.
import '@doras/components';
import { define } from '@doras/components/shared/define';
import { css, html, nothing, type PropertyValues } from 'lit';
import { BROWSER_LANG, chrome, closeButton, send, tag } from '../shared/chrome.ts';
import { MockDialog } from '../shared/mock-dialog.ts';

/** Which prompt the browser shows first. */
export type PasskeyPromptMode = 'sign-in' | 'create' | 'none-here' | 'other-device';
type View = PasskeyPromptMode | 'waiting';

/** How long the mock “waits” for a fingerprint, face or screen lock. */
export const UNLOCK_MS = 700;

/**
 * @fires doras-mock-passkey - The passkey was used or made. `detail.mode` is "sign-in" or "create".
 * @fires doras-mock-cancel - The person closed it. `detail.error` is "NotAllowedError", as the page would get.
 */
export class DorasMockPasskeyPrompt extends MockDialog {
  static override properties = {
    ...MockDialog.properties,
    mode: { type: String, reflect: true },
    site: { type: String },
    handle: { type: String },
    name: { type: String },
    provider: { type: String },
    view: { state: true },
  };

  declare mode: PasskeyPromptMode;
  /** The site the passkey belongs to: the provider's, such as "bsky.social". */
  declare site: string;
  declare handle: string;
  declare name: string;
  declare provider: string;
  declare view: View;

  #timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    super();
    this.mode = 'sign-in';
    this.site = '';
    this.handle = '';
    this.name = '';
    this.provider = '';
    this.view = 'sign-in';
  }

  protected override opened(): void {
    this.view = this.mode;
  }

  protected override dismissed(): void {
    clearTimeout(this.#timer);
    send(this, 'doras-mock-cancel', { error: 'NotAllowedError' });
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    // Each view says where focus starts. The first comes from autofocus.
    if (changed.has('view') && changed.get('view') !== undefined && this.open) {
      this.renderRoot.querySelector<HTMLElement>('[autofocus], .busy')?.focus();
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this.#timer);
  }

  #continue = (): void => {
    const mode = this.view === 'create' ? 'create' : 'sign-in';
    this.view = 'waiting';
    this.#timer = setTimeout(() => {
      if (!this.open) return;
      this.open = false;
      send(this, 'doras-mock-passkey', { mode, handle: this.handle });
    }, UNLOCK_MS);
  };

  #otherDevice = (): void => {
    this.view = 'other-device';
  };

  static override styles = [
    chrome,
    css`
      .key {
        flex: none;
        padding-block-start: var(--doras-space-inset-xs);
      }

      .qr {
        display: grid;
        place-items: center;
        padding: var(--doras-space-inset-md);
        border: var(--doras-border-width-default) solid var(--doras-color-border-default);
        border-radius: var(--doras-radius-control);
      }

      .qr doras-icon {
        inline-size: 7rem;
        block-size: 7rem;
      }

      .wait {
        display: flex;
        gap: var(--doras-space-inline-xs);
        align-items: center;
        color: var(--doras-color-text-subtle);
      }

      .other {
        border-block: var(--doras-border-width-default) solid var(--doras-color-border-default);
        font-weight: 600;
      }

      .actions.spaced {
        padding-block-start: var(--doras-space-inset-md);
      }
    `,
  ];

  #head(title: string, sub: string) {
    return html`<div class="head">
      <doras-icon class="key" name="key-round"></doras-icon>
      <p class="title" id="title"><strong>${title}</strong><span class="sub">${sub}</span></p>
      ${closeButton(this.dismiss)}
    </div>`;
  }

  #actions(withContinue: boolean) {
    return html`<div class="actions">
      <button class="button" type="button" ?autofocus=${!withContinue} @click=${this.dismiss}>
        Cancel
      </button>
      ${
        withContinue
          ? html`<button class="button primary" type="button" autofocus @click=${this.#continue}>
              Continue
            </button>`
          : nothing
      }
    </div>`;
  }

  #view() {
    const site = this.site;
    switch (this.view) {
      case 'sign-in':
        return html`${this.#head(`Sign in to ${site}`, 'with a passkey')}
          <div class="body">
            <doras-account-row
              name=${this.name}
              handle=${this.handle}
              provider=${this.provider}
            ></doras-account-row>
            <p>Use your fingerprint, face or screen lock to sign in.</p>
          </div>
          ${this.#actions(true)}
          <p class="fine">
            Your browser keeps this passkey for ${site}. It only works on ${site}, so a lookalike
            site can’t use it.
          </p>`;
      case 'create':
        return html`${this.#head(`Create a passkey for ${site}`, this.handle)}
          <div class="body">
            <p>
              Your browser saves this passkey on this device. You’ll sign in to ${site} with your
              fingerprint, face or screen lock instead of a password.
            </p>
          </div>
          ${this.#actions(true)}
          <p class="fine">A passkey only works on ${site}, so a lookalike site can’t use it.</p>`;
      case 'none-here':
        return html`${this.#head(`Sign in to ${site}`, 'with a passkey')}
          <div class="body">
            <p><strong>There are no passkeys for ${site} on this device.</strong></p>
            <p>If your passkey is on a phone or tablet, you can use it from there.</p>
          </div>
          <button class="option other" type="button" @click=${this.#otherDevice}>
            <doras-icon name="smartphone"></doras-icon>Use a phone or tablet
          </button>
          <div class="actions spaced">
            <button class="button" type="button" autofocus @click=${this.dismiss}>Cancel</button>
          </div>`;
      case 'other-device':
        return html`${this.#head('Use a passkey from a phone or tablet', site)}
          <div class="body">
            <!-- A picture of a QR code, never a real one, so nothing can scan it. -->
            <div class="qr"><doras-icon name="qr-code"></doras-icon></div>
            <p>Scan this code with the phone or tablet that has your passkey for ${site}.</p>
            <p class="wait" role="status">
              <span class="spinner"><doras-icon name="loader-circle" size="sm"></doras-icon></span>
              Waiting for your phone…
            </p>
          </div>
          ${this.#actions(false)}`;
      case 'waiting':
        return html`${
            this.mode === 'create'
              ? this.#head(`Create a passkey for ${site}`, this.handle)
              : this.#head(`Sign in to ${site}`, 'with a passkey')
          }
          <p class="busy" role="status" tabindex="-1">
            <doras-icon name="fingerprint"></doras-icon>
            Waiting for your fingerprint, face or screen lock…
          </p>`;
    }
  }

  override render() {
    return html`<dialog
      class="card"
      part="dialog"
      lang=${BROWSER_LANG.lang}
      dir=${BROWSER_LANG.dir}
      aria-labelledby="title"
      @close=${this.onClose}
    >
      ${tag()} ${this.#view()}
    </dialog>`;
  }
}

define('doras-mock-passkey-prompt', DorasMockPasskeyPrompt);

declare global {
  interface HTMLElementTagNameMap {
    'doras-mock-passkey-prompt': DorasMockPasskeyPrompt;
  }
}
