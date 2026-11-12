// The Atmosphere providers Doras knows, with their logos. Each logo is a
// separate, swappable file with its source and permission recorded, so a
// logo can be added, swapped or removed if a provider asks (#1). Until a
// provider's permission is recorded, its badge uses a plain initial tile.

export interface ProviderLogo {
  /** The logo's URL or path. */
  src: string;
  /** Where it came from. */
  source: string;
  /** Who agreed to its use, and when. */
  permission: string;
}

export interface Provider {
  id: string;
  name: string;
  /** The ending of handles it hosts. */
  domain: string;
  logo: ProviderLogo | null;
}

export const PROVIDERS: readonly Provider[] = [
  { id: 'bluesky', name: 'Bluesky', domain: 'bsky.social', logo: null },
  { id: 'blacksky', name: 'Blacksky', domain: 'blacksky.app', logo: null },
  { id: 'eurosky', name: 'Eurosky', domain: 'eurosky.social', logo: null },
  { id: 'northsky', name: 'Northsky', domain: 'northsky.social', logo: null },
];

export const providerById = (id: string): Provider | undefined =>
  PROVIDERS.find((p) => p.id === id);
