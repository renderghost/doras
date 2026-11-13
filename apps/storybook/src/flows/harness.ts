// The flow harness (#16): wires the pages together with sample data and the
// browser mocks, so every journey can be clicked through in Storybook. It
// holds the state a real app, Front Door and provider would each hold, and
// plays all three. Storybook only.
import '@doras/browser-mocks';
import '@doras/components';
import type { HandleSuggestion } from '@doras/components';
import { readHandle } from '@doras/components/handle-field/read-handle';
import type { MessageKey, MessageValues } from '@doras/i18n';
import { LocaleController } from '@doras/i18n/lit';
import type { DorasMeasurement } from '@doras/specs';
import { LitElement, html, type PropertyValues } from 'lit';
import {
  SCENARIOS,
  findPerson,
  lookUp,
  providerFor,
  type Person,
  type ScenarioId,
} from './data.ts';
import { renderStep } from './pages/index.ts';
import './flows.css';

export type Step =
  | 'app'
  | 'find'
  | 'search'
  | 'recover'
  | 'confirm'
  | 'create'
  | 'found'
  | 'forgot'
  | 'check-email'
  | 'pv-signin'
  | 'pv-totp'
  | 'pv-offer'
  | 'pv-code'
  | 'pv-next-time'
  | 'pv-signup'
  | 'pv-handle'
  | 'pv-connect'
  | 'pv-ready'
  | 'home';

/** Steps in Front Door's sheet, over the app. The rest are the provider's pages, or the app's. */
export const SHEET_STEPS: ReadonlySet<Step> = new Set([
  'find',
  'search',
  'recover',
  'confirm',
  'create',
  'found',
  'forgot',
  'check-email',
]);

export type Failure =
  'none' | 'network' | 'too-many-attempts' | 'session-expired' | 'provider-unavailable';

/** The passkey switch: what the account signing in has. */
export type PasskeyVariation = 'none' | 'here' | 'lost-phone' | 'codes' | 'passkey-only';

type Prompt = 'sign-in' | 'create' | 'none-here';

/** The emailed code, the same every time so tests can type it. */
export const RECOVERY_CODE = '482913';

/** How long the sample servers take, so busy states show. */
const WAIT_MS = 400;

interface State {
  step: Step;
  history: Step[];
  /** The account signing in, being connected, or just made. */
  account: Person | null;
  /** Made in this flow, so Connect is the short version when the app hosts it. */
  isNew: boolean;
  /** Found by the browser's chooser, so the provider skips its sign-in page. */
  viaBrowser: boolean;
  values: Record<string, string>;
  errors: Record<string, string>;
  /** A failure shown on this step, from the failure switch. */
  failure: Failure | null;
  /** An info message on this step, as a catalogue key. */
  info: MessageKey | null;
  /** The button that's busy, if any. */
  busy: string | null;
  suggestions: HandleSuggestion[];
  /** The browser UI showing over the page. */
  chooser: boolean;
  prompt: Prompt | null;
  /** The app's notice after Connect is cancelled. */
  cancelled: boolean;
  recovery: { email: string; provider: string } | null;
  /** Handles with a passkey on this device. */
  passkeys: Set<string>;
  lostRemoved: boolean;
  allowPost: boolean;
  createAnyway: boolean;
  passwordInstead: boolean;
  /** Who will host the new account: a provider id, "app" or "other". */
  host: string;
  method: '' | 'passkey' | 'password';
}

export class FlowHarness extends LitElement {
  static override properties = {
    scenario: { type: String },
    failure: { type: String },
    passkey: { type: String },
    appName: { type: String, attribute: 'app-name' },
    appDomain: { type: String, attribute: 'app-domain' },
    appLogo: { type: String, attribute: 'app-logo' },
    start: { type: String },
  };

  declare scenario: ScenarioId;
  /** The failure switch: the next submit on a step it fits fails this way, once. */
  declare failure: Failure;
  declare passkey: PasskeyVariation;
  declare appName: string;
  declare appDomain: string;
  declare appLogo: string;
  /** Where the flow starts, for a page's own story. */
  declare start: Step;

  readonly i18n = new LocaleController(this);
  s!: State;
  #failed = new Set<Step>();
  #retry: (() => void) | null = null;
  #afterPasskey: (() => void) | null = null;
  #afterCancel: (() => void) | null = null;
  #timers = new Set<ReturnType<typeof setTimeout>>();
  #moved = false;
  /** Which of the app's buttons opened Front Door, and whether closing it should go back there. */
  #opener: 'continue' | 'create' | null = null;
  #toOpener = false;

