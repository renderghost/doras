// The reference provider pages (#16): sign-in, the verification code, the
// passkey offer, the emailed sign-in code, how to sign in next time,
// sign-up and choosing a handle. Then Connect, full and short.
import { html, nothing } from 'lit';
import {
  LOST_DEVICE,
  OPTIONAL_PERMISSION,
  PERMISSIONS,
  TECHNICAL,
  maskEmail,
  type Person,
} from '../data.ts';
import type { FlowHarness } from '../harness.ts';
import { handshake, heading, primary, providerOf, providerPage } from './templates.ts';

const form = (onSubmit: () => void) => (e: Event) => {
  e.preventDefault();
  onSubmit();
};

/** An info notice on the page, such as after a cancelled passkey. */
const info = (f: FlowHarness) =>
  f.s.info && f.s.info !== 'find.useEmail'
    ? html`<doras-notice tone="info">${f.t(f.s.info)}</doras-notice>`
    : nothing;

/** Sign in: password, passkey and “Use a passkey”. */
export function signIn(f: FlowHarness) {
  const account = f.s.account as Person;
  const provider = f.providerName();
  return providerPage(
    f,
    html`${handshake(f)} ${heading(f.t('signin.heading'), 'h1')}
      <p>${f.t('signin.lede', { provider, app: f.appName })}</p>
      ${info(f)}
      <form class="flow-stack" novalidate @submit=${form(f.signIn)}>
        <div class="flow-account">
          <doras-account-row
            name=${account.name}
            handle=${account.handle}
            provider=${providerOf(f, account)}
          ></doras-account-row>
          <doras-step-link @click=${f.changeAccount}>${f.t('common.change')}</doras-step-link>
        </div>
        <doras-password-field
          id="password"
          label=${f.t('common.password')}
          purpose="current"
          .value=${f.value('password')}
          .error=${f.s.errors.password}
          @doras-input=${f.input('password')}
        ></doras-password-field>
        ${
          f.passkeyHere
            ? html`<doras-mock-autofill
                kind="passkey"
                value=${account.handle}
                @doras-mock-autofill=${f.usePasskey}
              ></doras-mock-autofill>`
            : nothing
        }
        <div class="flow-links">
          <doras-step-link @click=${f.emailCode}>${f.t('signin.forgot')}</doras-step-link>
        </div>
        ${primary(f, 'signin', f.t('common.signIn'), f.t('signin.busy'), f.signIn)}
      </form>
      <doras-divider variant="or"></doras-divider>
      <doras-button variant="secondary" full-width @click=${f.usePasskey}
        >${f.t('signin.usePasskey')}</doras-button
      >`,
  );
}

/** The code from an authenticator app, for accounts with verification codes switched on. */
export function totp(f: FlowHarness) {
  const account = f.s.account as Person;
  return providerPage(
    f,
    html`${handshake(f)} ${heading(f.t('totp.heading'), 'h1')}
      <p>${f.t('totp.lede', { handle: `@${account.handle}` })}</p>
      <form class="flow-stack" novalidate @submit=${form(f.verify)}>
        <doras-code-field
          id="totp"
          label=${f.t('totp.label')}
          .value=${f.value('totp')}
          .error=${f.s.errors.totp}
          @doras-input=${f.input('totp')}
        ></doras-code-field>
        ${primary(f, 'totp', f.t('common.continue'), f.t('common.checking'), f.verify)}
      </form>
      <div class="flow-links">
        <doras-step-link @click=${f.emailCode}>${f.t('totp.lostPhone')}</doras-step-link>
      </div>`,
  );
}

