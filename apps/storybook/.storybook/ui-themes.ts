// Storybook's own interface in the four Doras themes. The sidebar, toolbar,
// panels and docs pages take their colours from the tokens, so the whole
// window changes with the Theme setting, not only the stories.
import { create, type ThemeVars } from 'storybook/theming';
import { type ThemeKey, token } from '../src/docs/tokens.ts';
import { THEMES, type Theme } from './settings.ts';

const KEYS: Record<Theme, ThemeKey> = {
  light: 'light',
  dark: 'dark',
  'light-high-contrast': 'lightHighContrast',
  'dark-high-contrast': 'darkHighContrast',
};

interface ColourValue {
  components: [number, number, number];
  alpha?: number;
}

/**
 * A colour token's value in a theme, as rgb() or rgba(). Storybook lightens and
 * darkens some of its colours, so it needs a format it can parse, and the
 * alpha of translucent tokens such as borders.
 */
export function colour(name: string, theme: Theme): string {
  const value = token(name).values[KEYS[theme]].value as ColourValue;
  const [r, g, b] = value.components.map((c) => Math.round(c * 255));
  return value.alpha === undefined || value.alpha === 1
    ? `rgb(${r}, ${g}, ${b})`
    : `rgba(${r}, ${g}, ${b}, ${value.alpha})`;
}

const px = (name: string): number => (token(name).values.light.value as { value: number }).value;

function uiTheme(theme: Theme): ThemeVars {
  const c = (name: string) => colour(name, theme);
  return create({
    base: theme.startsWith('dark') ? 'dark' : 'light',
    brandTitle: 'Doras',
    brandUrl: 'https://github.com/renderghost/doras',
    // Links, focus and the selected tab: the focus blue, which has 4.5:1 or
    // more against every theme's surfaces, and 7:1 in the high-contrast ones.
    colorPrimary: c('color.selected.border'),
    colorSecondary: c('color.border.focus'),
    appBg: c('color.surface.subtle'),
    appContentBg: c('color.surface.default'),
    appPreviewBg: c('color.surface.default'),
    appHoverBg: c('color.feedback.info.surface'),
    appBorderColor: c('color.border.default'),
    appBorderRadius: px('radius.control'),
    fontBase: "'Inter', ui-sans-serif, system-ui, sans-serif",
    fontCode: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
    textColor: c('color.text.default'),
    textInverseColor: c('color.text.inverse'),
    textMutedColor: c('color.text.subtle'),
    barTextColor: c('color.text.subtle'),
    barHoverColor: c('color.border.focus'),
    barSelectedColor: c('color.border.focus'),
    barBg: c('color.surface.default'),
    buttonBg: c('color.surface.raised'),
    buttonBorder: c('color.border.control'),
    booleanBg: c('color.surface.subtle'),
    booleanSelectedBg: c('color.surface.raised'),
    inputBg: c('color.surface.default'),
    inputBorder: c('color.border.control'),
    inputTextColor: c('color.text.default'),
    inputBorderRadius: px('radius.control'),
  });
}

export const uiThemes = Object.fromEntries(
  (Object.keys(THEMES) as Theme[]).map((theme) => [theme, uiTheme(theme)]),
) as Record<Theme, ThemeVars>;

/**
 * Two fixes to Storybook's own styles, in the theme's colours. The selected
 * sidebar item takes Doras's selected colours: Storybook would fill it with
 * the focus blue, darkened in dark themes, under white text, which is below
 * 4.5:1 in both dark themes. And the unchosen label of a true or false
 * control is translucent, which is below 4.5:1 in Light.
 */
export function managerCss(theme: Theme): string {
  const c = (name: string) => colour(name, theme);
  return `
.sidebar-item[data-selected='true'],
.sidebar-item[data-selected='true']:hover,
.sidebar-item[data-selected='true']:focus {
  background: ${c('color.selected.surface')} !important;
  color: ${c('color.text.default')} !important;
  box-shadow: inset 3px 0 0 ${c('color.selected.border')};
}
.sidebar-item[data-selected='true'] svg {
  color: ${c('color.selected.icon')} !important;
}
label > input[role='switch'] ~ span[aria-hidden='true'] {
  color: ${c('color.text.subtle')};
}`;
}