  constructor() {
    super();
    this.scenario = 'sam';
    this.failure = 'none';
    this.passkey = 'none';
    this.appName = 'Potluck';
    this.appDomain = 'potluck.kitchen';
    this.appLogo = '';
    this.start = 'app';
  }

  // Light DOM, so stories and tests reach the pages as an app's would be.
  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    for (const timer of this.#timers) clearTimeout(timer);
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (!this.s || changed.has('scenario') || changed.has('start') || changed.has('passkey')) {
      this.reset();
    }
  }

  protected override updated(): void {
    if (!this.#moved) return;
    this.#moved = false;
    void this.#focusStep();
  }

  /**
   * Each new step's heading takes focus, so screen readers start there.
   * Closing Front Door puts focus back on the button that opened it, as
   * closing any dialog should; the app's page is drawn afresh, so the
   * dialog can't do that itself.
   */
  async #focusStep(): Promise<void> {
    const back = this.#toOpener;
    this.#toOpener = false;
    const target = back
      ? this.querySelector<HTMLElement>(`[data-opener="${this.#opener ?? 'continue'}"]`)
      : this.querySelector<HTMLElement>('[data-step-heading]');
    if (!target) return;
    // A heading slotted into a component that hasn't drawn yet, such as a
    // provider page's main, can't take focus: wait for its components.
    const hosts = [...this.querySelectorAll('*')].filter(
      (el) => el === target || el.contains(target),
    ) as (Element & { updateComplete?: Promise<unknown> })[];
    await Promise.all(hosts.map((el) => el.updateComplete));
    target.focus();
  }

  // ---- What pages read ----------------------------------------------------

  /** A catalogue string in the page's locale. */
  t = (key: MessageKey, values?: MessageValues): string => this.i18n.t(key, values);

  get person(): Person | undefined {
    const handle = (SCENARIOS[this.scenario] as { handle?: string }).handle;
    return handle ? findPerson(handle) : undefined;
  }

  get newcomer(): { name: string; email: string } | undefined {
    return (SCENARIOS[this.scenario] as { newcomer?: { name: string; email: string } }).newcomer;
  }

  get browserAccounts(): Person[] {
    return SCENARIOS[this.scenario].browserAccounts
      .map((h) => findPerson(h))
      .filter((p): p is Person => Boolean(p));
  }

  /** The provider's name, or the app's when it hosts the account. */
  providerName(person: Person | null = this.s.account): string {
    if (!person) return '';
    if (person.provider === 'app') return this.appName;
    return providerFor(person.provider)?.name ?? person.provider;
  }

  providerHost(person: Person | null = this.s.account): string {
    if (!person) return '';
    if (person.provider === 'app') return `account.${this.appDomain}`;
    return providerFor(person.provider)?.host ?? person.provider;
  }

  /** What the passkey switch means for the account signing in. */
  get passkeyHere(): boolean {
    const handle = this.s.account?.handle ?? '';
    return this.s.passkeys.has(handle);
  }

  // ---- Moving between steps ----------------------------------------------

