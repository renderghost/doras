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

## Things to know

- **Buttons are never disabled.** While busy, presses do nothing, and the busy label says what's happening.
- **`<doras-button>` defaults to `type="button"`.** Set `type="submit"` to submit its form. It takes part in forms through `ElementInternals`, as native buttons do.
- **Pressing Enter in a text field** submits a form only through a native submit button, so the User input fields (#9) submit the form themselves.
- **Focus:** every component delegates focus to its native control, so `element.focus()` and the Tab key reach it.
- **Motion** comes from the motion tokens, so reduced motion stops it, including the busy spinner.
