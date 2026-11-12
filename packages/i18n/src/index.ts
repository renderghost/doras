// @doras/i18n: Doras's strings, and how components show them.
export {
  DIRECTIONS,
  LOCALES,
  PSEUDO_LOCALE,
  SOURCE_LOCALE,
  localeOf,
  matchLocale,
  type Locale,
} from './locales.ts';
export {
  format,
  formatCode,
  formatList,
  isolate,
  withoutIsolation,
  type MessageKey,
  type MessageValues,
} from './format.ts';
export { catalogues } from './generated/catalogues.ts';