  reset = (): void => {
    for (const timer of this.#timers) clearTimeout(timer);
    this.#failed.clear();
    const person = this.person;
    const passkeys = new Set<string>();
    if (person && (this.passkey === 'here' || this.passkey === 'passkey-only')) {
      passkeys.add(person.handle);
    }
    const start = this.start;
    // A page's own story starts with what the steps before it would have set.
    const account =
      start.startsWith('pv-') || start === 'confirm' || start === 'home' ? (person ?? null) : null;
    this.s = {
      step: start,
      history: [],
      account,
      isNew: false,
      viaBrowser: false,
      values: {},
      errors: {},
      failure: null,
      info: null,
      busy: null,
      suggestions: [],
      chooser: false,
      prompt: null,
      cancelled: false,
      recovery:
        start === 'check-email' && person?.email
          ? { email: person.email, provider: person.provider }
          : null,
      passkeys,
      lostRemoved: false,
      allowPost: true,
      createAnyway: false,
      passwordInstead: false,
      host: 'app',
      method: '',
    };
    if (start === 'pv-signup' || start === 'pv-handle' || start === 'pv-ready') {
      const newcomer = this.newcomer ?? { name: 'Jo Park', email: 'jo.park@example.com' };
      this.s.values = { email: newcomer.email, name: newcomer.name, newHandle: 'jopark' };
      this.s.account = {
        name: newcomer.name,
        handle: 'jopark.potluck.kitchen',
        provider: 'app',
        email: newcomer.email,
      };
      this.s.isNew = start === 'pv-ready';
    }
    this.requestUpdate();
  };

  /** Changes state and redraws. */
  set(patch: Partial<State>): void {
    this.s = { ...this.s, ...patch };
    this.requestUpdate();
  }

  go = (step: Step, patch: Partial<State> = {}): void => {
    this.set({
      history: [...this.s.history, this.s.step],
      errors: {},
      failure: null,
      info: null,
      busy: null,
      suggestions: [],
      ...patch,
      step,
    });
    this.#retry = null;
    this.#moved = true;
  };

  back = (): void => {
    const history = [...this.s.history];
    const step = history.pop() ?? 'app';
    this.#toOpener = step === 'app' && SHEET_STEPS.has(this.s.step);
    this.set({ history, step, errors: {}, failure: null, info: null, busy: null });
    this.#moved = true;
  };

  /** Closing the sheet, as Front Door's close button or Escape would. */
  closeSheet = (): void => {
    if (!SHEET_STEPS.has(this.s.step)) return;
    this.#toOpener = true;
    this.set({ step: 'app', history: [] });
    this.#moved = true;
  };

  later(run: () => void, ms = WAIT_MS): void {
    const timer = setTimeout(() => {
      this.#timers.delete(timer);
      run();
    }, ms);
    this.#timers.add(timer);
  }

  /** Shows a button as busy, then runs the next step, as a server would answer. */
  submit(button: string, run: () => void): void {
    this.set({ busy: button });
    this.later(() => {
      this.set({ busy: null });
      run();
    });
  }

  measure = (detail: DorasMeasurement): void => {
    this.dispatchEvent(new CustomEvent('doras-measure', { detail, bubbles: true, composed: true }));
  };

  value = (field: string): string => this.s.values[field] ?? '';

  /** Keeps what's typed, so a failure or Back never loses it. */
  input = (field: string) => (event: Event) => {
    const value =
      (event as CustomEvent<{ value?: string }>).detail?.value ??
      (event.target as HTMLInputElement).value;
    // As people fix an error, it goes.
    const errors = Object.fromEntries(
      Object.entries(this.s.errors).filter(([key]) => key !== field),
    );
    this.set({ values: { ...this.s.values, [field]: value }, errors });
  };

  /**
   * The failure switch. On a step it fits, the first submit fails this way,
   * keeping what was typed; Try again, or submitting again, goes on.
   * Session expired starts again from “Is this you?”, keeping the account.
   */
  fails(kinds: Failure[], retry: () => void): boolean {
    const failure = this.failure;
    if (failure === 'none' || !kinds.includes(failure) || this.#failed.has(this.s.step))
      return false;
    this.#failed.add(this.s.step);
    if (failure === 'session-expired') {
      this.#failed.add('confirm');
      this.go('confirm', { failure });
      return true;
    }
    this.#retry = failure === 'too-many-attempts' ? null : retry;
    this.set({ failure, busy: null });
    return true;
  }

  retry = (): void => {
    const run = this.#retry;
    this.set({ failure: null });
    this.#retry = null;
    run?.();
  };

  get canRetry(): boolean {
    return this.#retry !== null;
  }

  // ---- The app ------------------------------------------------------------

  continueWithAtmosphere = (): void => {
    this.#opener = 'continue';
    this.set({ cancelled: false });
    if (this.browserAccounts.length) {
      this.set({ chooser: true });
      return;
    }
    this.go('find');
  };

  createAccount = (): void => {
    this.#opener = 'create';
    this.set({ cancelled: false });
    if (this.browserAccounts.length) {
      this.measure({ name: 'doras.existing_account_found' });
      this.go('found');
      return;
    }
    this.go('create');
  };

  signOut = (): void => {
    this.start = 'app';
    this.reset();
  };

  // ---- The browser --------------------------------------------------------

  chooserPick = (event: CustomEvent<{ handle: string }>): void => {
    const account = findPerson(event.detail.handle) ?? null;
    this.measure({ name: 'doras.account_found', via: 'browser' });
    this.later(() => {
      this.set({ chooser: false });
      this.measure({ name: 'doras.sign_in_started' });
      // The browser has a session with the provider, so it asks only to connect.
      this.go('pv-connect', { account, viaBrowser: true });
    });
  };

  chooserOther = (): void => {
    this.set({ chooser: false });
    this.go('find');
  };

  chooserDismiss = (): void => {
    this.set({ chooser: false });
  };

  /** Asks the browser for a passkey, as the page's WebAuthn call would. */
  askForPasskey(prompt: Prompt, then: () => void, cancelled?: () => void): void {
    this.#afterPasskey = then;
    this.#afterCancel = cancelled ?? null;
    this.set({ prompt });
  }

  passkeyDone = (): void => {
    const then = this.#afterPasskey;
    this.#afterPasskey = null;
    this.#afterCancel = null;
    this.set({ prompt: null });
    then?.();
  };

  passkeyCancelled = (): void => {
    const cancelled = this.#afterCancel;
    this.#afterPasskey = null;
    this.#afterCancel = null;
    this.set({ prompt: null });
    cancelled?.();
  };

  // ---- Front Door: finding the account --------------------------------------

  query = (event: CustomEvent<{ text: string }>): void => {
    const text = event.detail.text;
    const reading = readHandle(text);
    const exact = reading.kind === 'handle' ? findPerson(reading.handle) : undefined;
    const people = lookUp(text).filter((p) => p !== exact);
    const suggestions: HandleSuggestion[] = [
      ...(exact
        ? [
            {
              handle: exact.handle,
              name: exact.name,
              hostedBy: this.providerName(exact),
              didYouMean: reading.fixes.length > 0,
            },
          ]
        : []),
      ...people.map((p) => ({ handle: p.handle, name: p.name, hostedBy: this.providerName(p) })),
    ].slice(0, 5);
    const values = { ...this.s.values, handle: text };
    const errors = { ...this.s.errors };
    delete errors.handle;
    this.set({ values, errors, suggestions, info: null });
  };

  select = (event: CustomEvent<{ handle: string }>): void => {
    const account = findPerson(event.detail.handle) ?? null;
    if (!account) return;
    this.measure({ name: 'doras.account_found', via: 'suggestion' });
    this.toConfirmOrCode(account);
  };

  /** After the recovery email, the provider asks for the code next; otherwise “Is this you?”. */
  toConfirmOrCode(account: Person): void {
    if (this.s.step === 'recover') {
      this.measure({ name: 'doras.sign_in_started' });
      this.go('pv-code', { account });
      return;
    }
    this.go('confirm', { account });
  }

  find = (): void => {
    const typed = this.value('handle');
    const reading = readHandle(typed);
    const example = 'sam.bsky.social';
    const other = 'rae.blacksky.app';
    const error = (message: string) => this.set({ errors: { handle: message }, suggestions: [] });
    if (reading.kind === 'empty') return error(this.t('find.errorEmpty'));
    if (reading.kind === 'email') {
      this.set({ info: 'find.useEmail' });
      return error(this.t('find.errorEmail', { example }));
    }
    if (reading.kind === 'partial') {
      const people = lookUp(typed);
      if (people.length) {
        this.set({
          errors: { handle: this.t('find.partial', { example }) },
          suggestions: people.map((p) => ({
            handle: p.handle,
            name: p.name,
            hostedBy: this.providerName(p),
          })),
        });
        return;
      }
      this.measure({ name: 'doras.account_not_found' });
      return error(this.t('find.noOne', { name: typed.trim(), example, other }));
    }
    const account = findPerson(reading.handle);
    if (!account) {
      this.measure({ name: 'doras.account_not_found' });
      return error(this.t('find.notFound', { handle: `@${reading.handle}` }));
    }
    if (this.fails(['network'], this.find)) return;
    this.submit('find', () => {
      this.measure({ name: 'doras.account_found', via: 'typed' });
      this.toConfirmOrCode(account);
    });
  };

  toProvider = (): void => {
    if (this.fails(['provider-unavailable', 'network'], this.toProvider)) return;
    this.measure({ name: 'doras.sign_in_started' });
    this.go('pv-signin');
  };

  forgot = (): void => {
    this.measure({ name: 'doras.recovery_started' });
    const typed = readHandle(this.value('handle'));
    this.go(
      'forgot',
      typed.kind === 'email' ? { values: { ...this.s.values, email: typed.handle } } : {},
    );
  };

  // ---- Front Door: creating ----------------------------------------------

  useExisting = (account: Person): void => {
    this.measure({ name: 'doras.account_found', via: 'browser' });
    this.measure({ name: 'doras.sign_in_started' });
    this.go('pv-connect', { account, viaBrowser: true });
  };

  chooseHost = (): void => {
    const host = this.s.host;
    if (host === 'other') {
      const address = this.value('address')
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/\/.*$/, '');
      if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(address)) {
        this.set({
          errors: { address: this.t('create.addressError', { example: 'pds.example.com' }) },
        });
        return;
      }
    }
    if (this.fails(['network', 'provider-unavailable'], this.chooseHost)) return;
    this.measure({ name: 'doras.provider_chosen', typed_address: host === 'other' });
    const provider = host === 'other' ? 'eurosky' : host;
    this.go('pv-signup', { account: { name: '', handle: '', provider } });
  };

