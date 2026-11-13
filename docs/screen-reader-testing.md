# Screen reader testing

The accessibility audit in CI checks what a machine can measure. Whether Doras makes sense when you listen to it needs a person. This guide says what to test, with which setups, and how to record the result so each component's docs page shows it.

## The setups

Test with all five. Use the latest versions, and write down the ones you used.

| Setup                     | Spec value                | Notes                                                                       |
| ------------------------- | ------------------------- | --------------------------------------------------------------------------- |
| VoiceOver, Safari, macOS  | `voiceover-safari-macos`  | Turn on Safari's “Press Tab to highlight each item on a webpage”.           |
| VoiceOver, Safari, iOS    | `voiceover-safari-ios`    | Swipe and double-tap; also try the rotor's headings and form controls.      |
| NVDA, Firefox, Windows    | `nvda-firefox-windows`    | Test in browse mode and focus mode.                                         |
| NVDA, Chrome, Windows     | `nvda-chrome-windows`     | As with Firefox.                                                            |
| TalkBack, Chrome, Android | `talkback-chrome-android` | Swipe and double-tap; also try the reading controls for headings and links. |

## Before you start

- Open Storybook: the published one, or `pnpm storybook` on your own machine.
- Test each story on its own, without Storybook around it: open the story, then **Open canvas in new tab**. The address looks like `iframe.html?id=actions-button--primary&viewMode=story`.
- Have the component's docs page open on another screen. Its **Accessibility** section is what you're testing against: the role, the accessible name, the keys, what screen readers should say, and any announcements.

## Each component

For every story of the component:

1. **Find it** with the screen reader's own navigation, not only Tab: the next form control, heading or link, or swiping.
2. **Listen to it.** You should hear its role and its name as the spec says. Hints and errors are read after the name.
3. **Use it** with the keys in the spec, or double-tap on a phone. Every state change should be heard: expanded and collapsed, checked, busy, and invalid with its message.
4. **Listen for announcements.** Anything the spec lists under Announcements should be read once, politely, without cutting off what you're doing.
5. **Try Arabic.** Switch the toolbar's locale to Arabic and check the reading order still makes sense.

## Each journey

Go through each flow from start to finish, in the **Flows** section: signing in, creating an account, recovering an account, and the browser's account chooser.

- Each new step should start by reading its heading.
- Closing Front Door, with Escape or the close button, should return you to the button that opened it.
- **Back** should take you to the previous step, and read its heading.
- Error summaries should be read when they appear, and each link should take you to its field.

## Passkeys and password managers

These are the browser's and the system's own, so test them on real devices, not with the Storybook mocks. With an app or provider page that uses Doras:

- **VoiceOver, Safari, macOS and iOS:** saving a passkey and signing in with one in iCloud Keychain, password autofill, and codes from Mail or Messages offered above the keyboard.
- **NVDA, Windows:** Windows Hello passkeys in Chrome and Firefox, and a password manager extension filling the handle and password.
- **TalkBack, Android:** Google Password Manager passkeys and passwords, and codes offered from messages.

Check that pasting works in every field, and that nothing asks you to remember or retype something a password manager could fill.

## Recording a result

Add the result to the component's spec, in `packages/specs/src/components`, under `accessibility.screenReaderResults`. One entry per setup:

```json
"screenReaderResults": [
  {
    "setup": "nvda-firefox-windows",
    "result": "works",
    "date": "2026-11-20",
    "versions": "NVDA 2026.3, Firefox 145, Windows 11"
  }
]
```

- **`result`:** `works` when it behaves as the spec says. `works-with-notes` when it's usable but differs from the spec: say how in `notes`. `problems` when something doesn't work: open an issue, and put its address in `issue`.
- **When you test again,** replace the entry for that setup rather than adding another.

Run `pnpm build`, and the component's docs page shows the result. Setups without an entry say “Not yet tested”.

When all five setups have results for every component, update the status in the accessibility statement, `apps/storybook/src/stories/Accessibility.mdx`.
