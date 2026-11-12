import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { flowMeta, walk, type FlowArgs } from './flow-meta.ts';
import { CREATE, RECOVER, SIGN_IN } from './walks.ts';

/**
 * Each journey, walked in each test locale. The walks find steps and
 * buttons by their catalogue strings, so they'd fail on a missing or
 * broken translation, and on anything right to left breaks.
 */
const meta: Meta<FlowArgs> = { ...flowMeta, title: 'Flows/In every locale' };
export default meta;
type Story = StoryObj<FlowArgs>;

const LOCALES = { German: 'de', Arabic: 'ar', Japanese: 'ja', 'Pseudo-locale': 'pseudo' } as const;
const JOURNEYS = {
  'Sign in': { walk: SIGN_IN, scenario: 'sam' },
  'Create an account': { walk: CREATE, scenario: 'jo' },
  Recover: { walk: RECOVER, scenario: 'rae' },
} as const;

const story = (journey: keyof typeof JOURNEYS, language: keyof typeof LOCALES): Story => ({
  name: `${journey}: ${language}`,
  args: { scenario: JOURNEYS[journey].scenario },
  globals: { locale: LOCALES[language] },
  play: async ({ canvasElement }) => walk(canvasElement, [...JOURNEYS[journey].walk]),
});

export const SignInGerman = story('Sign in', 'German');
export const SignInArabic = story('Sign in', 'Arabic');
export const SignInJapanese = story('Sign in', 'Japanese');
export const SignInPseudo = story('Sign in', 'Pseudo-locale');
export const CreateGerman = story('Create an account', 'German');
export const CreateArabic = story('Create an account', 'Arabic');
export const CreateJapanese = story('Create an account', 'Japanese');
export const CreatePseudo = story('Create an account', 'Pseudo-locale');
export const RecoverGerman = story('Recover', 'German');
export const RecoverArabic = story('Recover', 'Arabic');
export const RecoverJapanese = story('Recover', 'Japanese');
export const RecoverPseudo = story('Recover', 'Pseudo-locale');
