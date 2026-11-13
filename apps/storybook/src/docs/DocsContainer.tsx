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

// Read from the docs page's own store: framed stories send their own
// GLOBALS_UPDATED to this page too, with their settings, not the toolbar's.
const toolbarSettings = (context: DocsContainerProps['context']): Settings =>
  readSettings((context as WithGlobals).store?.userGlobals?.get?.() ?? {});

const globalsParam = (s: Settings) =>
  `theme:${s.theme};locale:${s.locale};direction:${s.direction};motion:${s.motion}`;

/**
 * Stories shown in a frame of their own (`inline: false`, such as Dialog and
 * the browser mocks) are separate previews, which would open in the default
 * settings. Storybook builds their address from PREVIEW_URL, so the settings
 * go there, and frames already showing are pointed at the new address.
 */
function passToFrames(settings: Settings) {
  const globals = globalsParam(settings);
  (globalThis as { PREVIEW_URL?: string }).PREVIEW_URL = `iframe.html?globals=${globals}`;
  for (const frame of document.querySelectorAll<HTMLIFrameElement>(
    'iframe[src*="viewMode=story"]',
  )) {
    const url = new URL(frame.src);
    if (url.searchParams.get('globals') === globals) continue;
    url.searchParams.set('globals', globals);
    frame.src = url.toString();
  }
}

export function ThemedDocsContainer({ context, children }: PropsWithChildren<DocsContainerProps>) {
  const [settings, setSettings] = useState<Settings>(() => toolbarSettings(context));

  useEffect(() => {
    const follow = () =>
      setSettings((previous) => {
        const next = toolbarSettings(context);
        return globalsParam(next) === globalsParam(previous) ? previous : next;
      });
    context.channel.on(GLOBALS_UPDATED, follow);
    return () => context.channel.off(GLOBALS_UPDATED, follow);
  }, [context]);

  // Before the stories render, so framed stories open in the right settings.
  passToFrames(settings);

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
