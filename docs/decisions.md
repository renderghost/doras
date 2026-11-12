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

## Process and packaging

- **Repository:** a public pnpm monorepo, dual-licensed MIT or Apache 2.0, like the atproto code it sits alongside.
- **Packages:** named `@doras/…`. They're versioned with Changesets but unpublished until the public name and owner are agreed.
- **Workflow:** issues first. Each phase is a sub-issue of #1, closed by its own pull request.