  // ---- Front Door: recovering --------------------------------------------

  requestEmail = (): void => {
    const email = this.value('email').trim();
    const provider = this.value('recoveryProvider');
    const errors: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = this.t('forgot.errorEmail', { example: 'name@example.com' });
    }
    if (!provider) errors.recoveryProvider = this.t('forgot.errorProvider');
    if (Object.keys(errors).length) {
      this.set({ errors });
      void this.querySelector('doras-error-summary')?.show(
        Object.entries(errors).map(([target, message]) => ({ target, message })),
      );
      return;
    }
    if (this.fails(['network', 'too-many-attempts'], this.requestEmail)) return;
    this.submit('forgot', () => {
      this.measure({
        name: 'doras.recovery_email_requested',
        providers_asked: provider === 'unsure' ? 5 : 1,
      });
      this.go('check-email', { recovery: { email, provider } });
    });
  };

  // ---- The provider --------------------------------------------------------

  /** A new handle's ending: the app's domain when it hosts the account. */
  ending(person: Person | null = this.s.account): string {
    if (!person) return '';
    if (person.provider === 'app') return this.appDomain;
    return providerFor(person.provider)?.ending ?? person.provider;
  }

  signIn = (): void => {
    if (!this.value('password')) {
      this.set({ errors: { password: this.t('signin.errorEmpty') } });
      return;
    }
    if (this.passkey === 'passkey-only') {
      this.set({ errors: { password: this.t('signin.errorPasskeyOnly') } });
      return;
    }
    const failures: Failure[] = [
      'network',
      'too-many-attempts',
      'session-expired',
      'provider-unavailable',
    ];
    if (this.fails(failures, this.signIn)) return;
    this.submit('signin', () => {
      if (this.passkey === 'codes') {
        this.go('pv-totp');
        return;
      }
      this.measure({ name: 'doras.signed_in', method: 'password' });
      this.afterSignIn();
    });
  };

  /** After a password, the provider offers a passkey, unless this device has one. */
  afterSignIn(): void {
    if (this.passkeyHere) {
      this.go('pv-connect');
      return;
    }
    this.measure({ name: 'doras.passkey_offered' });
    this.go('pv-offer');
  }

  usePasskey = (): void => {
    this.askForPasskey(
      this.passkeyHere ? 'sign-in' : 'none-here',
      () => {
        this.measure({ name: 'doras.signed_in', method: 'passkey' });
        this.go('pv-connect');
      },
      () => this.set({ info: 'signin.passkeyCancelled' }),
    );
  };

  verify = (): void => {
    if (this.value('totp').replace(/\D/g, '').length !== 6) {
      this.set({ errors: { totp: this.t('totp.error') } });
      return;
    }
    if (this.fails(['network', 'too-many-attempts', 'session-expired'], this.verify)) return;
    this.submit('totp', () => {
      this.measure({ name: 'doras.signed_in', method: 'password' });
      this.afterSignIn();
    });
  };

  /** The browser makes a passkey for the account, then the page moves on. */
  addPasskey(next: () => void): void {
    this.askForPasskey('create', () => {
      const handle = this.s.account?.handle ?? '';
      this.set({ passkeys: new Set([...this.s.passkeys, handle]) });
      this.measure({ name: 'doras.passkey_added' });
      next();
    });
  }

  offerAdd = (): void => this.addPasskey(() => this.go('pv-connect'));

  declinePasskey = (): void => {
    this.measure({ name: 'doras.passkey_declined' });
    this.go('pv-connect');
  };

  /** “Forgot password?”: the provider emails a sign-in code. */
  emailCode = (): void => {
    this.go('pv-code');
  };

  resendCode = (): void => {
    this.set({ info: 'code.sent' });
  };

  checkCode = (): void => {
    if (this.value('code').replace(/\D/g, '') !== RECOVERY_CODE) {
      this.set({ errors: { code: this.t('code.error', { provider: this.providerName() }) } });
      return;
    }
    if (this.fails(['network', 'too-many-attempts', 'session-expired'], this.checkCode)) return;
    this.submit('code', () => {
      this.measure({ name: 'doras.signed_in', method: 'code' });
      this.measure({ name: 'doras.recovery_completed' });
      this.go('pv-next-time');
    });
  };

  removeLost = (): void => {
    this.set({ lostRemoved: true });
  };

  nextTimeAdd = (): void => this.addPasskey(() => this.go('pv-connect'));

  savePassword = (): void => {
    if (this.value('newPassword').length < 8) {
      this.set({ errors: { newPassword: this.t('signup.errorPassword') } });
      return;
    }
    if (this.fails(['network'], this.savePassword)) return;
    this.submit('save', () => this.go('pv-connect'));
  };

  #showErrors(errors: Record<string, string>): boolean {
    this.set({ errors });
    const list = Object.entries(errors).map(([target, message]) => ({ target, message }));
    void this.querySelector('doras-error-summary')?.show(list);
    return list.length > 0;
  }

  signUp = (): void => {
    const email = this.value('email').trim();
    const method = this.s.method;
    const errors: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = this.t('signup.errorEmail', { example: 'name@example.com' });
    }
    if (!method) errors.method = this.t('signup.errorMethod');
    if (method === 'password' && this.value('newPassword').length < 8) {
      errors.newPassword = this.t('signup.errorPassword');
    }
    if (this.#showErrors(errors)) return;
    if (this.fails(['network', 'provider-unavailable'], this.signUp)) return;
    if (method === 'password') {
      this.go('pv-handle', { values: this.#withHandleSuggestion() });
      return;
    }
    this.askForPasskey(
      'create',
      () => this.go('pv-handle', { values: this.#withHandleSuggestion() }),
      () => this.set({ errors: { method: this.t('signup.passkeyCancelled') } }),
    );
  };

  /** Suggests a handle from the person's name, as the provider would. */
  #withHandleSuggestion(): Record<string, string> {
    const name = this.newcomer?.name ?? 'Jo Park';
    const local = name
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]/g, '');
    return {
      ...this.s.values,
      name: this.value('name') || name,
      newHandle: this.value('newHandle') || local,
    };
  }

  createHandle = (): void => {
    const name = this.value('name').trim();
    const local = this.value('newHandle').trim().toLowerCase().replace(/^@+/, '');
    const ending = this.ending();
    const errors: Record<string, string> = {};
    if (!name) errors.name = this.t('newHandle.errorName');
    if (!/^[a-z0-9-]+$/.test(local)) errors.newHandle = this.t('newHandle.errorChars');
    else if (local.length < 3 || local.length > 20)
      errors.newHandle = this.t('newHandle.errorLength');
    else if (findPerson(`${local}.${ending}`)) {
      errors.newHandle = this.t('newHandle.taken', {
        handle: `@${local}.${ending}`,
        suggestion: `${local}-cooks`,
      });
    }
    if (this.#showErrors(errors)) return;
    if (this.fails(['network'], this.createHandle)) return;
    this.submit('create', () => {
      const provider = this.s.account?.provider ?? 'app';
      const account: Person = {
        name,
        handle: `${local}.${ending}`,
        provider,
        email: this.value('email'),
      };
      const passkeys = new Set(this.s.passkeys);
      if (this.s.method === 'passkey') passkeys.add(account.handle);
      this.measure({
        name: 'doras.account_created',
        method: this.s.method === 'passkey' ? 'passkey' : 'password',
      });
      if (this.s.method === 'passkey') this.measure({ name: 'doras.passkey_added' });
      this.go(provider === 'app' ? 'pv-ready' : 'pv-connect', { account, isNew: true, passkeys });
    });
  };

  // ---- Connect -------------------------------------------------------------

  connect = (): void => {
    if (this.fails(['network', 'session-expired'], this.connect)) return;
    const version = this.s.step === 'pv-ready' ? 'short' : 'full';
    this.submit('connect', () => {
      this.measure({ name: 'doras.connect_approved', version });
      this.go('home', { history: [] });
    });
  };

  cancelConnect = (): void => {
    this.measure({ name: 'doras.connect_cancelled' });
    this.go('app', { cancelled: true, history: [], account: null });
  };

  /** “Not you?” and “Change”: back to choose another account. */
  changeAccount = (): void => {
    this.go('find', { account: null, history: [] });
  };

  override render() {
    return html`${renderStep(this)}`;
  }
}

customElements.define('flow-harness', FlowHarness);

declare global {
  interface HTMLElementTagNameMap {
    'flow-harness': FlowHarness;
  }
}
