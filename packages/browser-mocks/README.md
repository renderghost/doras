# @doras/browser-mocks

Look-alikes of the UI the browser draws itself, so flows can be clicked through in Storybook.

**Mock: the browser draws this. Not for production.** This package is never published. Every production package's build fails if it imports it, ESLint flags the import, and a workspace test fails if anything but Storybook depends on it.

| Element                        | Stands in for                                                                                  | Browser API                                              |
| ------------------------------ | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `<doras-mock-account-chooser>` | The browser's list of Atmosphere accounts used on this device.                                 | FedCM: `navigator.credentials.get({ identity })`         |
| `<doras-mock-passkey-prompt>`  | Signing in with a passkey, making one, using a phone or tablet, and no passkey on this device. | WebAuthn: `navigator.credentials.get()` and `.create()`  |
| `<doras-mock-autofill>`        | A saved passkey, or a code from Mail, under the focused field.                                 | `autocomplete="username webauthn"` and `"one-time-code"` |

## Events

The flows listen for these, as a page waits for the browser:

| Event                 | From            | When                                                                       |
| --------------------- | --------------- | -------------------------------------------------------------------------- |
| `doras-mock-pick`     | Account chooser | An account was picked. `detail.handle` names it.                           |
| `doras-mock-other`    | Account chooser | “Use another Atmosphere account” was pressed.                              |
| `doras-mock-dismiss`  | Account chooser | It was closed without a pick.                                              |
| `doras-mock-passkey`  | Passkey prompt  | The passkey was used or made. `detail.mode` is `sign-in` or `create`.      |
| `doras-mock-cancel`   | Passkey prompt  | It was closed. `detail.error` is `NotAllowedError`, as the page would get. |
| `doras-mock-autofill` | Autofill        | The suggestion was picked. `detail` has `kind` and `value`.                |

The account chooser and passkey prompt are modal: set `open` to show them. Mock text is English, left to right, on any page: the browser speaks its own language, not the app's.
