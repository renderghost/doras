// Reads the message catalogues from src/messages.
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const MESSAGES_DIR = fileURLToPath(new URL('../src/messages/', import.meta.url));

export interface SourceCatalogue {
  locale: string;
  status: 'source';
  messages: Record<string, { message: string; description: string }>;
}

export interface Translation {
  locale: string;
  /** "test" until a professional translation replaces it. */
  status: 'test' | 'reviewed';
  messages: Record<string, string>;
}

export function readCatalogues(dir = MESSAGES_DIR): {
  source: SourceCatalogue;
  translations: Translation[];
} {
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
  const read = (file: string): unknown => JSON.parse(readFileSync(path.join(dir, file), 'utf8'));
  const source = read('en-GB.json') as SourceCatalogue;
  const translations = files
    .filter((f) => f !== 'en-GB.json')
    .map((f) => read(f) as Translation)
    .sort((a, b) => a.locale.localeCompare(b.locale));
  return { source, translations };
}

export interface NaughtyTerm {
  term: string;
  patterns: string[];
  caseSensitive?: boolean;
  useInstead: string;
}

export function readNaughtyList(): NaughtyTerm[] {
  const file = fileURLToPath(new URL('../naughty-list.json', import.meta.url));
  return (JSON.parse(readFileSync(file, 'utf8')) as { terms: NaughtyTerm[] }).terms;
}
