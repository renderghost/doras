// A provisional shape for component specs, so the docs template can be built
// now. #7 replaces it with types generated from the spec JSON Schema; the
// sections map one to one onto the docs page.
import type { MessageKey } from '@doras/i18n';

export interface ComponentSpec {
  /** The component's name, as people say it. */
  name: string;
  /** The custom element's tag. */
  tag: string;
  /** The behaviour group it's filed under in the sidebar. */
  group: string;
  /** One or two sentences: what it is and what it's for. */
  summary: string;
  usage: {
    when: string[];
    whenNot: { text: string; instead?: string }[];
  };
  anatomy: { part: string; description: string }[];
  states: { name: string; description: string }[];
  events: {
    name: string;
    /** UI events are for the app to act on. Measurement events are for counting sign-in moments. */
    kind: 'ui' | 'measurement';
    when: string;
    detail?: string;
  }[];
  accessibility: {
    role: string;
    name: string;
    keyboard: { keys: string; action: string }[];
    screenReader: string[];
    notes?: string[];
  };
  /** The semantic or component tokens it uses. */
  tokens: string[];
  content: {
    guidelines: string[];
    /** The catalogue keys of the strings it shows. The docs page shows each in every locale. */
    strings: MessageKey[];
    /** Words it uses, as the glossary defines them. */
    terms?: { term: string; meaning: string }[];
  };
  dosAndDonts: { do: string; dont: string }[];
  evidence: { point: string; source?: { label: string; href: string } }[];
}
