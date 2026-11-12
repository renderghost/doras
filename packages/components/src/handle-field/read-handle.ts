// Reads a handle from what someone typed, forgivingly: a leading @, an
// email-style handle (sam@bsky.social), a profile link, and common slips
// in the ending (bsky.app for bsky.social). Pure, so apps can use it too.

export interface HandleDomains {
  /** Handle endings, and the provider that hosts them. */
  endings: Record<string, string>;
  /** Common slips, and the ending they mean. */
  slips: Record<string, string>;
}

/** The well-known providers' endings, and slips seen in the prototype's research. */
export const DEFAULT_DOMAINS: HandleDomains = {
  endings: {
    'bsky.social': 'Bluesky',
    'blacksky.app': 'Blacksky',
    'eurosky.social': 'Eurosky',
    'northsky.social': 'Northsky',
  },
  slips: {
    'bsky.app': 'bsky.social',
    'bluesky.social': 'bsky.social',
    'bluesky.app': 'bsky.social',
    'bsky.com': 'bsky.social',
    'blacksky.community': 'blacksky.app',
    'blacksky.social': 'blacksky.app',
    'eurosky.app': 'eurosky.social',
    'eurosky.tech': 'eurosky.social',
  },
};

export type HandleFix =
  | { type: 'at-sign' }
  | { type: 'link' }
  | { type: 'ending'; ending: string; correct: string; provider: string };

export interface HandleReading {
  /**
   * handle: a full handle. partial: no dot yet, so perhaps a name.
   * email: an email address, not a handle. empty: nothing typed.
   */
  kind: 'handle' | 'partial' | 'email' | 'empty';
  /** The handle, without an @, in lower case. */
  handle: string;
  /** What was corrected, so the field can say so. */
  fixes: HandleFix[];
}

export function readHandle(typed: string, domains: HandleDomains = DEFAULT_DOMAINS): HandleReading {
  let s = typed.trim().toLowerCase().replace(/\s+/g, '').replace(/^@+/, '');
  const fixes: HandleFix[] = [];
  if (!s) return { kind: 'empty', handle: '', fixes };

  const link = /(?:^|\/\/|\.)bsky\.app\/profile\/([^/?#]+)/.exec(s);
  if (link?.[1]) {
    s = link[1].replace(/^@+/, '');
    fixes.push({ type: 'link' });
  }

  if (s.includes('@')) {
    const [local = '', domain = ''] = s.split('@');
    if (!(domain in domains.endings) && !(domain in domains.slips)) {
      return { kind: 'email', handle: s, fixes };
    }
    s = `${local}.${domain}`;
    fixes.push({ type: 'at-sign' });
  }

  for (const [slip, correct] of Object.entries(domains.slips)) {
    if (s.endsWith(`.${slip}`)) {
      s = `${s.slice(0, -slip.length)}${correct}`;
      fixes.push({
        type: 'ending',
        ending: slip,
        correct,
        provider: domains.endings[correct] ?? correct,
      });
      break;
    }
  }

  return { kind: s.includes('.') ? 'handle' : 'partial', handle: s, fixes };
}