/** Offer a passkey, once, after a password. */
export function offer(f: FlowHarness) {
  const account = f.s.account as Person;
  return providerPage(
    f,
    html`<doras-notice tone="success"
        >${f.t('offer.signedIn', { handle: `@${account.handle}` })}</doras-notice
      >
      <doras-icon class="flow-hero" name="key-round" size="xl"></doras-icon>
      ${heading(f.t('offer.heading'), 'h1')}
      <p>${f.t('offer.lede')}</p>
      <p class="flow-fine">${f.t('offer.fine', { provider: f.providerName() })}</p>
      <div class="flow-actions">
        <doras-button variant="secondary" @click=${f.declinePasskey}
          >${f.t('common.notNow')}</doras-button
        >
        <doras-button @click=${f.offerAdd}>${f.t('offer.add')}</doras-button>
      </div>`,
  );
}

/** The sign-in code from the email: recovery, or “Forgot password?”. */
export function code(f: FlowHarness) {
  const account = f.s.account as Person;
  const email = account.email ?? f.s.recovery?.email ?? '';
  return providerPage(
    f,
    html`${handshake(f)} ${heading(f.t('code.heading'), 'h1')}
      <p>${f.t('code.lede', { email: maskEmail(email) })}</p>
      ${info(f)}
      <form class="flow-stack" novalidate @submit=${form(f.checkCode)}>
        <doras-code-field
          id="code"
          label=${f.t('code.label')}
          .value=${f.value('code')}
          .error=${f.s.errors.code}
          @doras-input=${f.input('code')}
        ></doras-code-field>
        <doras-mock-autofill
          kind="code"
          value="482913"
          @doras-mock-autofill=${(e: CustomEvent<{ value: string }>) =>
            f.set({ values: { ...f.s.values, code: e.detail.value }, errors: {} })}
        ></doras-mock-autofill>
        ${primary(f, 'code', f.t('common.signIn'), f.t('common.checking'), f.checkCode)}
      </form>
      <div class="flow-links">
        <doras-step-link @click=${f.resendCode}>${f.t('code.resend')}</doras-step-link>
        ${
          f.s.history.includes('pv-signin')
            ? nothing
            : html`<doras-step-link @click=${() => f.go('pv-signin')}
                >${f.t('code.passwordInstead')}</doras-step-link
              >`
        }
      </div>`,
  );
}

/** How to sign in next time: a passkey first, or a new password, and removing a lost passkey. */
export function nextTime(f: FlowHarness) {
  const account = f.s.account as Person;
  const lost = f.passkey === 'lost-phone';
  return providerPage(
    f,
    html`<doras-notice tone="success"
        >${f.t('offer.signedIn', { handle: `@${account.handle}` })}</doras-notice
      >
      ${heading(f.t('nextTime.heading'), 'h1')}
      <p>${f.t('nextTime.lede', { provider: f.providerName() })}</p>
      ${
        lost
          ? f.s.lostRemoved
            ? html`<doras-notice tone="success"
                >${f.t('nextTime.removed', { device: LOST_DEVICE })}</doras-notice
              >`
            : html`<doras-notice tone="info">
                ${f.t('nextTime.lost', { device: LOST_DEVICE })}
                <doras-button slot="actions" variant="secondary" @click=${f.removeLost}
                  >${f.t('nextTime.remove')}</doras-button
                >
              </doras-notice>`
          : nothing
      }
      <doras-button full-width @click=${f.nextTimeAdd}>${f.t('offer.add')}</doras-button>
      <doras-disclosure
        variant="link"
        .open=${f.s.passwordInstead}
        @doras-toggle=${(e: CustomEvent<{ open: boolean }>) => f.set({ passwordInstead: e.detail.open })}
      >
        <span slot="summary">${f.t('nextTime.passwordInstead')}</span>
        <form class="flow-stack" novalidate @submit=${form(f.savePassword)}>
          <doras-password-field
            id="newPassword"
            label=${f.t('nextTime.newPassword')}
            purpose="new"
            hint=${f.t('signup.passwordHint')}
            .value=${f.value('newPassword')}
            .error=${f.s.errors.newPassword}
            @doras-input=${f.input('newPassword')}
          ></doras-password-field>
          <doras-button
            variant="secondary"
            full-width
            ?busy=${f.s.busy === 'save'}
            busy-label=${f.t('common.checking')}
            @click=${f.savePassword}
            >${f.t('nextTime.save')}</doras-button
          >
        </form>
      </doras-disclosure>
      <div class="flow-links">
        <doras-step-link @click=${f.declinePasskey}>${f.t('common.notNow')}</doras-step-link>
      </div>`,
  );
}

