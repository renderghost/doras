// The flows' sample data (#16): people from the prototype's scenarios, the
// providers that host them, and Potluck, the sample app. None of it is real.

export interface Person {
  name: string;
  handle: string;
  /** A provider id from the provider list, or the app's name when it hosts the account. */
  provider: string;
  email?: string;
}

export interface FlowProvider {
  id: string;
  name: string;
  /** Where its pages live. */
  host: string;
  /** What its handles end in. */
  ending: string;
}

/** The providers in the flows, A to Z. The app's own hosting is added for each app. */
export const PROVIDERS: FlowProvider[] = [
  { id: 'blacksky', name: 'Blacksky', host: 'blacksky.app', ending: 'blacksky.app' },
  { id: 'bluesky', name: 'Bluesky', host: 'bsky.social', ending: 'bsky.social' },
  { id: 'eurosky', name: 'Eurosky', host: 'eurosky.social', ending: 'eurosky.social' },
  { id: 'northsky', name: 'Northsky', host: 'northsky.social', ending: 'northsky.social' },
];

/** Public profiles, as type-ahead would see them. */
export const PEOPLE: Person[] = [
  {
    name: 'Sam Okafor',
    handle: 'sam.bsky.social',
    provider: 'bluesky',
    email: 'sam.okafor@example.com',
  },
  { name: 'Sam Lee', handle: 'samlee.eurosky.social', provider: 'eurosky' },
  { name: 'Samira Haddad', handle: 'samira.blacksky.app', provider: 'blacksky' },
  { name: 'Sami Virtanen', handle: 'sami.northsky.social', provider: 'northsky' },
  {
    name: 'Rae Thompson',
    handle: 'rae.blacksky.app',
    provider: 'blacksky',
    email: 'rae.thompson@example.com',
  },
  { name: 'Rae Kim', handle: 'raekim.bsky.social', provider: 'bluesky' },
  {
    name: 'Priya Shah',
    handle: 'priya.bsky.social',
    provider: 'bluesky',
    email: 'priya.shah@example.com',
  },
  {
    name: 'Alex Moreno',
    handle: 'alex.bsky.social',
    provider: 'bluesky',
    email: 'alex.moreno@example.com',
  },
  { name: 'Alex Cooks', handle: 'alexcooks.eurosky.social', provider: 'eurosky' },
  { name: 'Alex Moreno Studio', handle: 'alexmoreno.studio', provider: 'bluesky' },
  { name: 'Jordan Ellis', handle: 'jordan.northsky.social', provider: 'northsky' },
];

/** Who is at the keyboard, and what this browser already knows. */
export interface Scenario {
  label: string;
  /** The person signing in or recovering. */
  handle?: string;
  /** Someone new, with no account yet. */
  newcomer?: { name: string; email: string };
  /** Accounts the browser can offer. */
  browserAccounts: string[];
}

export const SCENARIOS = {
  sam: {
    label: 'Sam: knows their details, new laptop',
    handle: 'sam.bsky.social',
    browserAccounts: [],
  },
  alex: {
    label: 'Alex: several accounts in this browser',
    handle: 'alex.bsky.social',
    browserAccounts: ['alex.bsky.social', 'alexcooks.eurosky.social', 'alexmoreno.studio'],
  },
  priya: {
    label: 'Priya: has one, doesn’t know it',
    handle: 'priya.bsky.social',
    browserAccounts: ['priya.bsky.social'],
  },
  rae: { label: 'Rae: forgot their details', handle: 'rae.blacksky.app', browserAccounts: [] },
  jo: {
    label: 'Jo: new to the Atmosphere',
    newcomer: { name: 'Jo Park', email: 'jo.park@example.com' },
    browserAccounts: [],
  },
} satisfies Record<string, Scenario>;

export type ScenarioId = keyof typeof SCENARIOS;

/** The app's own permissions, in its own words. Potluck's copy, so English. */
export const PERMISSIONS = [
  {
    icon: 'book-open',
    label: 'Save recipes and cookbooks to your account',
    reason: 'so your recipes stay yours, even if you stop using Potluck.',
  },
  {
    icon: 'user-round',
    label: 'Use your name and profile picture',
    reason: 'so friends recognise you.',
  },
];

/** The one permission people can switch off. */
export const OPTIONAL_PERMISSION = {
  label: 'Post recipes you choose to share',
  reason:
    'Why: so people who follow you on Bluesky and other Atmosphere apps can see them. Only when you press Share.',
};

/** What the app asks for, as the provider shows it in the technical details. */
export const TECHNICAL = [
  { label: 'Recipes and cookbooks', value: 'include:kitchen.potluck.recipes' },
  { label: 'Profile', value: 'rpc:app.bsky.actor.getProfile' },
  { label: 'Posts (optional)', value: 'repo:app.bsky.feed.post?action=create' },
];

/** The device a lost passkey is on. */
export const LOST_DEVICE = 'Pixel 8';

export const findPerson = (handle: string): Person | undefined =>
  PEOPLE.find((p) => p.handle === handle.toLowerCase());

export const providerFor = (id: string): FlowProvider | undefined =>
  PROVIDERS.find((p) => p.id === id);

/** Up to five accounts whose handle or name starts with what was typed. */
export function lookUp(typed: string): Person[] {
  const q = typed.trim().toLowerCase().replace(/^@+/, '');
  if (q.length < 2) return [];
  return PEOPLE.filter(
    (p) =>
      p.handle.startsWith(q) ||
      p.name.toLowerCase().startsWith(q) ||
      p.name
        .toLowerCase()
        .split(/\s+/)
        .some((word) => word.startsWith(q)),
  ).slice(0, 5);
}

/** Hides most of an email address, as the provider does: r•••@example.com. */
export const maskEmail = (email: string): string => {
  const [local = '', domain = ''] = email.split('@');
  return `${local.slice(0, 1)}•••@${domain}`;
};
