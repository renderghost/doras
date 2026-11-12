# @doras/specs

One platform-neutral spec per component, the JSON Schema they follow, and the measurement events list. The web components implement the specs, Storybook's docs pages and Controls are generated from them, and mobile apps can build from them later.

## What's in it

- `schema/component.schema.json`: the spec format (JSON Schema 2020-12). Everything outside `platforms` applies to every platform.
- `src/components/*.spec.json`: one spec per component. The button's is the worked example.
- `schema/measurement-events.schema.json` and `src/measurement-events.json`: the shared names for sign-in moments that apps can count.

## A spec's sections

| Section                              | What it holds                                                  |
| ------------------------------------ | -------------------------------------------------------------- |
| `name`, `group`                      | What people call it, and its behaviour group in the sidebar    |
| `summary`                            | What it is and what it's for                                   |
| `usage`                              | When to use it, and when not to (and what to use instead)      |
| `anatomy`                            | Its named parts                                                |
| `props`                              | What apps can set: type, allowed values and default            |
| `states`                             | Default, hover, focus, busy and so on                          |
| `events`                             | UI events, and the measurement events it announces             |
| `accessibility`                      | Role, accessible name, keyboard, screen readers, announcements |
| `tokens`                             | The semantic or component tokens it uses                       |
| `strings`                            | The catalogue keys of the strings it shows                     |
| `related`                            | Other components, and how they relate                          |
| `content`, `dosAndDonts`, `evidence` | Docs: content guidelines, do and don't, and why                |
| `platforms.web`                      | The tag, slots, and whether it's form-associated               |

## What the build checks

`pnpm build` stops if:

- a spec or the measurement list doesn't match its schema
- a spec uses a token that doesn't exist, or a primitive
- a spec uses a string that isn't in the catalogue
- a spec announces a measurement event that isn't in the list
- an enum prop's default isn't one of its values, or two props share a name
- two components share a tag

The schema also keeps boolean props off by default, as HTML boolean attributes are, and only lets measurement events carry fixed values, flags or counts.

## What it generates

`dist/index.js` exports `specs` and `measurementEvents`. `dist/index.d.ts` has:

- `ComponentSpec`, generated from the schema.
- For each component, its props and custom events, for its Lit class to implement:

  ```ts
  import type { DorasButtonProps } from '@doras/specs';

  export class DorasButton extends LitElement implements DorasButtonProps { … }
  ```

- `DorasMeasurement`, every measurement event with exactly what it carries. It also types `doras-measure` events on elements, the document and the window.

## Measurement events

Components announce sign-in moments as `doras-measure` events, which bubble out of their shadow roots. `event.detail` has the event's `name` and what it carries:

```js
document.addEventListener('doras-measure', (event) => {
  const { name, ...carries } = event.detail;
});
```

Doras never sends them anywhere, and they never carry anything personal. The full list, with when each fires, is in Storybook under Foundations → Measurement events.
