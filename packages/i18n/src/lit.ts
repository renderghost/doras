// A Lit controller that gives a component its locale and re-renders it when
// the page's lang changes.
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { format, type MessageKey, type MessageValues } from './format.ts';
import { DIRECTIONS, SOURCE_LOCALE, localeOf, type Locale } from './locales.ts';

type Host = ReactiveControllerHost & HTMLElement;

// One observer for the whole page: lang changes are rare, so every
// connected controller re-checks its locale when any lang attribute changes.
const controllers = new Set<LocaleController>();
let observer: MutationObserver | undefined;

function watch(): void {
  if (observer || typeof MutationObserver === 'undefined') return;
  observer = new MutationObserver(() => {
    for (const controller of controllers) controller.refresh();
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang'],
    subtree: true,
  });
}

export class LocaleController implements ReactiveController {
  #host: Host;
  #locale: Locale = SOURCE_LOCALE;

  constructor(host: Host) {
    this.#host = host;
    host.addController(this);
  }

  /** The locale from the nearest lang attribute. */
  get locale(): Locale {
    return this.#locale;
  }

  /** The text direction for the locale. Layout follows dir, not this. */
  get direction(): 'ltr' | 'rtl' {
    return DIRECTIONS[this.#locale];
  }

  hostConnected(): void {
    controllers.add(this);
    watch();
    this.refresh();
  }

  hostDisconnected(): void {
    controllers.delete(this);
  }

  /** Re-reads the locale, and re-renders the host if it changed. */
  refresh(): void {
    const next = localeOf(this.#host);
    if (next !== this.#locale) {
      this.#locale = next;
      this.#host.requestUpdate();
    }
  }

  /** A message in the host's locale. */
  t(key: MessageKey, values?: MessageValues): string {
    return format(this.#locale, key, values);
  }
}
