# Safari and iOS Safari checklist

CI runs every story test in WebKit, but WebKit in CI isn't Safari: it has no VoiceOver, no iCloud Keychain, no on-screen keyboard and no Apple Mail. Before each release, someone checks these by hand on real devices and records the results in the release's issue.

## Devices and versions

Check each on the oldest supported version and the current one:

| Browser                        | Oldest | Current        |
| ------------------------------ | ------ | -------------- |
| Safari on macOS                | 16.4   | latest release |
| iOS Safari, on an iPhone       | 16.4   | latest release |
| iPadOS Safari, with a keyboard | 16.4   | latest release |

Use the published Storybook. If a device on 16.4 isn't to hand, a simulator from that version of Xcode, or a device cloud, will do; note which.

## The journeys

In each of the Flows group's Click through stories (Sign in, Create an account, Recover), in the light theme and in dark mode:

- [ ] Continue with Atmosphere opens the sheet, and it can be closed again.
- [ ] On an iPhone, the sheet comes up from the bottom, and the on-screen keyboard never hides the field being typed in.
- [ ] Every step can be finished, start to end, with touch.
- [ ] With a keyboard (Mac, or iPad with a keyboard), every step can be finished without a pointer, focus is always visible, Tab never leaves an open sheet or dialog, and Escape closes it and returns focus.
- [ ] Each new step's heading has focus, so VoiceOver starts there.
- [ ] Failure states (the Failure control): the notice appears, what was typed is still there, and Try again works.

## VoiceOver

On an iPhone and on a Mac:

- [ ] Opening the sheet moves VoiceOver into it, and nothing behind it can be reached.
- [ ] Field labels, hints and errors are read with each field, and an error summary is read when it appears.
- [ ] Codes are read digit by digit, in the code field and in the facts list.
- [ ] Handles are read as handles, not spelt out oddly, in the account row and the handle field's suggestions.
- [ ] Toasts and busy states are announced once.
- [ ] Switches, radio cards and details say their state.

## Settings people change

- [ ] Larger text (Settings, Accessibility, Display and Text Size, at its largest): nothing is cut off or overlaps.
- [ ] Zoom to 200% on a Mac: nothing is cut off, and there's no sideways scrolling at 320px wide.
- [ ] Reduce Motion: the sheet and spinners don't move.
- [ ] Increase Contrast, with the increased-contrast theme: borders and text are clear.
- [ ] Arabic (the Locale toolbar): everything mirrors, and handles and codes stay left to right.

## Forms

- [ ] Email and one-time-code fields offer iCloud Keychain and Mail's suggestions where Safari would.
- [ ] The password field's show and hide button works, and the password manager still offers to save.
- [ ] Pressing Return in a field submits its form.

## Emails

Send yourself both emails (the samples in `packages/emails/dist/samples` after `pnpm build`) and open them in Apple Mail on a Mac and an iPhone:

- [ ] They look right in light and dark mode.
- [ ] The Arabic emails are right to left.
- [ ] The recovery email has no links, and the code is easy to read and copy.
- [ ] The welcome email's button works, and so does the address under it.

## Recording the results

Copy this list into the release's issue, tick what passed, and open an issue for anything that didn't, with the device, version and steps.
