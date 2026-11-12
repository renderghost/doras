// Default Controls for a component, from its spec's props: radios for a few
// choices, a select for more, toggles for booleans, and text or number fields.
import type { ComponentSpec } from '@doras/specs';
import type { ArgTypes } from '@storybook/web-components-vite';

/** The most choices shown as radios; more become a select. */
export const MAX_RADIOS = 4;

export function argTypesFromSpec(spec: ComponentSpec): ArgTypes {
  const argTypes: ArgTypes = {};
  for (const prop of spec.props) {
    const table = {
      type: {
        summary:
          prop.type === 'enum' ? (prop.values ?? []).map((v) => v.value).join(' | ') : prop.type,
      },
      defaultValue:
        prop.default === undefined ? undefined : { summary: JSON.stringify(prop.default) },
    };
    const base = { name: prop.name, description: prop.description, table };
    switch (prop.type) {
      case 'enum': {
        const options = (prop.values ?? []).map((v) => v.value);
        argTypes[prop.name] = {
          ...base,
          options,
          control: options.length <= MAX_RADIOS ? 'inline-radio' : 'select',
        };
        break;
      }
      case 'boolean':
        argTypes[prop.name] = { ...base, control: 'boolean' };
        break;
      case 'number':
        argTypes[prop.name] = { ...base, control: 'number' };
        break;
      case 'string':
        argTypes[prop.name] = { ...base, control: 'text' };
        break;
    }
  }
  return argTypes;
}

/** Each prop's default, as Storybook args. */
export function argsFromSpec(spec: ComponentSpec): Record<string, unknown> {
  return Object.fromEntries(
    spec.props.filter((p) => p.default !== undefined).map((p) => [p.name, p.default]),
  );
}
