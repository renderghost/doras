// The measurable parts of the accessibility audit (#19). On every story: axe
// in every theme, with 7:1 contrast in the high-contrast ones (1.4.6), 44px
// targets (2.5.5), focus appearance (2.4.13), reflow at 320px (1.4.10), text
// spacing (1.4.12), reduced motion (2.3.3), and pasting and autofill in every
// field (3.3.8). On every docs page: axe in every theme. Screen readers are
// checked by hand: see the accessibility statement.
import { createRequire } from 'node:module';
import { expect, test, type Page } from '@playwright/test';
import { docsEntries, entries, open, openDocs } from './open.ts';

const AXE = createRequire(import.meta.url).resolve('axe-core/axe.min.js');

const LIGHT = 'theme:light;locale:en-GB';

// Helpers in the page, shadow roots included.
const HELPERS = () => {
  const w = window as unknown as Record<string, unknown>;
  const deep = (root: Document | ShadowRoot = document): Element[] => {
    const out: Element[] = [];
    const walk = (r: Document | ShadowRoot) => {
      for (const el of r.querySelectorAll('*')) {
        out.push(el);
        if (el.shadowRoot) walk(el.shadowRoot);
      }
    };
    walk(root);
    return out;
  };
  /** The element and its hosts, as a short path: doras-step-link > button. */
  const path = (el: Element): string => {
    const parts: string[] = [];
    for (let n: Element | null = el; n;) {
      parts.unshift(n.tagName.toLowerCase());
      const root = n.getRootNode();
      n = root instanceof ShadowRoot ? root.host : null;
    }
    return parts
      .filter((p) => p.includes('-') || parts.indexOf(p) === parts.length - 1)
      .join(' > ');
  };
  const inStory = (el: Element): boolean => {
    for (let n: Node | null = el; n;) {
      if (
        n instanceof Element &&
        (n.id === 'storybook-root' || n.matches?.('[data-doras-announcer]'))
      )
        return n instanceof Element && n.id === 'storybook-root';
      const root = n.getRootNode();
      n = n.parentNode ?? (root instanceof ShadowRoot ? root.host : null);
    }
    return false;
  };
  /** Mocks are the browser's own UI, not Doras's. */
  const inMock = (el: Element): boolean => /doras-mock-/.test(path(el));
  const visible = (el: Element): boolean => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 1 && r.height > 1 && s.visibility !== 'hidden' && s.display !== 'none';
  };
  w.__a11y = { deep, path, inStory, inMock, visible };
};

async function prepare(page: Page): Promise<void> {
  await page.addInitScript(HELPERS);
}

const stories = entries.filter((e) => !e.id.startsWith('emails-'));

// The story tests run axe in the light theme. This runs it in all four, and
// the high-contrast themes must also reach 7:1 (axe's color-contrast-enhanced).
const THEMES = ['light', 'dark', 'light-high-contrast', 'dark-high-contrast'] as const;

for (const theme of THEMES) {
  test.describe(`axe, ${theme} theme`, () => {
    for (const { id } of stories) {
      test(id, async ({ page }) => {
        await open(page, id, `theme:${theme};locale:en-GB`);
        await page.addScriptTag({ path: AXE });
        const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
        const violations = await page.evaluate(
          async ({ tags, enhanced }) => {
            const axe = (window as never as { axe: typeof import('axe-core') }).axe;
            const result = await axe.run(
              { include: [['#storybook-root']] },
              {
                runOnly: { type: 'tag', values: tags },
                rules: { 'color-contrast-enhanced': { enabled: enhanced } },
              },
            );
            return result.violations.flatMap((v) =>
              v.nodes.map((n) => `${v.id}: ${n.target.join(' ')}`),
            );
          },
          {
            tags: theme.endsWith('high-contrast') ? [...tags, 'wcag2aaa'] : tags,
            enhanced: theme.endsWith('high-contrast'),
          },
        );
        expect(violations).toEqual([]);
      });
    }
  });
}

