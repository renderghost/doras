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

Every story is also a test: Vitest runs it in Chromium, runs its play function, and fails on any accessibility violation axe finds. `pnpm test` runs them with the unit tests; `pnpm test:stories` runs only them.

They need Playwright's Chromium. Install it once with `pnpm --filter @doras/storybook exec playwright install chromium`, or point `CHROMIUM_PATH` at a Chromium you already have.

Components draw into their shadow DOM, which Testing Library's usual queries can't see. Use `shadow-dom-testing-library` in play functions, for example `findByShadowRole`. Don't query by visible names that change with the locale.

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
- [ ] **Accessibility:** no axe violations. It meets WCAG 2.2 AA and the key AAA criteria listed in [docs/decisions.md](docs/decisions.md).
- [ ] **Themes:** checked in light, dark, increased contrast and Windows forced colours.
- [ ] **Locales:** checked in UK English, the pseudo-locale, Arabic (right to left), German and Japanese.
- [ ] **Zoom and motion:** checked at 400% zoom, and with reduced motion.
- [ ] **Buttons and forms:** no disabled submit buttons. Forms validate on submit, then live.

## Reporting problems

Open an issue that says what you expected, what happened, and how to see it. For accessibility problems, include the browser and any assistive technology you used.