/** Sign up: an email, then a passkey or a password, side by side with neither picked. */
export function signUp(f: FlowHarness) {
  const provider = f.providerName();
  const method = f.s.method;
  return providerPage(
    f,
    html`${heading(f.t('create.heading'), 'h1')}
      <p>${f.t('signup.lede', { provider, app: f.appName })}</p>
      <form class="flow-stack" novalidate @submit=${form(f.signUp)}>
        <doras-error-summary></doras-error-summary>
        <doras-email-field
          id="email"
          label=${f.t('common.email')}
          .value=${f.value('email')}
          .error=${f.s.errors.email}
          @doras-input=${f.input('email')}
        ></doras-email-field>
        <doras-radio-cards
          id="method"
          name="method"
          label=${f.t('signup.legend')}
          .options=${[
            {
              value: 'passkey',
              label: f.t('signup.passkey'),
              description: f.t('signup.passkeyBlurb'),
            },
            {
              value: 'password',
              label: f.t('common.password'),
              description: f.t('signup.passwordBlurb'),
            },
          ]}
          .value=${method}
          .error=${f.s.errors.method}
          @change=${(e: Event) => {
            const errors = { ...f.s.errors };
            delete errors.method;
            f.set({
              method: (e.target as HTMLInputElement).value as 'passkey' | 'password',
              errors,
            });
          }}
        ></doras-radio-cards>
        ${method === 'passkey' ? html`<p class="flow-fine">${f.t('signup.passkeyNote', { provider })}</p>` : nothing}
        ${
          method === 'password'
            ? html`<doras-password-field
                id="newPassword"
                label=${f.t('common.password')}
                purpose="new"
                hint=${f.t('signup.passwordHint')}
                .value=${f.value('newPassword')}
                .error=${f.s.errors.newPassword}
                @doras-input=${f.input('newPassword')}
              ></doras-password-field>`
            : nothing
        }
        <p class="flow-fine">${f.t('signup.terms', { provider })}</p>
        ${primary(f, 'signup', f.t('signup.submit'), f.t('common.checking'), f.signUp)}
      </form>
      <div class="flow-links">
        <doras-step-link @click=${f.changeAccount}>${f.t('signup.signInInstead')}</doras-step-link>
      </div>`,
  );
}

/** Choose your handle. */
export function newHandle(f: FlowHarness) {
  const local = f.value('newHandle').trim().toLowerCase();
  const ending = f.ending();
  const hint = f.s.errors.newHandle
    ? f.t('newHandle.ending', { ending: `.${ending}` })
    : local
      ? `${f.t('newHandle.available', { handle: `@${local}.${ending}` })} ${f.t('newHandle.ending', { ending: `.${ending}` })}`
      : f.t('newHandle.ending', { ending: `.${ending}` });
  return providerPage(
    f,
    html`${heading(f.t('newHandle.heading'), 'h1')}
      <p>${f.t('newHandle.lede', { app: f.appName })}</p>
      <form class="flow-stack" novalidate @submit=${form(f.createHandle)}>
        <doras-error-summary></doras-error-summary>
        <doras-text-field
          id="name"
          label=${f.t('newHandle.name')}
          .value=${f.value('name')}
          .error=${f.s.errors.name}
          @doras-input=${f.input('name')}
        ></doras-text-field>
        <doras-text-field
          id="newHandle"
          label=${f.t('newHandle.label')}
          hint=${hint}
          .value=${f.value('newHandle')}
          .error=${f.s.errors.newHandle}
          @doras-input=${f.input('newHandle')}
        ></doras-text-field>
        ${primary(f, 'create', f.t('newHandle.submit'), f.t('newHandle.busy'), f.createHandle)}
      </form>`,
  );
}