// Docs pages, where people read the content, in every theme too. axe runs on
// the whole page: the prose, the tables, the stories and Storybook's own
// blocks. Its best-practice rules are left out here: they'd judge Storybook's
// docs markup, which Doras doesn't control. Stories in frames of their own
// are checked as stories, above.
for (const theme of THEMES) {
  test.describe(`axe on docs pages, ${theme} theme`, () => {
    for (const { id } of docsEntries) {
      test(id, async ({ page }) => {
        await openDocs(page, id, `theme:${theme};locale:en-GB`);
        await page.addScriptTag({ path: AXE });
        const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
        const violations = await page.evaluate(
          async ({ tags, enhanced }) => {
            const axe = (window as never as { axe: typeof import('axe-core') }).axe;
            const result = await axe.run(document, {
              runOnly: { type: 'tag', values: tags },
              rules: { 'color-contrast-enhanced': { enabled: enhanced } },
            });
            return result.violations.flatMap((v) =>
              v.nodes.map((n) => `${v.id}: ${n.target.join(' ')}`),
            );
          },
          {
            tags: theme.endsWith('high-contrast') ? [...tags, 'wcag2aaa'] : tags,
            enhanced: theme.endsWith('high-contrast'),
          },
        );
        expect(violations).toEqual([]);
      });
    }
  });
}

test.describe('44px targets (2.5.5)', () => {
  for (const { id } of stories) {
    test(id, async ({ page }) => {
      await prepare(page);
      await open(page, id, LIGHT);
      const small = await page.evaluate(() => {
        const { deep, path, inStory, inMock, visible } = (
          window as never as {
            __a11y: Record<string, (el: Element) => unknown> & { deep: () => Element[] };
          }
        ).__a11y as never as {
          deep: () => Element[];
          path: (el: Element) => string;
          inStory: (el: Element) => boolean;
          inMock: (el: Element) => boolean;
          visible: (el: Element) => boolean;
        };
        const INTERACTIVE =
          'a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=link], [role=checkbox], [role=radio], [role=switch], [role=option], [tabindex]:not([tabindex="-1"])';
        const found: string[] = [];
        for (const el of deep()) {
          if (!el.matches(INTERACTIVE) || !inStory(el) || inMock(el)) continue;
          if (el.closest('[aria-hidden="true"], [inert]')) continue;
          // A visually hidden radio or checkbox is hit through its label.
          const target =
            el instanceof HTMLInputElement && (el.type === 'radio' || el.type === 'checkbox')
              ? (el.labels?.[0] ?? el.closest('label') ?? el)
              : el;
          if (!visible(target)) continue;
          // Links inside a sentence are exempt. The link's box may sit in a
          // host's shadow root, so walk out through inline boxes to its block.
          let box: Element = target;
          let inSentence = false;
          while (getComputedStyle(box).display === 'inline') {
            const root = box.getRootNode();
            const up = box.parentElement ?? (root instanceof ShadowRoot ? root.host : null);
            if (!up) break;
            if (getComputedStyle(up).display !== 'inline') {
              inSentence =
                (up.textContent ?? '').trim().length > (box.textContent ?? '').trim().length;
              break;
            }
            box = up;
          }
          if (inSentence) continue;
          const r = target.getBoundingClientRect();
          if (Math.round(r.width) < 44 || Math.round(r.height) < 44) {
            found.push(`${path(el)} is ${Math.round(r.width)}×${Math.round(r.height)}`);
          }
        }
        return [...new Set(found)];
      });
      expect(small).toEqual([]);
    });
  }
});

