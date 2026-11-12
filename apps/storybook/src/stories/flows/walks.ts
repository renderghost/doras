// The journeys as walks (#16): catalogue keys, resolved in the page's
// locale, so the same walk runs in every locale. Patterns are the app's
// and the browser's own English.
import type { Move } from './flow-meta.ts';

const app = 'Potluck';

/** Sam signs in with a handle and password, declines a passkey, and connects. */
export const SIGN_IN: Move[] = [
  { press: 'atmosphere.continue' },
  { step: ['find.heading', { app }] },
  { type: 'find.label', value: 'sam.bsky.social' },
  { press: 'find.submit' },
  { step: 'confirm.heading' },
  { press: ['confirm.continue', { provider: 'Bluesky' }] },
  { step: 'signin.heading' },
  { type: 'common.password', value: 'correct horse battery' },
  { press: 'common.signIn' },
  { step: 'offer.heading' },
  { press: 'common.notNow' },
  { step: ['connect.heading', { app }] },
  { press: 'connect.approve' },
  { step: /You’re in, Sam\./ },
];

/** Jo is new: Potluck hosts the account, with a passkey, then the short Connect. */
export const CREATE: Move[] = [
  { press: /^Create an Atmosphere account$/ },
  { step: 'create.heading' },
  { press: ['create.continueWith', { provider: app }] },
  { type: 'common.email', value: 'jo.park@example.com' },
  { choose: 'signup.passkey' },
  { press: 'signup.submit' },
  { press: /^Continue$/ },
  { step: 'newHandle.heading' },
  { press: 'newHandle.submit' },
  { step: 'connect.ready' },
  { press: ['connect.continue', { app }] },
  { step: /Welcome to Potluck, Jo\./ },
];

/** Rae finds the account by email, signs in with the emailed code, and adds a passkey. */
export const RECOVER: Move[] = [
  { press: 'atmosphere.continue' },
  { press: 'find.forgot' },
  { step: 'forgot.heading' },
  { type: 'common.email', value: 'rae.thompson@example.com' },
  { choose: /^Blacksky/ },
  { press: 'forgot.submit' },
  { step: 'checkEmail.heading' },
  { press: 'checkEmail.got' },
  { step: 'recover.heading' },
  { type: 'find.label', value: 'rae.blacksky.app' },
  { press: 'common.continue' },
  { step: 'code.heading' },
  { press: /482 913/ },
  { press: 'common.signIn' },
  { step: 'nextTime.heading' },
  { press: 'offer.add' },
  { press: /^Continue$/ },
  { step: ['connect.heading', { app }] },
  { press: 'connect.approve' },
  { step: /You’re in, Rae\./ },
];
