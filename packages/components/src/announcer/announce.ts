// One shared pair of live regions for the whole page: polite and assertive.
// Each message is appended, so several arriving at once are all read, and
// removed a little later so the regions don't grow.

type Politeness = 'polite' | 'assertive';

const REGION_ATTRIBUTE = 'data-doras-announcer';
const HIDDEN =
  'position:absolute;inline-size:1px;block-size:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0';

let regions: Record<Politeness, HTMLElement> | undefined;

/** Creates the regions once. Returns true if they're new. */
export function ensureAnnouncer(): boolean {
  if (regions?.polite.isConnected) return false;
  const host = document.createElement('div');
  host.setAttribute(REGION_ATTRIBUTE, '');
  host.setAttribute('style', HIDDEN);
  const polite = document.createElement('div');
  polite.setAttribute('role', 'status');
  polite.setAttribute('aria-live', 'polite');
  const assertive = document.createElement('div');
  assertive.setAttribute('role', 'alert');
  assertive.setAttribute('aria-live', 'assertive');
  host.append(polite, assertive);
  document.body.append(host);
  regions = { polite, assertive };
  return true;
}

/** How long a message stays in the region, so it can be read. */
const KEEP_MS = 7000;

/**
 * Announces a message to screen readers. Polite waits for a pause; use
 * assertive only for something people must hear at once.
 */
export function announce(message: string, politeness: Politeness = 'polite'): void {
  if (!message.trim()) return;
  const fresh = ensureAnnouncer();
  const add = () => {
    const line = document.createElement('p');
    line.textContent = message;
    regions?.[politeness].append(line);
    setTimeout(() => line.remove(), KEEP_MS);
  };
  // A region that's just been added isn't watched yet, so wait a moment.
  if (fresh) setTimeout(add, 100);
  else add();
}

/** The messages in a region now. For tests. */
export function announcements(politeness: Politeness = 'polite'): string[] {
  return [...(regions?.[politeness].querySelectorAll('p') ?? [])].map((p) => p.textContent ?? '');
}
