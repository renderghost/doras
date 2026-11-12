// The two templates (#16): Front Door's sheet over the app, and the
// provider's own page. Plus the pieces every step shares.
import { html, nothing, type TemplateResult } from 'lit';
import type { Person } from '../data.ts';
import type { FlowHarness } from '../harness.ts';
import { potluck } from './app.ts';

/** The provider id the components know, or the app's name when it hosts the account. */
export const providerOf = (f: FlowHarness, person: Person | null): string =>
  !person ? '' : person.provider === 'app' ? f.appName : person.provider;

/** A step's heading. It takes focus when the step opens. */
export const heading = (text: string, level: 'h1' | 'h2' = 'h2') =>
  level === 'h1'
    ? html`<h1 class="flow-heading" tabindex="-1" data-step-heading>${text}</h1>`
    : html`<h2 class="flow-heading" tabindex="-1" data-step-heading>${text}</h2>`;

/** The failure switch's notice, at the top of a step, with Try again where trying again helps. */
export function failureNotice(f: FlowHarness) {
  const failure = f.s.failure;
  if (!failure || failure === 'none') return nothing;
  return html`<doras-notice
    failure=${failure}
    provider=${f.providerName()}
    minutes="5"
    data-flow-failure
  >
    ${
      f.canRetry
        ? html`<doras-button slot="actions" variant="secondary" @click=${f.retry}
            >${f.t('common.tryAgain')}</doras-button
          >`
        : nothing
    }
  </doras-notice>`;
}

/** Front Door, in its sheet over the app. */
export function sheet(
  f: FlowHarness,
  { label, back = false, body }: { label: string; back?: boolean; body: TemplateResult },
) {
  return html`${potluck(f)}
    <doras-sheet open label=${label} app-name=${f.appName} @doras-close=${f.closeSheet}>
      <doras-sheet-header slot="header" ?back=${back} @doras-back=${f.back}></doras-sheet-header>
      <div class="flow-stack">${failureNotice(f)} ${body}</div>
    </doras-sheet>`;
}

/** The provider's own page, on its own address. */
export function providerPage(f: FlowHarness, body: TemplateResult) {
  const account = f.s.account;
  return html`<doras-provider-page
    provider=${providerOf(f, account)}
    app-name=${f.appName}
    ?app-hosted=${account?.provider === 'app'}
  >
    <doras-card>
      <div class="flow-stack">${failureNotice(f)} ${body}</div>
    </doras-card>
  </doras-provider-page>`;
}

/** Both sides of the handshake: the app, and the account it's connecting to. */
export function handshake(f: FlowHarness) {
  const account = f.s.account;
  if (!account?.handle) return nothing;
  return html`<doras-linked-accounts
    app-name=${f.appName}
    app-domain=${f.appDomain}
    .appLogo=${f.appLogo || undefined}
    name=${account.name}
    handle=${account.handle}
    provider=${providerOf(f, account)}
  ></doras-linked-accounts>`;
}

/** A primary button that shows it's busy while the sample server answers. */
export function primary(
  f: FlowHarness,
  id: string,
  label: string,
  busyLabel: string,
  onClick: () => void,
) {
  return html`<doras-button
    full-width
    ?busy=${f.s.busy === id}
    busy-label=${busyLabel}
    data-action=${id}
    @click=${onClick}
    >${label}</doras-button
  >`;
}
