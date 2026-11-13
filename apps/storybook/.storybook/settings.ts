// The toolbar settings: theme, locale, text direction and reduced motion.
// They're applied to every story by the decorator in preview.ts.

// Always one of the four: Storybook's own interface follows the theme too, so
// it has to be a definite one, not the device's setting.
export const THEMES = {
  light: 'Light',
  dark: 'Dark',
  'light-high-contrast': 'Light, high contrast',
  'dark-high-contrast': 'Dark, high contrast',
} as const;
export type Theme = keyof typeof THEMES;

/** The test locales from #1. The pseudo-locale uses the private-use tag en-XA. */
export const LOCALES = {
  'en-GB': { title: 'English (UK)', lang: 'en-GB', dir: 'ltr' },
  pseudo: { title: 'Pseudo-locale', lang: 'en-XA', dir: 'ltr' },
  ar: { title: 'Arabic', lang: 'ar', dir: 'rtl' },
  de: { title: 'German', lang: 'de', dir: 'ltr' },
  ja: { title: 'Japanese', lang: 'ja', dir: 'ltr' },
} as const;
export type Locale = keyof typeof LOCALES;

export const DIRECTIONS = {
  auto: 'From the locale',
  ltr: 'Left to right',
  rtl: 'Right to left',
} as const;
export type Direction = keyof typeof DIRECTIONS;

export const MOTION = {
  system: 'Follow system',
  reduce: 'Reduced',
} as const;
export type Motion = keyof typeof MOTION;

export interface Settings {
  theme: Theme;
  locale: Locale;
  direction: Direction;
  motion: Motion;
}

export const DEFAULTS: Settings = {
  theme: 'light',
  locale: 'en-GB',
  direction: 'auto',
  motion: 'system',
};

/** Reads the settings from Storybook's globals, falling back to the defaults. */
export function readSettings(globals: Record<string, unknown>): Settings {
  const pick = <T extends string>(value: unknown, allowed: Record<T, unknown>, fallback: T): T =>
    typeof value === 'string' && value in allowed ? (value as T) : fallback;
  return {
    theme: pick(globals.theme, THEMES, DEFAULTS.theme),
    locale: pick(globals.locale, LOCALES, DEFAULTS.locale),
    direction: pick(globals.direction, DIRECTIONS, DEFAULTS.direction),
    motion: pick(globals.motion, MOTION, DEFAULTS.motion),
  };
}

/** The attributes that put the settings into effect on an element. */
export function attributesFor(settings: Settings): {
  'data-doras-theme': Theme;
  'data-doras-motion': string | null;
  lang: string;
  dir: 'ltr' | 'rtl';
} {
  const locale = LOCALES[settings.locale];
  return {
    'data-doras-theme': settings.theme,
    'data-doras-motion': settings.motion === 'reduce' ? 'reduce' : null,
    lang: locale.lang,
    dir: settings.direction === 'auto' ? locale.dir : settings.direction,
  };
}

/** Sets or removes the attributes on an element. */
export function applyAttributes(element: Element, attributes: ReturnType<typeof attributesFor>) {
  for (const [name, value] of Object.entries(attributes)) {
    if (value === null) element.removeAttribute(name);
    else element.setAttribute(name, value);
  }
}

const toolbarItems = (entries: Record<string, string>) =>
  Object.entries(entries).map(([value, title]) => ({ value, title }));

export const globalTypes = {
  theme: {
    description: 'Theme',
    toolbar: {
      title: 'Theme',
      icon: 'contrast' as const,
      items: toolbarItems(THEMES),
      dynamicTitle: true,
    },
  },
  locale: {
    description: 'Locale',
    toolbar: {
      title: 'Locale',
      icon: 'globe' as const,
      items: toolbarItems(
        Object.fromEntries(Object.entries(LOCALES).map(([k, v]) => [k, v.title])),
      ),
      dynamicTitle: true,
    },
  },
  direction: {
    description: 'Text direction',
    toolbar: {
      title: 'Direction',
      icon: 'transfer' as const,
      items: toolbarItems(DIRECTIONS),
      dynamicTitle: true,
    },
  },
  motion: {
    description: 'Reduced motion',
    toolbar: {
      title: 'Motion',
      icon: 'play' as const,
      items: toolbarItems(MOTION),
      dynamicTitle: true,
    },
  },
};
