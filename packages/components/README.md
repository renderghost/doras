# @doras/components

The `<doras-…>` Web Components, built with Lit. They draw the interface and send events; apps and providers connect them to sign-in. Each one implements its spec in `@doras/specs`, and its docs are in Storybook.

## Using them

```js
import '@doras/tokens/css'; // once, for the whole page
import '@doras/components'; // registers every element
```

Or import one component, such as `@doras/components/button/button`. Components take their language from the nearest `lang` attribute, and their direction from `dir`.

## Actions (#8)

| Element                            | What it does                                                               |
| ---------------------------------- | -------------------------------------------------------------------------- |
| `<doras-button>`                   | Makes something happen. Primary, secondary or tertiary, with a busy state. |
| `<doras-icon-button>`              | An action with only an icon. Always named, with a 44px target.             |
| `<doras-link>`                     | Goes somewhere. Says when it opens a new tab.                              |
| `<doras-continue-with-atmosphere>` | The one door into signing in, the same in every app.                       |
| `<doras-disclosure>`               | Shows and hides content most people don't need.                            |

## User input (#9)

| Element                  | What it does                                                                     |
| ------------------------ | -------------------------------------------------------------------------------- |
| `<doras-text-field>`     | A label, hint, input and message. The base for the others.                       |
| `<doras-email-field>`    | Tuned for email addresses.                                                       |
| `<doras-password-field>` | Show and hide, and the right autocomplete for signing in or choosing a password. |
| `<doras-code-field>`     | One input for a code; submits the digits alone.                                  |
| `<doras-handle-field>`   | A combobox that forgives how handles are typed and suggests accounts.            |
| `<doras-radio-cards>`    | A choice drawn as cards. Nothing chosen by default.                              |
| `<doras-switch>`         | Turns one optional thing on or off.                                              |
| `<doras-fieldset>`       | Groups fields under a legend.                                                    |

The app validates; fields show the result. Set `error` to a catalogue message to mark a field invalid, and clear it when it's fixed. Listen for `doras-input`, which waits for input methods to finish composing, to validate live once a field has an error. `readHandle()` is exported for apps that need the same forgiving reading.

## Display (#10)

| Element                   | What it does                                                                  |
| ------------------------- | ----------------------------------------------------------------------------- |
| `<doras-icon>`            | A Lucide icon from the Doras set. Decorative unless labelled; mirrors in RTL. |
| `<doras-divider>`         | A rule, or “or” between two ways to do the same thing.                        |
| `<doras-permission-item>` | What an app can do, and why, on the Connect page.                             |
| `<doras-facts-list>`      | Label and value pairs; handles and codes read correctly in any language.      |
| `<doras-formatted-code>`  | A code grouped for reading, and read digit by digit.                          |
| `<doras-atmosphere-mark>` | The placeholder mark, named or decorative.                                    |

## Identity (#11)

| Element                   | What it does                                                                    |
| ------------------------- | ------------------------------------------------------------------------------- |
| `<doras-avatar>`          | A picture, or initials in any script. Decorative beside a name.                 |
| `<doras-handle>`          | A handle with its @, isolated, breaking after its dots.                         |
| `<doras-account-row>`     | Avatar, name, handle and “Hosted by”, with a “Did you mean” style.              |
| `<doras-provider-badge>`  | A provider's name and logo, from the provider list.                             |
| `<doras-app-identity>`    | The app's name, logo and verified domain.                                       |
| `<doras-linked-accounts>` | The app and the account in two cards, with the link badge centred between them. |

Provider logos live in `src/provider-badge/logos/`, each listed in `providers.ts` with its source and permission. None is there yet: see that folder's README.

## Things to know

- **Buttons are never disabled.** While busy, presses do nothing, and the busy label says what's happening.
- **`<doras-button>` defaults to `type="button"`.** Set `type="submit"` to submit its form. It takes part in forms through `ElementInternals`, as native buttons do.
- **Pressing Enter in a field** submits its form, even when the submit button is a Doras button.
- **Focus:** every component delegates focus to its native control, so `element.focus()` and the Tab key reach it.
- **Motion** comes from the motion tokens, so reduced motion stops it, including the busy spinner.
