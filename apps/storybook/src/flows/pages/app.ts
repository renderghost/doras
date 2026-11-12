// Potluck, the sample app (#16). A plain backdrop, not built from
// components: it's the app's own page. Its copy is Potluck's, so it stays
// in English whatever the locale; only Doras's copy is translated.
import { html, nothing } from 'lit';
import type { FlowHarness } from '../harness.ts';
import { heading } from './templates.ts';

function bar(f: FlowHarness, signedIn = false) {
  const account = f.s.account;
  return html`<header class="potluck-bar">
    <doras-app-identity
      name=${f.appName}
      domain=${f.appDomain}
      .logo=${f.appLogo || undefined}
    ></doras-app-identity>
    ${
      signedIn && account
        ? html`<span class="potluck-who"
            ><doras-avatar name=${account.name} size="sm" decorative></doras-avatar
            ><doras-handle .handle=${account.handle}></doras-handle
            ><doras-button variant="tertiary" @click=${f.signOut}>Sign out</doras-button></span
          >`
        : nothing
    }
  </header>`;
}

/** The app's sign-in page, with Continue with Atmosphere. */
export function potluck(f: FlowHarness) {
  const app = f.appName;
  return html`<div class="potluck">
    ${bar(f)}
    <main class="potluck-main">
      <section class="potluck-intro" aria-label=${`About ${app}`}>
        <p class="potluck-kicker">Recipes from people you know</p>
        <p class="potluck-display">Cook it. Share it. Keep it.</p>
        <p>${app} is where friends swap the recipes they actually make.</p>
      </section>
      <section class="potluck-card" aria-labelledby="potluck-signin">
        ${f.s.cancelled ? html`<doras-notice tone="info">${f.t('connect.cancelled')}</doras-notice>` : nothing}
        <h1 id="potluck-signin" class="potluck-title">Sign in to ${app}</h1>
        <p>Save recipes, follow friends and share what you cook.</p>
        <doras-continue-with-atmosphere
          full-width
          @click=${f.continueWithAtmosphere}
        ></doras-continue-with-atmosphere>
        <doras-divider variant="or"></doras-divider>
        <doras-button variant="secondary" full-width @click=${f.createAccount}
          >Create an Atmosphere account</doras-button
        >
      </section>
    </main>
  </div>`;
}

/** Signed in: the app's home, and its welcome. */
export function home(f: FlowHarness) {
  const account = f.s.account;
  const first = account?.name.split(' ')[0] ?? '';
  const provider = f.providerName();
  return html`<div class="potluck">
    ${bar(f, true)}
    <main class="potluck-main potluck-home">
      <section class="potluck-card">
        ${
          f.s.isNew
            ? html`${heading(`Welcome to ${f.appName}, ${first}.`, 'h1')}
                <p>
                  Your Atmosphere account, @${account?.handle}, is ready, hosted by ${provider}.
                  It’s one account for ${f.appName}, Bluesky and every other Atmosphere app.
                </p>`
            : html`${heading(`You’re in, ${first}.`, 'h1')}
                <p>
                  You signed in with your Atmosphere account, @${account?.handle}, hosted by
                  ${provider}. Recipes you save are kept in your account, so they’re yours even if
                  you stop using ${f.appName}.
                </p>`
        }
      </section>
    </main>
  </div>`;
}
