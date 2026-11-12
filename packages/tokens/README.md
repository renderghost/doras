# @doras/tokens

The design tokens for Doras, written in the [DTCG 2025.10 format](https://www.designtokens.org/tr/2025.10/format/). They're the single source of every colour, space, size, type style, shadow and motion value, built for the web, iOS and Android.

## How they're organised

### Three tiers

| Tier      | Path starts with             | What it's for                                                                | Who uses it                                                     |
| --------- | ---------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Primitive | `primitive.`                 | Raw values, such as `primitive.color.accent.200` or `primitive.dimension.16` | Only other tokens. Primitives never reach CSS, Swift or Kotlin. |
| Semantic  | `color.`, `space.`, `type.`… | What a value is for, such as `color.text.error` or `space.inset.md`          | Components                                                      |
| Component | `component.`                 | Only where a component must differ, such as `component.atmosphere-button.*`  | That component                                                  |

### Four themes

Colours and shadows change with the theme. Everything else is the same in every theme.

| Theme               | Built from                                      | Chosen when                       |
| ------------------- | ----------------------------------------------- | --------------------------------- |
| `light`             | `theme/light`                                   | By default                        |
| `dark`              | `theme/dark`                                    | The system is set to dark         |
| `lightHighContrast` | `theme/light`, then `theme/light-high-contrast` | The system asks for more contrast |
| `darkHighContrast`  | `theme/dark`, then `theme/dark-high-contrast`   | Both                              |

The themes are declared in [`src/doras.resolver.json`](src/doras.resolver.json), a [DTCG Resolver](https://www.designtokens.org/tr/2025.10/resolver/) document. The high-contrast files override only what changes.

### Contrast

Tests check every pairing the components use, in every theme:

- **Text:** at least 4.5:1, and at least 7:1 in the high-contrast themes (WCAG 1.4.3 and 1.4.6).
- **Field edges, focus rings and meaningful icons:** at least 3:1 (WCAG 1.4.11).

## Using them

### On the web

```css
@import '@doras/tokens/css';

.notice {
  padding: var(--doras-space-inset-md);
  border: var(--doras-border-width-default) solid var(--doras-color-feedback-info-border);
  background: var(--doras-color-feedback-info-surface);
  color: var(--doras-color-feedback-info-text);
  font-size: var(--doras-type-body-sm-font-size);
}
```

- **Names:** `--doras-` followed by the token's path, so `color.text.error` becomes `--doras-color-text-error`. Component tokens drop `component`, so `component.atmosphere-button.surface` becomes `--doras-atmosphere-button-surface`.
- **Type styles:** each one becomes five properties: `-font-family`, `-font-size`, `-font-weight`, `-line-height` and `-letter-spacing`.
- **Units:** dimensions are in rem, so they grow when people make text bigger. Border widths and the focus ring stay in px, so they stay crisp.
- **Themes:** the system's dark and contrast settings choose the theme automatically. To force one on any element and everything inside it, use `data-doras-theme="light"`, `"dark"`, `"light-high-contrast"` or `"dark-high-contrast"`.
- **Windows forced colours:** every semantic colour becomes a system colour, such as `CanvasText` or `Highlight`, and shadows are removed. Use `outline` for focus, not `box-shadow`, which forced colours hide.
- **Reduced motion:** every duration becomes `0ms`.

From JavaScript or TypeScript:

```ts
import { cssVar, type DorasToken } from '@doras/tokens';

cssVar('color.text.error'); // 'var(--doras-color-text-error)'
```

### On iOS

Use `dist/swift/DorasTokens.swift` and `dist/swift/DorasTokens+SwiftUI.swift`.

- Dimensions are in points.
- Colours have a value for each theme.

```swift
let theme = DorasTheme(colorScheme: colorScheme, contrast: colorSchemeContrast)
Text("Hello").foregroundStyle(DorasTokens.Colors.textDefault.color(theme))
```

### On Android

Use `dist/kotlin/…/DorasTokens.kt` and `compose/DorasTokensCompose.kt`.

- Dimensions are in dp, and type sizes in sp.

```kotlin
val theme = dorasTheme(isDark = isSystemInDarkTheme(), highContrast = highContrast)
Text("Hello", color = DorasTokens.Colors.textDefault.color(theme))
```

The core Swift and Kotlin files have no dependencies. CI compiles them on every pull request. The SwiftUI and Compose helpers need those frameworks, so CI doesn't compile them yet.

### For docs and Figma

`dist/tokens.json` lists every token for documentation and the Figma sync. For each token it gives:

- its tier, type and description
- its CSS custom property
- its forced-colours system colour
- its value, CSS and reference in each theme

## Building and testing

```sh
pnpm --filter @doras/tokens build   # writes dist/
pnpm test                           # from the repo root
```

The tests check that:

- every file is valid against the official DTCG schemas (copied into [`schemas/`](schemas))
- the tiers follow the rules above
- every theme has every token
- every contrast pairing passes
- the outputs are complete

## Adding or changing a token

1. Add a primitive only if no existing one fits.
2. Add the semantic token in `src/semantic/` if it's the same in every theme. If it's a colour or a shadow, add it in every theme file in `src/theme/`. Give it a `$description` saying what it's for.
3. For a new semantic colour, give the light theme's token an `org.doras` `forcedColor` extension naming its system colour. A test fails without one.
4. If it's a text or edge colour, add its pairings to `test/contrast.test.ts`.
5. Run `pnpm test`, and record the change with `pnpm changeset`.
