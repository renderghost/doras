# @doras/i18n

Every string Doras shows, in [ICU MessageFormat](https://unicode-org.github.io/icu/userguide/format_parse/messages/), and the runtime that formats them. UK English is the source. Copy is locked: apps choose the locale, never the words.

## Locales

| Locale        | Tag     | Status                                                 |
| ------------- | ------- | ------------------------------------------------------ |
| UK English    | `en-GB` | The source                                             |
| Pseudo-locale | `en-XA` | Generated: accented, about 40% longer, and in brackets |
| Arabic        | `ar`    | Test translation, right to left                        |
| German        | `de`    | Test translation                                       |
| Japanese      | `ja`    | Test translation                                       |

Test translations are marked `"status": "test"` until a professional translation replaces them.

## Using it

Components use the Lit controller, which reads the nearest `lang` attribute, through shadow roots, and re-renders when it changes:

```ts
import { LocaleController } from '@doras/i18n/lit';

class DorasBack extends LitElement {
  #i18n = new LocaleController(this);
  render() {
    return html`<button aria-label=${this.#i18n.t('common.back')}>…</button>`;
  }
}
```

Anything else can call `format(locale, key, values)`. Also exported:

- `matchLocale(tag)`: the best Doras locale for a language tag.
- `localeOf(element)`: an element's locale.
- `formatCode(code)`: a code grouped for reading.
- `formatList(locale, items)`: a list joined for the locale.

Text values are wrapped in Unicode isolates, which do what `<bdi>` does inside a sentence. Use `withoutIsolation` to compare or copy text.

Emails and other platforms can read the compiled catalogues from `@doras/i18n/catalogues/<locale>.json`.

## Adding a string

1. Add it to `src/messages/en-GB.json`, with a description for translators.
2. Add it to every other file in `src/messages`.
3. Run `pnpm build`.

The build stops if:

- a message isn't valid ICU MessageFormat
- a locale is missing a key, or has one the source doesn't
- a translation's placeholders differ from the source's
- a plural misses one of its locale's plural forms (Arabic has six)
- a translation drops “Atmosphere”, which is never translated
- a UK English string uses a word from the naughty list (`naughty-list.json`)
