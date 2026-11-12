// Every story and docs page: the token CSS, the toolbar settings, viewports,
// backgrounds, the sidebar order and the accessibility checks.
import '@doras/tokens/css';
import type { Preview } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';
import { DocsPage } from '../src/docs/DocsPage.tsx';
import { DEFAULTS, applyAttributes, attributesFor, globalTypes, readSettings } from './settings.ts';

const preview: Preview = {
  // Every component gets a docs page.
  tags: ['autodocs'],
  globalTypes,
  initialGlobals: { ...DEFAULTS, backgrounds: { value: 'surface' } },
  decorators: [
    (story, context) => {
      const attributes = attributesFor(readSettings(context.globals));
      // On its own page, a story sets the whole document, as an app would.
      // In docs, each story gets the settings on its own wrapper instead.
      if (context.viewMode === 'story') applyAttributes(document.documentElement, attributes);
      return html`<div
        class="doras-story"
        data-doras-theme=${attributes['data-doras-theme'] ?? nothing}
        data-doras-motion=${attributes['data-doras-motion'] ?? nothing}
        lang=${attributes.lang}
        dir=${attributes.dir}
      >
        ${story()}
      </div>`;
    },
  ],
  parameters: {
    layout: 'padded',
    controls: {
      expanded: true,
      sort: 'requiredFirst',
      matchers: { color: /(background|color)$/i },
    },
    // The contents list shows the page's sections, not each story.
    docs: { page: DocsPage, toc: { headingSelector: 'h2' } },
    a11y: {
      // Axe failures fail the story's test (#1: axe checks on every story).
      test: 'error',
    },
    viewport: {
      options: {
        reflow: { name: 'Reflow, 320 wide', styles: { width: '320px', height: '640px' } },
        phone: { name: 'Phone', styles: { width: '390px', height: '844px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop', styles: { width: '1280px', height: '800px' } },
      },
    },
    backgrounds: {
      options: {
        surface: { name: 'Surface', value: 'var(--doras-color-surface-default)' },
        subtle: { name: 'Subtle surface', value: 'var(--doras-color-surface-subtle)' },
      },
    },
    // Storybook reads the sort order without running this file, so it must be a literal.
    options: {
      storySort: {
        order: [
          'Introduction',
          'Foundations',
          [
            'Overview',
            'Colour',
            'Type',
            'Spacing and size',
            'Motion',
            'Icons',
            'Localisation',
            'Measurement events',
            'All tokens',
          ],
          'Actions',
          ['Overview', '*'],
          'User input',
          ['Overview', '*'],
          'Display',
          ['Overview', '*'],
          'Identity',
          ['Overview', '*'],
          'System feedback',
          ['Overview', '*'],
          'Navigation',
          ['Overview', '*'],
          'Containers',
          ['Overview', '*'],
          'Browser mocks',
          ['Overview', '*'],
          'Emails',
          ['Overview', '*'],
          'Flows',
          ['Overview', '*'],
          'Contributing',
          ['Overview', '*'],
        ],
      },
    },
  },
};

export default preview;
