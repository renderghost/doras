// Front Door's steps (#16), in the sheet over the app: finding the account,
// “Is this you?”, the existing-account check, choosing a provider, and
// finding the account by email.
import { formatList } from '@doras/i18n';
import { html, nothing } from 'lit';
import { PROVIDERS, type Person } from '../data.ts';
import type { FlowHarness } from '../harness.ts';
import { heading, primary, providerOf, sheet } from './templates.ts';

/** Find your account, search by name, or type the handle from the recovery email. */
export function find(f: FlowHarness) {
  const mode = f.s.step;
  const title =
    mode === 'search'
      ? f.t('search.heading')
      : mode === 'recover'
        ? f.t('recover.heading')
        : f.t('find.heading', { app: f.appName });
  const lede =
    mode === 'search'
      ? f.t('search.lede')
      : mode === 'recover'
        ? f.t('recover.lede')
        : f.t('find.lede');
  const hint =
    mode === 'recover'
      ? f.t('recover.hint')
      : f.t('find.hint', { example: 'sam.bsky.social', other: 'rae.blacksky.app' });
  return sheet(f, {
    label: title,
    back: f.s.history.length > 0 && f.s.history.at(-1) !== 'app',
    body: html`${heading(title)}
      <p>${lede}</p>
      <form
        class="flow-stack"
        novalidate
        @submit=${(e: Event) => {
          e.preventDefault();
          f.find();
        }}
      >
        <doras-handle-field
          id="handle"
          label=${mode === 'search' ? f.t('search.label') : f.t('find.label')}
          hint=${hint}
          .value=${f.value('handle')}
          .error=${f.s.errors.handle}
          .suggestions=${f.s.suggestions}
          @doras-query=${f.query}
          @doras-select=${f.select}
        ></doras-handle-field>
        ${
          f.s.info === 'find.useEmail'
            ? html`<doras-step-link @click=${f.forgot}>${f.t('find.useEmail')}</doras-step-link>`
            : nothing
        }
        ${primary(
          f,
          'find',
          mode === 'recover' ? f.t('common.continue') : f.t('find.submit'),
          f.t('find.busy'),
          () => f.find(),
        )}
      </form>
      <div class="flow-links">
        ${
          mode === 'recover'
            ? html`<doras-step-link @click=${() => f.go('forgot')}
                >${f.t('recover.noEmail')}</doras-step-link
              >`
            : html`<doras-step-link @click=${f.forgot}>${f.t('find.forgot')}</doras-step-link>
                <doras-step-link @click=${() => f.go('create')}
                  >${f.t('find.create')}</doras-step-link
                >`
        }
      </div>`,
  });
}

/** Is this you? Who was found, and where the person goes next. */
export function confirm(f: FlowHarness) {
  const account = f.s.account as Person;
  const provider = f.providerName();
  const title = f.t('confirm.heading');
  return sheet(f, {
    label: title,
    back: f.s.history.length > 0,
    body: html`${heading(title)}
      <doras-account-row
        name=${account.name}
        handle=${account.handle}
        provider=${providerOf(f, account)}
      ></doras-account-row>
      <section class="flow-panel" aria-labelledby="next-hop">
        <h3 id="next-hop" class="flow-subheading">${f.t('confirm.next', { provider })}</h3>
        <ul class="flow-hops">
          <li>
            <doras-icon name="arrow-right"></doras-icon
            ><span>${f.t('confirm.go', { host: f.providerHost(), provider })}</span>
          </li>
          <li>
            <doras-icon name="shield-check"></doras-icon
            ><span>${f.t('confirm.decide', { provider, app: f.appName })}</span>
          </li>
          <li>
            <doras-icon name="undo-2"></doras-icon
            ><span>${f.t('confirm.return', { app: f.appName })}</span>
          </li>
        </ul>
      </section>
      ${primary(f, 'confirm', f.t('confirm.continue', { provider }), f.t('signin.busy'), f.toProvider)}`,
  });
}

/** The existing-account check: the browser knows an account the person may already have. */
export function found(f: FlowHarness) {
  const known = f.browserAccounts;
  const [one] = known;
  const title = f.t('found.heading');
  return sheet(f, {
    label: title,
    body: html`${heading(title)}
      <section class="flow-panel flow-found" aria-labelledby="found-title">
        <p class="flow-kicker">
          <doras-icon name="sparkles" size="sm"></doras-icon>${f.t('found.kicker')}
        </p>
        <h3 id="found-title" class="flow-subheading">${f.t('found.title')}</h3>
        <p>
          ${
            known.length === 1 && one
              ? f.t('found.one', { name: one.name, provider: f.providerName(one), app: f.appName })
              : f.t('found.several', { app: f.appName })
          }
        </p>
        <ul class="flow-choices">
          ${known.map(
            (person) =>
              html`<li>
                <doras-account-row
                  name=${person.name}
                  handle=${person.handle}
                  provider=${providerOf(f, person)}
                ></doras-account-row>
                <doras-button variant="secondary" @click=${() => f.useExisting(person)}
                  >${f.t('found.use')}<span class="flow-hidden">
                    ${person.handle}</span
                  ></doras-button
                >
              </li>`,
          )}
        </ul>
      </section>
      <doras-disclosure
        variant="panel"
        .open=${f.s.createAnyway}
        @doras-toggle=${(e: CustomEvent<{ open: boolean }>) => f.set({ createAnyway: e.detail.open })}
      >
        <span slot="summary">${f.t('found.anyway')}</span>
        ${chooseProvider(f)}
      </doras-disclosure>`,
  });
}

