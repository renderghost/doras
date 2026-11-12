// The sample spec behind the docs template. Its shape is provisional until #7.
import type { ComponentSpec } from '../docs/spec.ts';

export const spec: ComponentSpec = {
  name: 'Example chip',
  tag: 'doras-example-chip',
  group: 'Contributing',
  summary:
    'A sample component that shows every section of the docs template. It is not part of Doras, and is removed when the button’s docs arrive.',
  usage: {
    when: [
      'To see how a component’s spec becomes its docs page.',
      'As a model when writing the first real specs in #7.',
    ],
    whenNot: [{ text: 'In an app. It isn’t published.', instead: 'the components in Actions' }],
  },
  anatomy: [
    { part: 'Chip', description: 'A toggle button with the label.' },
    { part: 'Label', description: 'Short text, supplied by the app.' },
    { part: 'Remove button', description: 'Optional. An icon button with its own name.' },
  ],
  states: [
    { name: 'Default', description: 'Not chosen.' },
    { name: 'Hover', description: 'The surface darkens slightly.' },
    { name: 'Focus', description: 'A 2px focus ring, offset by 2px.' },
    { name: 'Selected', description: 'The selected surface, and a stronger border.' },
  ],
  events: [
    {
      name: 'doras-toggle',
      kind: 'ui',
      when: 'The chip is pressed.',
      detail: '{ selected: boolean }',
    },
    { name: 'doras-remove', kind: 'ui', when: 'The remove button is pressed.' },
    {
      name: 'doras.example_chip_selected',
      kind: 'measurement',
      when: 'The chip becomes selected. A sample name only.',
    },
  ],
  accessibility: {
    role: 'button, with aria-pressed',
    name: 'The label. The remove button is named “Remove [label]”.',
    keyboard: [
      { keys: 'Tab', action: 'Moves to the chip, then to its remove button.' },
      { keys: 'Enter or Space', action: 'Toggles the chip, or removes it.' },
    ],
    screenReader: [
      'Announced as a toggle button, with its pressed state.',
      'The remove button names what it removes.',
    ],
    notes: ['Both buttons have 44px targets (WCAG 2.5.5).'],
  },
  tokens: [
    'color.surface.default',
    'color.border.control',
    'color.text.default',
    'color.icon.default',
    'color.selected.surface',
    'color.selected.border',
    'color.action.secondary.surface-hover',
    'color.border.focus',
    'border-width.default',
    'border-width.strong',
    'border-width.focus',
    'focus.offset',
    'radius.pill',
    'size.target.min',
    'space.inset.lg',
    'space.inline.xs',
    'type.label.md',
    'motion.duration.fast',
    'motion.easing.standard',
  ],
  content: {
    guidelines: ['Keep labels to one or two words.', 'Use sentence case.'],
    strings: [{ key: 'example.chip.remove', text: 'Remove {label}' }],
    terms: [
      {
        term: 'Passkey',
        meaning: 'A way to sign in with a face, fingerprint or screen lock, instead of a password.',
      },
    ],
  },
  dosAndDonts: [
    {
      do: 'Name the remove button after what it removes.',
      dont: 'Use “×” or “Remove” alone as the name.',
    },
  ],
  evidence: [
    {
      point: 'Targets are at least 44px, the AAA target size chosen in #1.',
      source: {
        label: 'WCAG 2.5.5',
        href: 'https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced',
      },
    },
  ],
};
