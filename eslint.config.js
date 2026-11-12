// ESLint flat config for the whole monorepo.
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import lit from 'eslint-plugin-lit';
import wc from 'eslint-plugin-wc';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/storybook-static/**', '**/coverage/**'],
  },
  js.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  {
    // Repo scripts and config files run in Node.
    files: ['scripts/**/*.{js,ts}', '*.config.{js,ts}'],
    languageOptions: { globals: globals.node },
  },
  {
    // Web Components: Lit's and the custom elements rules.
    files: ['packages/components/**/*.ts', 'packages/browser-mocks/**/*.ts'],
    extends: [lit.configs['flat/recommended'], wc.configs['flat/recommended']],
    languageOptions: { globals: globals.browser },
  },
);
