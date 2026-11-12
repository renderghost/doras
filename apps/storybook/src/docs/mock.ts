// What a browser mock's docs page says, in place of a spec. Mocks have no
// spec: specs describe what ships, and mocks never do.

/** On every mock's stories and docs page (#15). */
export const MOCK_WARNING = 'Mock: the browser draws this. Not for production.';

export interface MockTrigger {
  /** The browser API, as developers know it, such as “WebAuthn: signing in”. */
  api: string;
  /** Where it's explained. */
  href: string;
  /** When the browser shows this UI. */
  when: string;
  /** What the page calls, instead of drawing this. */
  code: string;
}

export interface MockDocs {
  summary: string;
  tag: string;
  triggers: MockTrigger[];
  /** The mock's events, which the clickable flows (#16) listen for. */
  events: { name: string; when: string }[];
  notes?: string[];
}