/** Connect, full: what the app can and can't do, in its own words. */
export function connect(f: FlowHarness) {
  const account = f.s.account as Person;
  const provider = f.providerName();
  const app = f.appName;
  return providerPage(
    f,
    html`${handshake(f)} ${heading(f.t('connect.heading', { app }), 'h1')}
      <div class="flow-account">
        <doras-account-row
          name=${account.name}
          handle=${account.handle}
          provider=${providerOf(f, account)}
        ></doras-account-row>
        <doras-step-link @click=${f.changeAccount}>${f.t('connect.notYou')}</doras-step-link>
      </div>
      <section class="flow-stack" aria-labelledby="can">
        <h2 id="can" class="flow-subheading">${f.t('connect.can', { app })}</h2>
        <div role="list" class="flow-stack">
          ${PERMISSIONS.map(
            (p) =>
              html`<doras-permission-item
                icon=${p.icon}
                label=${p.label}
                reason=${p.reason}
              ></doras-permission-item>`,
          )}
        </div>
        <doras-switch
          label=${OPTIONAL_PERMISSION.label}
          description=${`${OPTIONAL_PERMISSION.reason} ${f.t('connect.optional')}`}
          ?checked=${f.s.allowPost}
          @change=${(e: Event) => f.set({ allowPost: (e.target as HTMLInputElement).checked })}
        ></doras-switch>
        <h2 class="flow-subheading">${f.t('connect.cannot', { app })}</h2>
        <ul class="flow-never">
          ${(
            ['connect.neverPassword', 'connect.neverMessages', 'connect.neverProfile'] as const
          ).map(
            (key) =>
              html`<li><doras-icon name="x" size="sm"></doras-icon><span>${f.t(key)}</span></li>`,
          )}
        </ul>
      </section>
      <doras-details>
        <span slot="summary">${f.t('connect.technical')}</span>
        <doras-facts-list
          .facts=${[
            { label: f.t('connect.techApp'), value: `https://${f.appDomain}/client-metadata.json` },
            ...TECHNICAL,
          ]}
        ></doras-facts-list>
      </doras-details>
      <div class="flow-actions">
        <doras-button variant="secondary" @click=${f.cancelConnect}
          >${f.t('common.cancel')}</doras-button
        >
        <doras-button
          ?busy=${f.s.busy === 'connect'}
          busy-label=${f.t('connect.busy')}
          @click=${f.connect}
          >${f.t('connect.approve')}</doras-button
        >
      </div>
      <p class="flow-fine flow-verified">
        <doras-icon name="shield-check" size="sm"></doras-icon
        ><span>${f.t('connect.verified', { provider, domain: f.appDomain, app })}</span>
      </p>`,
  );
}

/** Connect, short: the app hosts the new account, so there's nothing to approve. */
export function ready(f: FlowHarness) {
  const app = f.appName;
  return providerPage(
    f,
    html`${handshake(f)} ${heading(f.t('connect.ready'), 'h1')}
      <p>${f.t('connect.readyLede', { app })}</p>
      <doras-details>
        <span slot="summary">${f.t('connect.whatAppCan', { app })}</span>
        <div role="list" class="flow-stack">
          ${[
            ...PERMISSIONS,
            {
              icon: 'send',
              ...OPTIONAL_PERMISSION,
              reason: OPTIONAL_PERMISSION.reason.replace(/^Why: /, ''),
            },
          ].map(
            (p) =>
              html`<doras-permission-item
                icon=${p.icon}
                label=${p.label}
                reason=${p.reason}
              ></doras-permission-item>`,
          )}
        </div>
      </doras-details>
      ${primary(f, 'connect', f.t('connect.continue', { app }), f.t('connect.busy'), f.connect)}
      <p class="flow-fine">${f.t('connect.oneAccount', { app })}</p>`,
  );
}
