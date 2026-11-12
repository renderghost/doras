# Decisions

The decisions behind Doras, made in November 2026 and tracked in the epic, [#1](https://github.com/renderghost/doras/issues/1). Each says what was decided and why. If a decision changes, update it here, say why, and keep the old reason in its history.

## Foundations

### Web Components, built with Lit

Components are Web Components built with Lit, with tags named `<doras-…>`.

**Why:** the sign-in experience has to look and behave the same in every Atmosphere app, and those apps use React, Svelte, Vue or plain HTML. Web Components work in all of them from one build.

### Components draw the interface and send events

Components take state and send events, such as "handle submitted". Apps and providers connect them to handle lookup, OAuth and WebAuthn.

**Why:** a clear boundary, and a smaller library. The protocol logic belongs to the apps and providers that run it.

### A platform-neutral spec for every component

Every component has a machine-readable spec covering:

- anatomy
- props
- states
- events
- accessibility
- tokens
- strings

The Lit build implements it, Storybook's docs are generated from it, and mobile apps build from it later.

**Why:** web comes first, but mobile apps are coming. A shared spec stops the platforms drifting apart.

Details settled while building it ([#7](https://github.com/renderghost/doras/issues/7)):

- **Format:** JSON, checked against a JSON Schema (2020-12).
  - Everything outside `platforms` is platform-neutral.
  - Web details sit under `platforms.web`: the tag, slots and form association. iOS and Android get their own sections when they arrive.
- **One source for docs too:** a spec also holds the docs content: usage, content guidelines, do and don't, and evidence. Storybook's docs pages and default Controls are generated from it, so docs can't drift from the component. A docs page can exist before its component does, as the button's does now.
- **Checked against the rest of Doras:** the build fails if a spec names a token, string or measurement event that doesn't exist, or uses a primitive.
- **Types:**
  - `ComponentSpec` is generated from the schema.
  - Each component's props and events types are generated from its spec, for its Lit class to implement.
  - `DorasMeasurement` types every measurement event.
- **Boolean props are off by default,** as HTML boolean attributes are. The schema enforces it.
- **Button:**
  - It has no `disabled` prop at all.
  - Its `type` defaults to `button`, not `submit` as native buttons do, so adding one to a form never submits it by accident.
- **Measurement events:**
  - Sent as one DOM event, `doras-measure`, with the event's name in its detail. It bubbles out of shadow roots, so apps listen once, on the document.
  - Events carry only fixed values, flags or counts. The schema rejects free text, so nothing personal, not even a provider's name, can be sent.
  - The first list has 17 events across sign in, creating an account, Connect, passkeys, recovery and the four failure states.

### Tokens: DTCG format, three tiers, three platforms

Tokens are written in the DTCG 2025.10 format and built with Style Dictionary. They come in three tiers:

1. **Primitive:** raw values.
2. **Semantic:** meaning, such as error text or a raised surface.
3. **Component:** only where a component truly differs.

From day one, they build to:

- CSS custom properties
- Swift
- Kotlin (Compose)

**Why:** DTCG is the standard, stable since October 2025. A sparse component tier keeps the system themable without thousands of one-off tokens. Building for mobile now proves the tokens really are device-agnostic.

Details settled while building them ([#3](https://github.com/renderghost/doras/issues/3)):

- **Primitives never leave the package:** they aren't written to CSS, Swift or Kotlin, so components can't use them by accident.
- **Style Dictionary resolves; Doras formats:** Style Dictionary reads the DTCG files and resolves references, but its Swift and Kotlin formats mishandle 2025.10 values. So Doras writes the CSS, Swift and Kotlin itself, from the same resolved values.
- **Dimensions:** authored in px. On the web they become rem, so they grow with people's text size. Border widths and the focus ring stay in px. iOS uses the same numbers as points, and Android as dp (sp for type).
- **Forced colours:** each semantic colour records its Windows forced-colours system colour next to its value, in an `org.doras` extension.

### Themes: light, dark, high contrast of each, and forced colours

Four themes:

- light, the default
- dark
- light high contrast
- dark high contrast

The system's dark and contrast settings choose one, and Storybook can force any of them. Text in the high-contrast themes is at least 7:1. Components stay usable in Windows forced colours. Apps can't theme Doras.

**Why:** the same look in every app is the point of a shared sign-in, and people who need more contrast or dark mode get it everywhere.

**Changed in [#3](https://github.com/renderghost/doras/issues/3):** the plan had a single increased-contrast theme. People can ask for more contrast in dark mode too, and iOS, Android and the web (`prefers-contrast` with `prefers-color-scheme`) all treat the two settings separately. So high contrast became an extra layer on top of light or dark. The DTCG Resolver module models exactly this.

### Figma follows the code

A script syncs the tokens one way, into variables in a new Doras library file in Figma, with a mode for each theme.

**Why:** one source of truth. Designers use the same values as the code, without two places to edit.

Details settled while building it ([#4](https://github.com/renderghost/doras/issues/4)):

- **Six collections:**
  - Primitives, hidden from publishing and from every picker.
  - Theme, with the four theme modes.
  - Scale, Typography, Motion and Components.
- **Variables:**
  - Semantic variables are aliases of primitives, and component variables are aliases of semantic ones, so the chain shows in Figma as it does in code.
  - Every variable has scopes, a description, and code syntax for web, iOS and Android.
- **Styles:**
  - Shadows and type styles can't be single variables, so they're effect and text styles bound to variables.
  - Each shadow layer's colour is a Theme variable, so shadows change with the mode.
- **Fonts in Figma:** Figma's Inter has no 650 or 750 weight, so text styles use Semi Bold and Bold. The code style uses Roboto Mono, because Figma doesn't have the system monospace fonts.
- **Figma plan:** four modes in one collection need a Professional plan or above. On Starter the sync stops and says so.
- **Re-running the sync:** it finds everything by name, so running it again updates in place and keeps every link. It never deletes: variables the tokens no longer have are kept and reported.
- **Running it:** designers run it as a development plugin. Agents use `use_figma`, which takes at most 50,000 characters, so the plan and code travel into the file as text in SVGs, and a short loader runs them.

### Actions, the first components

Settled while building them ([#8](https://github.com/renderghost/doras/issues/8)):

- **Lit, without decorators:** components declare their properties with `static properties`, so they build with plain TypeScript and need no decorator transform.
- **Each implements its spec:** its class implements the props type generated from its spec, so the build fails if the code and the spec disagree.
- **Button:**
  - Never disabled. While busy, presses do nothing, the busy label replaces the label, and a polite live region announces it (until the shared announcer in #12).
  - Form-associated through `ElementInternals`, defaulting to `type="button"`.
  - Pressing Enter in a field only submits through a native submit button, so the fields in #9 will submit their form themselves.
- **Icon button:** 44px targets, up from the prototype's 36px.
- **Link:** a link that opens a new tab says “(opens in a new tab)” as part of its text, so everyone knows, screen reader users included.
- **Continue with Atmosphere:**
  - Its label comes from the catalogue, so apps can't change it.
  - It wraps onto two lines in long languages, instead of overflowing as the prototype's would.
- **Motion through tokens:** even the busy spinner's speed comes from a duration token, so reduced motion stops it, whether the system or the Storybook toolbar asks.
- **The Example chip is gone:** the Actions components document themselves with the real template.

### User input

Settled while building it ([#9](https://github.com/renderghost/doras/issues/9)):

- **Fields draw their own label, hint and message:** labels and `aria-describedby` can't reach across a shadow root, so each field keeps them beside its input.
- **The app validates; fields show the result:**
  - Setting a field's `error` marks it invalid, with “Error:” read before the message.
  - Fields don't use the browser's own validation bubbles. `required` is announced, and the app checks it.
  - On submit, the app sets errors. Afterwards it re-checks a field with an error on `doras-input`, so the error clears as soon as it's fixed.
- **Input methods:** `doras-input` waits until text being composed with an input method has finished. So live validation never sees half-typed Japanese.
- **Enter submits:** pressing Enter in a field submits its form, even with a Doras button as the submit button. This closes the gap noted in #8.
- **Handle field:**
  - An ARIA 1.2 combobox with a listbox of suggestions.
  - The app looks accounts up when it hears `doras-query`. The field never calls the network.
  - `readHandle` reads what people type forgivingly:
    - a leading @
    - email-style handles, such as sam@bsky.social
    - profile links
    - common slips, such as bsky.app for bsky.social
  - After someone leaves the field, it says in the automated style how it read what they typed.
  - The providers' endings and slips are defaults an app can replace.
- **Password field:**
  - The show button's name changes between “Show password” and “Hide password”, without `aria-pressed`: using both confuses screen readers.
  - `purpose` sets `current-password webauthn` or `new-password`, so password managers and passkeys work.
- **Code field:** one input with `one-time-code`, never a box per digit. It submits the digits alone, however they were typed or pasted, and always reads left to right.
- **Radio cards:**
  - Native radios inside one shadow root, so grouping, arrow keys and forms are the browser's own.
  - Nothing is chosen until someone chooses.
- **Switch:** named by its label alone. Its description is a description. The story tests caught it including both.
- **List props:** the spec schema gained a `list` prop type, for the handle field's suggestions and the radio cards' options. Storybook never shows raw JSON for them.

### Display

Settled while building it ([#10](https://github.com/renderghost/doras/issues/10)):

- **One icon list:** the Lucide icons Doras uses live in `@doras/components`. The Icon component and the Icons page both read it, and each icon is imported by name, so only these reach a bundle.
- **Mirroring:** icons that point a direction mirror with `:dir(rtl)`, which follows the page's direction with no extra attribute.
- **Divider:** the “or” version is plain text between decorative lines, because a separator's own text isn't read.
- **Codes:** shown grouped and left to right. Screen readers get the digits spaced (“4 8 2 9 1 3”), so they're read one by one, not as a number.
- **Roles checkers can see:** a permission item sets `role="listitem"` as an attribute. Browsers understand a role set through `ElementInternals`, but axe and Testing Library don't yet.

### Identity

Settled while building it ([#11](https://github.com/renderghost/doras/issues/11)):

- **Initials in any script:** taken as whole graphemes from the first and last words, so emoji, accents, Japanese and Arabic names come out whole.
- **Neutral avatars:** the prototype tinted avatars with the feedback colours. Doras uses neutral ones, so no avatar looks like an error.
- **Provider logos aren't drawn or guessed:**
  - Each provider is listed in `providers.ts` with its logo file, the logo's source and who gave permission.
  - No logo has a recorded permission yet, so badges show a plain initial.
  - An address someone typed shows a globe.
  - A logo can be swapped or removed by editing one entry.
- **The link badge stays centred:** it's centred with `inset: 0; margin: auto`, not a transform, so it stays exactly on the seam in right-to-left layouts too. A test measures it.
- **Handles break after their dots,** then anywhere, and are never cut short with an ellipsis.

### System feedback

Settled while building it ([#12](https://github.com/renderghost/doras/issues/12)):

- **One announcer for the page:**
  - `announce()` adds each message to a shared pair of live regions, polite and assertive, so several messages at once are all read in order.
  - The regions are created once. A brand-new region isn't watched yet, so the first message waits a moment.
  - The Button, Toast and Busy state announce through it.
- **The four failures have locked copy,** written for #12 and awaiting review:
  - They never blame the person or the app, and never say whether an account exists.
  - Too many attempts gives a clear wait.
  - Network failure says what was typed is kept.
  - A failure notice sends `doras.failure_shown` once.
- **Error summary:** `show(errors)` fills it and moves focus to it, for use on submit. Updating `errors` as people fix them doesn't move focus. Each link moves focus to its field.
- **Toasts have no timer:** they stay until closed, because no time limits (WCAG 2.2.3, AAA) was chosen in #1.
- **Every icon a component names is checked** against the icon list. Testing found the error icon missing: it drew nothing, silently.

### Navigation

Settled while building it ([#13](https://github.com/renderghost/doras/issues/13)):

- **The sheet header only reports:** it sends `doras-back` and `doras-close`. Moving between steps, focusing each new step's heading, Escape and returning focus to the opener belong to the app and the Sheet (#14).
- **Skip link:** it moves focus, not just the scroll position, to the main content, so the next Tab continues from there.
- **Provider link:**
  - It always names the provider: “Manage account on Bluesky”.
  - It opens a new tab and says so. `sameTab` turns that off. Boolean props are off by default, so “same tab” is the prop, not “new tab”.
- **Step links are buttons:** “Search by name instead” changes the step, not the page, so it's announced as a button. A back arrow mirrors right to left.

### Containers

Settled while building it ([#14](https://github.com/renderghost/doras/issues/14)):

- **Native dialogs:** the Sheet and the Dialog are `<dialog>` elements opened with `showModal()`. The browser moves focus in, keeps it there, makes the page behind inert, closes on Escape and returns focus to the opener. Doras adds nothing to that.
- **The Sheet:**
  - It counts `doras.door_opened` when it opens.
  - It closes itself when its header's close button is pressed. Consumers hear `doras-close` once, from the Sheet, when it has actually closed, however it was closed.
  - Centred on large screens, a bottom sheet below 600px. The header and foot stay put; the body scrolls.
  - A body that scrolls takes keyboard focus, so it can be scrolled without a mouse. A body that fits doesn't, so there's no empty Tab stop.
- **The Dialog** is an `alertdialog`, named by its heading and described by its body. It's for questions that need an answer, such as “Remove this passkey?”. Focus starts on the first action, so put the safe one first.
- **The provider page shell:** banner, main and footer landmarks. The skip link opens the banner, so it's the first Tab stop and inside a landmark. The footer says the app never sees the password.
- **Details** is the native `<details>`, so it works with the keyboard and screen readers without script.

### Fonts, icons and motion

- **Fonts and icons:** Inter, loaded from Google Fonts, and Lucide icons.
- **Motion:** minimal and purposeful, and off when the system asks for reduced motion.

**Why:** these match the prototype. Google Fonts was chosen knowingly despite its privacy cost in the EU (see the README).

## Scope

### What's built

- **Front Door's sheets:** finding the account, the existing-account check, choosing a provider and recovery.
- **Reference provider pages:** sign-in, sign-up, codes and the passkey offer.
- **The Connect page.**
- **The recovery and welcome emails.**
- **The Continue with Atmosphere button,** always.

### Browser mocks, for Storybook only

Look-alikes of the browser's own UI let flows be clicked through:

- the account chooser
- passkey prompts
- autofill suggestions

They live in a package that is never published and that production code can't depend on.

**Why:** the browser draws these for real, but the flows don't make sense without them.

Settled while building them ([#15](https://github.com/renderghost/doras/issues/15)):

- **Kept out of production three ways:**
  - Every production package's build runs `scripts/check-no-mocks.ts` first, and fails if anything imports `@doras/browser-mocks` or a path into it.
  - ESLint flags the same import in an editor.
  - A workspace test fails if any package but Storybook depends on the mocks.
- **They look like the browser, not Doras:** the system font and plain, compact controls, with a “Drawn by the browser” tag on each. Colours come from the tokens, so they stay readable in every theme and in forced colours.
- **English, left to right:** the browser speaks its own language, not the app's, so on an Arabic page a browser set to English still draws its UI in English, left to right. None of this ships.
- **No specs:** specs describe what ships. Each mock's docs page says instead which browser API shows it, with the call to make.
- **Events stand in for the browser's answer:**
  - `doras-mock-pick`, `doras-mock-other` and `doras-mock-dismiss` from the account chooser.
  - `doras-mock-passkey` and `doras-mock-cancel` from the passkey prompt. A cancel carries `NotAllowedError`, as the page's call would reject.
  - `doras-mock-autofill` from autofill.
  - The flows (#16) listen for these.
- **The QR code is a picture of one,** never a real code, so nothing can scan it.

### Potluck and providers in stories

Potluck is the default sample app, shown as a backdrop, not built as components. Providers use their real names and logos, kept as swappable files with their source and permission recorded.

### Measurement events

Key sign-in moments are announced under shared, documented names, such as "account found" or "passkey added", that apps can count. The library never sends data anywhere.

**Why:** if every app measures the same steps the same way, the Atmosphere community can compare sign-in across apps and improve it together.

### Flows can be clicked through

Every journey can be clicked from start to finish in Storybook, with switches for four failure states:

- network failure
- too many attempts
- session expired
- provider unavailable

Settled while building them ([#16](https://github.com/renderghost/doras/issues/16)):

- **Pages are compositions in Storybook, not a package:** templates and pages are built from Doras components in `apps/storybook/src/flows`. Their copy is Doras's, so it lives in the catalogues and is translated: Front Door's steps, the reference provider pages and the Connect page.
- **The app's copy stays the app's:** Potluck's page and its permissions, in its own words, are sample data in English. An app supplies its own.
- **One harness:** a Storybook-only element plays the app, Front Door, the browser and the provider, so every page can also open on its own with what the steps before it would have set.
- **The switches:**
  - **Failures** fail the next submit on a step they fit, once, keeping what was typed.
  - **Session expired** starts again from “Is this you?”, with the account still there.
  - **Too many attempts** never says whether an account exists.
  - **Passkey variations:** a passkey on this device, one only on a lost phone, verification codes, or passkey only.
- **Focus moves to each new step's heading,** so screen readers start at the top of the step.
- **Every journey is a test:** each walks end to end and checks the measurement events it sends, in order.
- **Apps can host accounts:** the provider page shell's `appHosted` covers an app that hosts accounts itself. Its footer says the account works in every Atmosphere app, whoever hosts it.
- **The sheet header is not a landmark:** inside the sheet's dialog, a `<header>` was a second banner next to the app's own.

## Quality

### Accessibility: WCAG 2.2 AA plus key AAA criteria

AA everywhere, which is the European Accessibility Act baseline. Plus these AAA criteria:

- **Target size (2.5.5):** 44px targets.
- **Focus appearance (2.4.13):** enhanced.
- **No timing (2.2.3):** no time limits.
- **Contrast (1.4.6):** 7:1 in the increased-contrast theme.

### Forms

- **Validation:** on submit, then live as people fix errors.
- **Buttons:** submit buttons are never disabled. They explain what's missing when pressed.
- **Errors:** pages with more than one field show an error summary that takes focus, plus inline messages.

**Why:** these are the least stressful patterns, especially for people using screen readers.

### Localisation

- **Strings:** in ICU MessageFormat, with UK English as the source.
- **Copy is locked:** apps choose the locale but can't rewrite strings.
- **Test locales:**
  - pseudo-locale
  - Arabic (right to left)
  - German
  - Japanese

**Why:** ICU strings can be shared with iOS and Android later. Locked copy means people learn the words once and meet them in every app.

Details settled while building it ([#6](https://github.com/renderghost/doras/issues/6)):

- **Catalogues:**
  - The source, `en-GB.json`, gives each message a description for translators.
  - Translations are flat, and marked `"status": "test"` until reviewed.
  - The pseudo-locale is generated from the source, so it's never out of date. Its tag is `en-XA`.
- **Formatting:** FormatJS's `intl-messageformat`. A Lit controller gives components the locale of the nearest `lang` attribute, looking out through shadow roots, and re-renders them if it changes.
- **Isolation:** text values in a sentence are wrapped in Unicode's isolate characters, not `<bdi>` elements. They do the same job, and also work inside attributes like `aria-label` and in plain-text emails. Components that show a handle or code on its own still use `<bdi>`.
- **What the build checks:**
  - every message parses
  - every locale has every key, with the same placeholders
  - every plural has its locale's plural forms
  - “Atmosphere” is never translated
  - no UK English string uses a naughty-list word
- **Naughty list:** only the list is in the repo (`packages/i18n/naughty-list.json`): each word, the forms to match, and what to use instead. The rest of the glossary stays internal.
- **Logical CSS:** Stylelint's own disallowed-property rules enforce it, in CSS files and Lit `css` templates. The logical-CSS plugins don't support Stylelint 18 yet.
- **Strings arrive with components:** #6 holds the shared strings from the prototype. Each component phase adds its own strings, with test translations.

### Browsers

- Last 2 versions of Chrome, Edge, Firefox and Samsung Internet.
- Safari and iOS Safari from 16.4.

### Testing

- Interaction tests and axe checks on every story.
- Playwright screenshots for visual regression, on the key combinations of theme, locale and screen width. Chromatic isn't used.

## Storybook

- **Hosting:** Storybook 10, on GitHub Pages.
- **Sidebar:** grouped by behaviour, not by atomic level:
  - Foundations
  - Actions
  - User input
  - Display
  - Identity
  - System feedback
  - Navigation
  - Containers
  - Browser mocks
  - Emails
  - Flows

  New groups can be added when a component fits none of these.

- **Not shown:** atomic levels and maturity badges. Atomic design is how components are built, not how they're filed.
- **Addons:**
  - Docs, accessibility and Vitest
  - Viewports, backgrounds, measure and outline
  - Controls
  - Toolbars for theme, locale and text direction
  - Figma embeds, pseudo-states and token tables
- **Docs for every component:**
  - overview
  - when to use it and when not to
  - anatomy
  - states
  - props and events
  - accessibility
  - tokens
  - content guidelines
  - do and don't
  - evidence and decisions

Details settled while building it ([#5](https://github.com/renderghost/doras/issues/5)):

- **Toolbars:**
  - **Theme:** follow the system, or force any of the four themes from #3.
  - **Locale:** the five test locales. The pseudo-locale uses the tag `en-XA`, the usual private-use tag for one.
  - **Direction:** from the locale by default (Arabic is right to left), or forced either way.
  - **Motion:** follow the system, or reduce it. The tokens gained `data-doras-motion="reduce"` for this. "Off" never overrides someone's system setting.
- **Where settings apply:** on its own page, a story sets them on the whole document, as an app would. In docs, each story gets them on its own wrapper, so a docs page can't flip into right to left.
- **Docs pages:** a template renders the ten sections from a component's spec. Until #7 defines the spec format, the spec's shape is a provisional TypeScript type. A sample component, the Example chip under Contributing, shows the template working; it's removed when the button's docs arrive.
- **Story tests:** every story runs in Chromium through Vitest, with axe failures as errors. Play functions query through shadow DOM with `shadow-dom-testing-library`, and never by names that change with the locale.
- **Foundations pages** are generated from `tokens.json`, and draw each sample with the real custom properties inside each theme, so they check the CSS as well as showing it.
- **Icons:** the Icons page lists the Lucide icons the prototype uses, and which mirror right to left. The Icon component (#10) settles the final set.

## Process and packaging

- **Repository:** a public pnpm monorepo, dual-licensed MIT or Apache 2.0, like the atproto code it sits alongside.
- **Packages:** named `@doras/…`. They're versioned with Changesets but unpublished until the public name and owner are agreed.
- **Workflow:** issues first. Each phase is a sub-issue of #1, closed by its own pull request.
