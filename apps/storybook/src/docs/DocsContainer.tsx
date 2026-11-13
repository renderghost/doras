// Docs pages in the chosen Doras theme, the same as the sidebar and the stories.
// It also sets the theme and motion on the whole docs page, so the page and
// pages with no stories, such as the Introduction, follow them too. The page
// itself stays in British English, left to right: each story sets its own
// language on its wrapper.
import { DocsContainer, type DocsContainerProps } from '@storybook/addon-docs/blocks';
import { type PropsWithChildren, useEffect, useState } from 'react';
import { GLOBALS_UPDATED } from 'storybook/internal/core-events';
import {
  applyAttributes,
  attributesFor,
  readSettings,
  type Settings,
} from '../../.storybook/settings.ts';
import { uiThemes } from '../../.storybook/ui-themes.ts';

// The docs context carries the story store, which holds the toolbar's settings.
interface WithGlobals {
  store?: { userGlobals?: { get?: () => Record<string, unknown> } };
}

export function ThemedDocsContainer({ context, children }: PropsWithChildren<DocsContainerProps>) {
  const [settings, setSettings] = useState<Settings>(() =>
    readSettings((context as WithGlobals).store?.userGlobals?.get?.() ?? {}),
  );

  useEffect(() => {
    const follow = ({ userGlobals }: { userGlobals: Record<string, unknown> }) =>
      setSettings(readSettings(userGlobals));
    context.channel.on(GLOBALS_UPDATED, follow);
    return () => context.channel.off(GLOBALS_UPDATED, follow);
  }, [context.channel]);

  useEffect(() => {
    applyAttributes(document.documentElement, {
      ...attributesFor(settings),
      lang: 'en-GB',
      dir: 'ltr',
    });
  }, [settings]);

  return (
    <DocsContainer context={context} theme={uiThemes[settings.theme]}>
      {children}
    </DocsContainer>
  );
}
