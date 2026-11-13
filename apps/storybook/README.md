# @doras/storybook

The Doras documentation site, built with Storybook 10 and published to [renderghost.github.io/doras](https://renderghost.github.io/doras/) on every merge to `main`.

## Running it

```sh
pnpm build        # once, from the repo root, so the tokens exist
pnpm storybook    # Storybook at localhost:6006
```

## What's in it

- **Sidebar:** grouped by behaviour (Foundations, Actions, User input and so on), each group with an overview page. The order is in `.storybook/preview.ts`.
- **Toolbars:** theme, locale, text direction and reduced motion. `.storybook/settings.ts` defines them, and a decorator applies them to every story.
- **Themes:** Light, Dark, and each with high contrast. Storybook's own interface follows the theme as well as the stories: `.storybook/ui-themes.ts` builds the sidebar, toolbar and panel colours from the tokens, `manager.ts` switches them, and `src/docs/DocsContainer.tsx` does the same for docs pages. There's no Follow system option, since the interface needs a definite theme.
- **Foundations:** colour, type, spacing and size, motion, icons, and every token. The pages are generated from `@doras/tokens/tokens.json`.
- **Docs pages:** `src/docs/DocsPage.tsx` renders every section from a component's spec, set as `parameters.doras.spec` on its stories. The Example chip, under Contributing, shows it working.
- **Addons:** Docs, accessibility, Vitest, Figma embeds (`@storybook/addon-designs`) and pseudo-states. Viewports, measure, outline and Controls are built into Storybook. The background switcher is off: each theme sets its own surface.

## Story tests

Every story runs as a Vitest browser test: its play function, then an axe check that fails on any violation. See [CONTRIBUTING.md](../../CONTRIBUTING.md#story-tests).

## Figma embeds

To show a component's Figma design beside its story, set `parameters.design` to `{ type: 'figma', url: '…' }`.