test.describe('focus appearance (2.4.13)', () => {
  for (const { id } of stories) {
    test(id, async ({ page }) => {
      await prepare(page);
      await open(page, id, LIGHT);
      const problems: string[] = [];
      const seen = new Set<string>();
      for (let i = 0; i < 30; i++) {
        await page.keyboard.press('Tab');
        const result = await page.evaluate(() => {
          const { path, inStory, inMock } = (
            window as never as {
              __a11y: {
                path: (el: Element) => string;
                inStory: (el: Element) => boolean;
                inMock: (el: Element) => boolean;
              };
            }
          ).__a11y;
          let el: Element | null = document.activeElement;
          while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
          if (!el || el === document.body || !inStory(el) || inMock(el)) return null;
          const rgb = (c: string) => (c.match(/[\d.]+/g) ?? []).map(Number);
          const lum = ([r = 0, g = 0, b = 0]: number[]) => {
            const f = (v: number) => {
              const s = v / 255;
              return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
            };
            return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
          };
          const contrast = (a: number[], b: number[]) => {
            const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
            return ((x ?? 0) + 0.05) / ((y ?? 0) + 0.05);
          };
          const background = (from: Element): number[] => {
            for (let n: Element | null = from; n;) {
              const c = rgb(getComputedStyle(n).backgroundColor);
              if (c.length >= 3 && (c[3] === undefined || c[3] > 0.5)) return c.slice(0, 3);
              const root = n.getRootNode();
              n = n.parentElement ?? (root instanceof ShadowRoot ? root.host : null);
            }
            return [255, 255, 255];
          };
          // The ring can sit on the control, its label, or a wrapper drawn round it.
          const candidates: Element[] = [el];
          if (el instanceof HTMLInputElement && el.labels?.[0]) candidates.push(el.labels[0]);
          for (let n = el.parentElement, k = 0; n && k < 3; n = n.parentElement, k++)
            candidates.push(n);
          for (const c of candidates) {
            const s = getComputedStyle(c);
            const width = parseFloat(s.outlineWidth);
            if (s.outlineStyle !== 'none' && width >= 2) {
              const ratio = contrast(rgb(s.outlineColor), background(c.parentElement ?? c));
              return {
                at: path(el),
                ok: ratio >= 3,
                why: `outline ${width}px at ${ratio.toFixed(2)}:1`,
              };
            }
          }
          return { at: path(el), ok: false, why: 'no outline of 2px or more' };
        });
        if (!result) continue;
        if (seen.has(result.at)) break;
        seen.add(result.at);
        if (!result.ok) problems.push(`${result.at}: ${result.why}`);
      }
      expect(problems).toEqual([]);
    });
  }
});

/** Text cut off by its box: the content is wider or taller than what shows. */
const CLIPPED = () => {
  const { deep, path, inStory, inMock, visible } = (
    window as never as {
      __a11y: {
        deep: () => Element[];
        path: (el: Element) => string;
        inStory: (el: Element) => boolean;
        inMock: (el: Element) => boolean;
        visible: (el: Element) => boolean;
      };
    }
  ).__a11y;
  /** Whether text shows inside it, following slots and shadow roots: Doras text is mostly slotted. */
  const hasText = (el: Element): boolean => {
    const walk = (nodes: Iterable<Node>, depth: number): boolean => {
      for (const n of nodes) {
        if (n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim()) return true;
        if (!(n instanceof Element) || depth > 6) continue;
        if (n instanceof HTMLSlotElement && walk(n.assignedNodes({ flatten: true }), depth + 1))
          return true;
        if (n.shadowRoot && walk(n.shadowRoot.childNodes, depth + 1)) return true;
        if (walk(n.childNodes, depth + 1)) return true;
      }
      return false;
    };
    return walk(el.childNodes, 0);
  };
  const found: string[] = [];
  for (const el of deep()) {
    if (!inStory(el) || inMock(el) || !visible(el)) continue;
    const s = getComputedStyle(el);
    // Visually hidden text is meant to be clipped.
    if (
      s.clipPath === 'inset(50%)' ||
      (el.getBoundingClientRect().width <= 1 && s.overflow === 'hidden')
    )
      continue;
    const hidesX = ['hidden', 'clip'].includes(s.overflowX);
    const hidesY = ['hidden', 'clip'].includes(s.overflowY);
    if (!hasText(el)) continue;
    const root = el.getRootNode();
    const words = (
      el.textContent?.trim() ||
      (root instanceof ShadowRoot ? root.host.textContent : '') ||
      ''
    )
      .trim()
      .slice(0, 30);
    if (
      (hidesX && el.scrollWidth > el.clientWidth + 1) ||
      (hidesY && el.scrollHeight > el.clientHeight + 1)
    ) {
      found.push(`${path(el)}: “${words}”`);
    }
    if (s.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1) {
      found.push(`${path(el)} truncates “${words}”`);
    }
  }
  return [...new Set(found)];
};

