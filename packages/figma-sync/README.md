# @doras/figma-sync

Syncs the Doras tokens into a Figma library file, as variables, text styles and effect styles. Sync goes one way: the DTCG files in [`@doras/tokens`](../tokens) are the source of truth, and Figma follows them.

## What it makes in Figma

| Collection | Modes                                                | What's in it                                                                                   |
| ---------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Primitives | Value                                                | Raw values. Hidden from publishing and from every picker: designers use the collections below. |
| Theme      | Light, Light high contrast, Dark, Dark high contrast | Semantic colours, and the colours of each shadow layer                                         |
| Scale      | Value                                                | Space, size, radius, border width, focus and breakpoints                                       |
| Typography | Value                                                | Each type style's family, size, weight, line height and letter spacing                         |
| Motion     | Value                                                | Durations and easing curves, for reference in Dev Mode                                         |
| Components | Value                                                | Component tokens, such as the Continue with Atmosphere button                                  |

Every variable has:

- **Its name from the token's path**, so `color.text.default` becomes `color/text/default`.
- **Its description from the token.**
- **Scopes**, so it only appears in the right pickers. Text colours appear only for text, and spacing only for gaps and padding.
- **Code syntax for web, iOS and Android**, so Dev Mode shows `var(--doras-color-text-default)` and `DorasTokens.Colors.textDefault`.

Semantic variables are aliases of primitives, and component variables are aliases of semantic ones, so the chain shows in Figma just as it does in code.

**Styles:**

- **Text styles**, such as `type/body/md`, are bound to the Typography variables. Figma has no font weights between its named styles, so 650 uses Semi Bold and 750 uses Bold. Codes use Roboto Mono, because Figma doesn't have the system monospace fonts.
- **Effect styles**, `shadow/raised` and `shadow/overlay`, have each layer's colour bound to a Theme variable, so shadows change with the mode.

## Running it

```sh
pnpm build   # builds @doras/tokens, then this package
```

### As a Figma plugin (for designers)

1. Run `pnpm build` from the repo root.
2. In the Figma desktop app, open the Doras library file.
3. Go to **Plugins → Development → Import plugin from manifest…** and choose `packages/figma-sync/manifest.json`. This step is only needed the first time.
4. Run **Plugins → Development → Doras token sync**. It reports what it created and updated when it finishes.

### Through the Figma MCP server (for agents)

`use_figma` takes scripts of up to 50,000 characters, and the whole plan is bigger than that. So the plan and the sync code travel into the file as text inside two SVGs, and a short loader runs them:

1. Run `pnpm build`.
2. With `use_figma`, create a page named `_doras-sync`.
3. With `upload_assets`, get two upload URLs for that page. Post `dist/carrier/doras-applier.svg` and `dist/carrier/doras-plan.svg` to them as `image/svg+xml`.
4. Run `dist/use-figma-loader.js` with `use_figma`. It returns a report of what it created and updated.
5. Run `dist/use-figma-verify.js` with `use_figma`. It's read-only, and checks every variable, mode, alias, scope, code syntax, description and style binding against the plan. It returns `ok: true` and an empty `problems` list when the file matches.
6. Run the loader again with `REMOVE_CARRIERS = true`. This also proves the sync updates in place: it should create nothing. It then deletes the `_doras-sync` page.

If uploading isn't possible, run the files in `dist/use-figma/` in order instead. Each syncs one collection, and each is under the size limit.

## Running it again

The sync finds everything by name, so running it again updates the values, aliases, scopes, descriptions and code syntax in place.

- **Links stay intact:** anything bound to a variable stays bound.
- **Nothing is deleted:** if a token is removed, its variable stays in Figma and the report lists it, so you can check nothing uses it before deleting it by hand.
- **Type changes are refused:** if a token changes type, for example from a number to a colour, the sync stops with a message, because Figma can't change a variable's type.

The Theme collection needs 4 modes, which Figma's Professional plan allows. On the Starter plan, the sync stops and says so.

## What designers may change in Figma

- **Use:** every variable and style.
- **Don't edit:** variable values, names, aliases, scopes or descriptions, or the text and effect styles. The next sync overwrites them. To change a value, change the token in `@doras/tokens` and open a pull request.
- **Do add:** anything new, such as components, pages and documentation. The sync only touches the collections and styles it makes.
