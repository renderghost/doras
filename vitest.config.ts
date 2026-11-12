import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['scripts/**/*.test.ts', 'packages/**/*.test.ts', 'apps/*/src/**/*.test.ts'],
        },
      },
      // Storybook's stories, as browser tests.
      'apps/storybook/vitest.config.ts',
    ],
  },
});
