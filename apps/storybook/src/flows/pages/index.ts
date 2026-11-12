// Which page each step shows, and the browser's own UI over it (#16).
import { html, nothing } from 'lit';
import type { FlowHarness } from '../harness.ts';
import { home, potluck } from './app.ts';
import { checkEmail, confirm, create, find, forgot, found } from './front-door.ts';
import {
  code,
  connect,
  newHandle,
  nextTime,
  offer,
  ready,
  signIn,
  signUp,
  totp,
} from './provider.ts';
import { providerOf } from './templates.ts';

function page(f: FlowHarness) {
  switch (f.s.step) {
    case 'app':
      return potluck(f);
    case 'find':
    case 'search':
    case 'recover':
      return find(f);
    case 'confirm':
      return confirm(f);
    case 'create':
      return create(f);
    case 'found':
      return found(f);
    case 'forgot':
      return forgot(f);
    case 'check-email':
      return checkEmail(f);
    case 'pv-signin':
      return signIn(f);
    case 'pv-totp':
      return totp(f);
    case 'pv-offer':
      return offer(f);
    case 'pv-code':
      return code(f);
    case 'pv-next-time':
      return nextTime(f);
    case 'pv-signup':
      return signUp(f);
    case 'pv-handle':
      return newHandle(f);
    case 'pv-connect':
      return connect(f);
    case 'pv-ready':
      return ready(f);
    case 'home':
      return home(f);
  }
}

/** The browser's account chooser and passkey prompt: mocks, drawn over the page. */
function browser(f: FlowHarness) {
  const account = f.s.account;
  return html`<doras-mock-account-chooser
      app-name=${f.appName}
      app-domain=${f.appDomain}
      .accounts=${f.browserAccounts.map((p) => ({ ...p, provider: providerOf(f, p) }))}
      .open=${f.s.chooser}
      @doras-mock-pick=${f.chooserPick}
      @doras-mock-other=${f.chooserOther}
      @doras-mock-dismiss=${f.chooserDismiss}
    ></doras-mock-account-chooser>
    <doras-mock-passkey-prompt
      .mode=${f.s.prompt ?? 'sign-in'}
      site=${f.providerHost()}
      handle=${account?.handle ?? f.value('email')}
      name=${account?.name ?? ''}
      provider=${providerOf(f, account)}
      .open=${f.s.prompt !== null}
      @doras-mock-passkey=${f.passkeyDone}
      @doras-mock-cancel=${f.passkeyCancelled}
    ></doras-mock-passkey-prompt>`;
}

export function renderStep(f: FlowHarness) {
  return html`${page(f)} ${f.s.step === 'app' || f.s.step.startsWith('pv-') ? browser(f) : nothing}`;
}
