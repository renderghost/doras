// The Storybook interface around the stories. It follows the Theme setting, so
// the sidebar, toolbar and panels are in the same theme as the stories.
import { addons } from 'storybook/manager-api';
import { GLOBALS_UPDATED, SET_GLOBALS } from 'storybook/internal/core-events';
import { readSettings, type Theme } from './settings.ts';
import { managerCss, uiThemes } from './ui-themes.ts';

// A link with a theme in it opens in that theme, without a flash of Light first.
const globalsInUrl = new URLSearchParams(window.location.search).get('globals') ?? '';
let current: Theme = readSettings({
  theme: /(?:^|;)theme:([a-z-]+)/.exec(globalsInUrl)?.[1],
}).theme;

const style = document.createElement('style');
style.textContent = managerCss(current);
document.head.append(style);

addons.setConfig({ theme: uiThemes[current] });

// It follows the toolbar, not a story's own settings: the dark-mode email
// story doesn't turn the whole interface dark. At start-up, SET_GLOBALS's
// globals are the toolbar's.
interface Payload {
  globals: Record<string, unknown>;
  userGlobals?: Record<string, unknown>;
}

addons.register('doras/theme', (api) => {
  const follow = ({ globals, userGlobals }: Payload) => {
    const next = readSettings(userGlobals ?? globals).theme;
    if (next === current) return;
    current = next;
    api.setOptions({ theme: uiThemes[next] });
    style.textContent = managerCss(next);
  };
  api.on(SET_GLOBALS, follow);
  api.on(GLOBALS_UPDATED, follow);
});
