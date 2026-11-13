# Contributing to Doras

Thanks for helping. This guide covers how work is organised, the conventions every package follows, and the checklist a component must pass before it's done.

## How work is organised

- Every piece of work has an issue, and each phase of the build is a sub-issue of the epic, [#1](https://github.com/renderghost/doras/issues/1).
- One pull request closes one issue. Say which in the description, for example "Closes #8".
- Record user-facing changes with `pnpm changeset`. Repo-only changes, such as CI or docs, don't need one.
- CI must be green before merging: formatting, lint, type-check and tests.

## Setting up

```sh
corepack enable
pnpm install
```

Use Node 22 or 24 (see `.nvmrc`) and pnpm 10.

Then `pnpm build` once, so the tokens exist: Storybook and its type-check read them. Run `pnpm storybook` to work in Storybook.

### Story tests

Every story is also a test: Vitest runs it in a browser, runs its play function, and fails on any accessibility violation axe finds. `pnpm test` runs them with the unit tests; `pnpm test:stories` runs only them.

They need Playwright's Chromium. Install it once with `pnpm --filter @doras/storybook exec playwright install chromium`, or point `CHROMIUM_PATH` at a Chromium you already have.

Components draw into their shadow DOM, which Testing Library's usual queries can't see. Use `shadow-dom-testing-library` in play functions, for example `findByShadowRole`. Don't query by visible names that change with the locale.

Testing Library's simulated Tab can't enter shadow roots either. To test the keyboard, focus the component, check focus reached its control through `shadowRoot.activeElement`, then press keys. The Actions stories' `focusInside` helper does this.

### Other browsers

CI also runs the story tests in Firefox and WebKit. To run them yourself, set `DORAS_BROWSERS`, for example `DORAS_BROWSERS=firefox pnpm test:stories`, after installing that browser with `pnpm --filter @doras/storybook exec playwright install firefox`.

### Visual checks

CI compares screenshots of every story, and of every flow page in dark, increased contrast, Arabic and the pseudo-locale, with the baselines in `apps/storybook/visual/baselines`. If a change is meant to look different:

1. Build: `pnpm build`.
2. Check what changed: `pnpm visual`. It runs in Docker, in the Playwright image CI uses, because screenshots from other machines don't match. The report is in `apps/storybook/visual-report`.
3. When every change is intended, make new baselines: `pnpm visual:update`.
4. Look at the new images, and commit them with the change.

Without Docker, run the **Update visual baselines** workflow on your branch from the Actions tab, and commit the baselines it uploads.

### Accessibility audit

CI also runs an audit on every story in the built Storybook: axe in all four themes, 44px targets, focus appearance, reflow at 320px, text spacing, reduced motion, and pasting and autofill in every field. It also completes each journey by keyboard alone. To run it yourself, `pnpm build`, then `pnpm a11y`. It needs Playwright's Chromium, as the story tests do.

Screen readers are tested by hand. [docs/screen-reader-testing.md](docs/screen-reader-testing.md) says how, and how to record the result in the component's spec so its docs page shows it.

## Conventions

- **Names:** custom elements are `<doras-…>`, for example `<doras-button>`. Packages are `@doras/…`.
- **Copy:** UK English, plain and short. Strings live in the message catalogues (`@doras/i18n`), never in component code: see its README for adding one. The glossary's naughty-list words, such as PDS, DID or "log in", never appear in copy, and the build fails if they do.
- **Tokens:** components use semantic tokens only, never primitives or raw values.
- **CSS:** logical properties only, such as `margin-inline-start`, so layouts mirror for right-to-left languages. Stylelint rejects physical ones, in CSS files and in Lit's `css` templates.
- **Logic:** components draw the interface and send events. They never call the network, OAuth or WebAuthn themselves.
- **Browser mocks** live in `@doras/browser-mocks`, which only Storybook may depend on. A test enforces this.
- **Licence:** every package is `MIT OR Apache-2.0` and stays `private` until the public name and owner are agreed. A test enforces this too.

## Component checklist

A component is done when it has all of these:

- [ ] **Spec:** a platform-neutral spec in `packages/specs/src/components`, valid against the schema. The build checks its tokens, strings and measurement events exist. Its Lit class implements the props type generated from it.
- [ ] **Build:** a Lit implementation that uses semantic tokens only, with logical CSS properties.
- [ ] **Strings:** every string in the message catalogues, nothing hard-coded.
- [ ] **Stories:** every state, with Controls generated from the spec (`argTypesFromSpec`), and `parameters.doras.spec` set so its docs page is generated.
- [ ] **Docs:** every section of the docs template:
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
- [ ] **Tests:** interaction tests for its behaviour, and keyboard tests.
- [ ] **Accessibility:** no axe violations, and the accessibility audit passes. It meets WCAG 2.2 AA and the key AAA criteria listed in [docs/decisions.md](docs/decisions.md).
- [ ] **Screen readers:** tested by hand with each setup in [docs/screen-reader-testing.md](docs/screen-reader-testing.md), with the results in its spec.
- [ ] **Themes:** checked in light, dark, increased contrast and Windows forced colours.
- [ ] **Locales:** checked in UK English, the pseudo-locale, Arabic (right to left), German and Japanese.
- [ ] **Zoom and motion:** checked at 400% zoom, and with reduced motion.
- [ ] **Buttons and forms:** no disabled submit buttons. Forms validate on submit, then live.

## Reporting problems

Open an issue that says what you expected, what happened, and how to see it. For accessibility problems, include the browser and any assistive technology you used.