/** Who should host the new account: the app's own hosting first, then the rest A to Z. */
function chooseProvider(f: FlowHarness) {
  const options = [
    {
      value: 'app',
      label: f.appName,
      description: `${f.t('create.suggestedBy', { app: f.appName })}. ${f.t('provider.blurb.app', { app: f.appName })}`,
    },
    ...PROVIDERS.map((p) => ({
      value: p.id,
      label: p.name,
      description: f.t(`provider.blurb.${p.id}` as 'provider.blurb.bluesky'),
    })),
    { value: 'other', label: f.t('create.another'), description: f.t('create.anotherBlurb') },
  ];
  const chosen = f.s.host;
  const name =
    chosen === 'app'
      ? f.appName
      : chosen === 'other'
        ? f.t('create.another')
        : (PROVIDERS.find((p) => p.id === chosen)?.name ?? chosen);
  return html`<form
    class="flow-stack"
    novalidate
    @submit=${(e: Event) => {
      e.preventDefault();
      f.chooseHost();
    }}
  >
    <doras-radio-cards
      id="host"
      name="host"
      label=${f.t('create.legend')}
      hint=${f.t('create.hint')}
      .options=${options}
      .value=${chosen}
      @change=${(e: Event) => f.set({ host: (e.target as HTMLInputElement).value })}
    ></doras-radio-cards>
    ${
      chosen === 'other'
        ? html`<doras-text-field
            id="address"
            label=${f.t('create.address')}
            hint=${f.t('create.addressHint')}
            .value=${f.value('address')}
            .error=${f.s.errors.address}
            @doras-input=${f.input('address')}
          ></doras-text-field>`
        : nothing
    }
    ${primary(f, 'host', f.t('create.continueWith', { provider: name }), f.t('signin.busy'), f.chooseHost)}
  </form>`;
}

/** Create your Atmosphere account: who should host it. */
export function create(f: FlowHarness) {
  const title = f.t('create.heading');
  return sheet(f, {
    label: title,
    back: f.s.history.length > 0 && f.s.history.at(-1) !== 'app',
    body: html`${heading(title)}
      <doras-notice tone="info" heading=${f.t('create.alreadyHeading')}>
        ${f.t('create.alreadyBody')}
        <doras-step-link slot="actions" @click=${() => f.go('find')}
          >${f.t('create.signInWithIt')}</doras-step-link
        >
        <doras-step-link slot="actions" @click=${() => f.go('search')}
          >${f.t('create.searchYourself')}</doras-step-link
        >
      </doras-notice>
      ${chooseProvider(f)}`,
  });
}

/** Find your account with your email. */
export function forgot(f: FlowHarness) {
  const title = f.t('forgot.heading');
  const options = [
    ...PROVIDERS.map((p) => ({ value: p.id, label: p.name })),
    { value: 'app', label: f.appName },
    { value: 'unsure', label: f.t('forgot.notSure') },
  ];
  return sheet(f, {
    label: title,
    back: f.s.history.length > 0,
    body: html`${heading(title)}
      <p>${f.t('forgot.lede', { app: f.appName })}</p>
      <form
        class="flow-stack"
        novalidate
        @submit=${(e: Event) => {
          e.preventDefault();
          f.requestEmail();
        }}
      >
        <doras-error-summary></doras-error-summary>
        <doras-email-field
          id="email"
          label=${f.t('common.email')}
          .value=${f.value('email')}
          .error=${f.s.errors.email}
          @doras-input=${f.input('email')}
        ></doras-email-field>
        <doras-radio-cards
          id="recoveryProvider"
          name="recoveryProvider"
          label=${f.t('forgot.legend')}
          .options=${options}
          .value=${f.value('recoveryProvider')}
          .error=${f.s.errors.recoveryProvider}
          @change=${f.input('recoveryProvider')}
        ></doras-radio-cards>
        ${primary(f, 'forgot', f.t('forgot.submit'), f.t('common.checking'), f.requestEmail)}
      </form>
      <div class="flow-links">
        <doras-step-link @click=${() => f.go('search')}
          >${f.t('forgot.searchInstead')}</doras-step-link
        >
      </div>`,
  });
}

/** Check your email. Never says whether an account exists. */
export function checkEmail(f: FlowHarness) {
  const recovery = f.s.recovery ?? { email: '', provider: 'unsure' };
  const unsure = recovery.provider === 'unsure';
  const provider =
    recovery.provider === 'app'
      ? f.appName
      : (PROVIDERS.find((p) => p.id === recovery.provider)?.name ?? '');
  const asked = formatList(f.i18n.locale, [...PROVIDERS.map((p) => p.name), f.appName]);
  const title = f.t('checkEmail.heading');
  return sheet(f, {
    label: title,
    back: f.s.history.length > 0,
    body: html`<doras-icon class="flow-hero" name="mail-open" size="xl"></doras-icon>
      ${heading(title)}
      <p>
        ${
          unsure
            ? f.t('checkEmail.bodyUnsure', { email: recovery.email })
            : f.t('checkEmail.body', { provider, email: recovery.email })
        }
      </p>
      ${unsure ? html`<p class="flow-fine">${f.t('checkEmail.asked', { providers: asked })}</p>` : nothing}
      <p>
        ${
          unsure
            ? f.t('checkEmail.fromUnsure', { app: f.appName })
            : f.t('checkEmail.from', { provider, app: f.appName })
        }
      </p>
      <doras-button full-width @click=${() => f.go('recover')}
        >${f.t('checkEmail.got')}</doras-button
      >
      <div class="flow-links">
        <doras-step-link @click=${() => f.go('forgot')}
          >${f.t('checkEmail.another')}</doras-step-link
        >
        <doras-step-link @click=${() => f.go('search')}
          >${f.t('forgot.searchInstead')}</doras-step-link
        >
      </div>`,
  });
}
