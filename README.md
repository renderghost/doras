# Doras

Doras (Irish for "door") is the design system for creating an Atmosphere account and signing in with one. It holds the design tokens, Web Components, flows and emails, all documented in Storybook.

It grows out of the Front Door prototype at [renderghost/at-frontdoor](https://github.com/renderghost/at-frontdoor). The plan is in the epic, [#1](https://github.com/renderghost/doras/issues/1). The decisions behind it are in [docs/decisions.md](docs/decisions.md).

Doras is at an early stage: the tokens, the Figma sync, Storybook, the string catalogues, the spec format and the first components (Actions) are built, and nothing is published to npm yet. Storybook is published at [renderghost.github.io/doras](https://renderghost.github.io/doras/).

## Packages

| Package                                          | What it holds                                                           | Issue                                                                                                        |
| ------------------------------------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| [`@doras/tokens`](packages/tokens)               | Design tokens in the DTCG format, built for CSS, Swift and Kotlin       | [#3](https://github.com/renderghost/doras/issues/3)                                                          |
| [`@doras/specs`](packages/specs)                 | Platform-neutral component specs and measurement events                 | [#7](https://github.com/renderghost/doras/issues/7)                                                          |
| [`@doras/components`](packages/components)       | The `<doras-…>` Web Components, built with Lit                          | [#8](https://github.com/renderghost/doras/issues/8) to [#14](https://github.com/renderghost/doras/issues/14) |
| [`@doras/i18n`](packages/i18n)                   | ICU message catalogues and test locales                                 | [#6](https://github.com/renderghost/doras/issues/6)                                                          |
| [`@doras/emails`](packages/emails)               | Recovery and welcome emails, in MJML                                    | [#17](https://github.com/renderghost/doras/issues/17)                                                        |
| [`@doras/figma-sync`](packages/figma-sync)       | Syncs the tokens into Figma as variables, text styles and effect styles | [#4](https://github.com/renderghost/doras/issues/4)                                                          |
| [`@doras/browser-mocks`](packages/browser-mocks) | Look-alikes of the browser's own UI, for Storybook only                 | [#15](https://github.com/renderghost/doras/issues/15)                                                        |
| [`@doras/storybook`](apps/storybook)             | The documentation site                                                  | [#5](https://github.com/renderghost/doras/issues/5)                                                          |

## Getting started

You need Node 22 or 24, and pnpm 10. Corepack can install the right pnpm version for you:

```sh
corepack enable
pnpm install
```

| Command          | What it does                                                       |
| ---------------- | ------------------------------------------------------------------ |
| `pnpm build`     | Builds every package that has a build, and Storybook               |
| `pnpm lint`      | ESLint for TypeScript and Lit, and Stylelint for CSS               |
| `pnpm typecheck` | TypeScript in strict mode                                          |
| `pnpm test`      | Vitest: the unit tests, and every story as a browser test          |
| `pnpm storybook` | Runs Storybook at localhost:6006                                   |
| `pnpm format`    | Formats everything with Prettier (`pnpm format:check` only checks) |
| `pnpm changeset` | Records a change for the next release                              |

CI runs the same checks on every pull request. [CONTRIBUTING.md](CONTRIBUTING.md) explains how to work on Doras.

## Things to know

- **Fonts:** components use Inter, loaded from Google Fonts. Loading fonts from Google sends each visitor's IP address to Google, and EU sites have been fined for it. Apps with strict privacy needs can host Inter themselves; the tokens name the font, not where it comes from.
- **Provider logos:** stories show providers' real logos. Each logo is a separate file with its source and permission recorded, so it can be swapped or removed if a provider asks.

## Licence

Dual-licensed under [MIT](LICENSE-MIT) or [Apache 2.0](LICENSE-APACHE), at your option. See [LICENSE](LICENSE).