test.describe('reflow at 320px, 400% zoom (1.4.10)', () => {
  for (const { id } of stories) {
    test(id, async ({ page }) => {
      await prepare(page);
      await page.setViewportSize({ width: 320, height: 640 });
      await open(page, id, LIGHT);
      const sideways = await page.evaluate(() =>
        document.documentElement.scrollWidth > window.innerWidth + 1
          ? `the page scrolls sideways: ${document.documentElement.scrollWidth}px wide`
          : null,
      );
      const clipped = await page.evaluate(CLIPPED);
      expect([...(sideways ? [sideways] : []), ...clipped]).toEqual([]);
    });
  }
});

test.describe('text spacing (1.4.12)', () => {
  for (const { id } of stories) {
    test(id, async ({ page }) => {
      await prepare(page);
      await open(page, id, LIGHT);
      await page.evaluate(() => {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(
          '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-block-end: 2em !important; }',
        );
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
        const { deep } = (window as never as { __a11y: { deep: () => Element[] } }).__a11y;
        for (const el of deep()) {
          if (el.shadowRoot)
            el.shadowRoot.adoptedStyleSheets = [...el.shadowRoot.adoptedStyleSheets, sheet];
        }
      });
      await page.waitForTimeout(100);
      expect(await page.evaluate(CLIPPED)).toEqual([]);
    });
  }
});

test.describe('reduced motion (2.3.3)', () => {
  test.use({ reducedMotion: 'reduce' });
  for (const { id } of stories) {
    test(id, async ({ page }) => {
      await prepare(page);
      await open(page, id, LIGHT);
      const moving = await page.evaluate(() => {
        const { deep, path } = (
          window as never as {
            __a11y: { deep: () => Element[]; path: (el: Element) => string };
          }
        ).__a11y;
        const all = new Set<Animation>(document.getAnimations());
        for (const el of deep()) el.shadowRoot?.getAnimations().forEach((a) => all.add(a));
        return [...all]
          .filter(
            (a) => a.playState === 'running' && Number(a.effect?.getComputedTiming().duration) > 0,
          )
          .map((a) => {
            const target = (a.effect as KeyframeEffect | null)?.target;
            return target ? path(target) : 'an animation';
          });
      });
      expect(moving).toEqual([]);
    });
  }
});

test.describe('accessible authentication (3.3.8)', () => {
  // Pasting and password managers must work in every field: nothing cancels a
  // paste, credentials say what they are, and none turn autofill off.
  for (const { id } of stories) {
    test(id, async ({ page }) => {
      await prepare(page);
      await open(page, id, LIGHT);
      const problems = await page.evaluate(() => {
        const { deep, path, inStory, inMock } = (
          window as never as {
            __a11y: {
              deep: () => Element[];
              path: (el: Element) => string;
              inStory: (el: Element) => boolean;
              inMock: (el: Element) => boolean;
            };
          }
        ).__a11y;
        const found: string[] = [];
        for (const el of deep()) {
          if (!(el instanceof HTMLInputElement) || !inStory(el) || inMock(el)) continue;
          if (['radio', 'checkbox', 'hidden', 'button', 'submit'].includes(el.type)) continue;
          const at = path(el);
          const paste = new ClipboardEvent('paste', {
            clipboardData: new DataTransfer(),
            bubbles: true,
            cancelable: true,
            composed: true,
          });
          el.dispatchEvent(paste);
          if (paste.defaultPrevented) found.push(`${at} cancels pasting`);
          const auto = el.getAttribute('autocomplete');
          // Tokens, not the whole value: “current-password webauthn” also offers passkeys.
          const tokens = (auto ?? '').split(/\s+/);
          if (
            el.type === 'password' &&
            !tokens.some((t) => t === 'current-password' || t === 'new-password')
          )
            found.push(`${at} is a password without current-password or new-password`);
          if (auto === 'off' && /doras-(handle|email|password|code)-field/.test(at))
            found.push(`${at} turns autofill off`);
        }
        return [...new Set(found)];
      });
      expect(problems).toEqual([]);
    });
  }
});
