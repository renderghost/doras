// The Storybook interface around the stories.
import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'Doras',
    brandUrl: 'https://github.com/renderghost/doras',
    fontBase: "'Inter', ui-sans-serif, system-ui, sans-serif",
  }),
});
