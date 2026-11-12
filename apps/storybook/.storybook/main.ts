// Storybook's main config: where stories live, and which addons run.
import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
  framework: '@storybook/web-components-vite',
  stories: ['../src/**/*.mdx', '../src/**/*.stories.ts'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
    '@storybook/addon-designs',
    'storybook-addon-pseudo-states',
  ],
  core: { disableTelemetry: true },
  docs: { defaultName: 'Docs' },
  // Storybook's own preview runtime and axe are larger than Vite's default warning size.
  viteFinal: (vite) => ({ ...vite, build: { ...vite.build, chunkSizeWarningLimit: 1200 } }),
};

export default config;
