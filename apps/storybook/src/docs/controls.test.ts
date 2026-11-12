import { specs } from '@doras/specs';
import { describe, expect, it } from 'vitest';
import { argTypesFromSpec, argsFromSpec } from './controls.ts';

describe('Controls from a spec', () => {
  const argTypes = argTypesFromSpec(specs.button);

  it('give every prop a control, never raw JSON', () => {
    expect(Object.keys(argTypes)).toEqual(specs.button.props.map((p) => p.name));
    for (const argType of Object.values(argTypes)) expect(argType.control).not.toBe('object');
  });

  it('use radios for a few choices, toggles for booleans and text for strings', () => {
    expect(argTypes.variant).toMatchObject({
      control: 'inline-radio',
      options: ['primary', 'secondary', 'tertiary'],
    });
    expect(argTypes.busy?.control).toBe('boolean');
    expect(argTypes.busyLabel?.control).toBe('text');
  });

  it('use a select for more than four choices', () => {
    const many = {
      ...specs.button,
      props: [
        {
          name: 'size',
          type: 'enum' as const,
          description: 'Size.',
          default: 'a',
          values: ['a', 'b', 'c', 'd', 'e'].map((value) => ({ value, description: value })),
        },
      ],
    };
    expect(argTypesFromSpec(many).size?.control).toBe('select');
  });

  it('start from each prop’s default', () => {
    expect(argsFromSpec(specs.button)).toEqual({
      variant: 'primary',
      type: 'button',
      busy: false,
      fullWidth: false,
    });
  });
});
