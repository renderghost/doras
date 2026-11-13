// Docs blocks for the foundations pages and the component docs template.
// Samples are drawn with the real CSS custom properties, inside each theme,
// so the pages also show the CSS works.
import { catalogues, format, withoutIsolation, type Locale, type MessageKey } from '@doras/i18n';
import { IntlMessageFormat } from 'intl-messageformat';
import source from '@doras/i18n/messages/en-GB.json';
import { measurementEvents } from '@doras/specs';
import { Unstyled } from '@storybook/addon-docs/blocks';
import type { IconNode } from 'lucide';
import { Fragment, createElement, useState, type CSSProperties, type ReactNode } from 'react';
import { ICONS } from '@doras/components';
import { THEMES, sameInEveryTheme, type ThemeKey, type Token } from './tokens.ts';
import './docs.css';

const attributeFor = (key: ThemeKey): string =>
  THEMES.find((t) => t.key === key)?.attribute ?? 'light';

/**
 * A long name, such as a token or a CSS value, wraps after its dots, hyphens,
 * slashes and brackets, not in the middle of a word.
 */
function breakable(text: string): ReactNode {
  return text.split(/(?<=[./(-])/).map((part, i) => (
    <Fragment key={i}>
      {i > 0 && <wbr />}
      {part}
    </Fragment>
  ));
}

function Code({ children }: { children: string | null }) {
  return children === null ? null : <code>{breakable(children)}</code>;
}

/** A token's name in each platform's code. Swift and Kotlin share the name. */
function CodeNames({ code }: { code: NonNullable<Token['code']> }) {
  return (
    <div className="doras-docs-muted">
      CSS <Code>{code.web}</Code>
      <br />
      Swift and Kotlin <Code>{code.ios}</Code>
    </div>
  );
}

function Swatch({ cssVar, theme }: { cssVar: string; theme: ThemeKey }) {
  return (
    <span className="doras-docs-swatch-frame" data-doras-theme={attributeFor(theme)}>
      <span className="doras-docs-swatch" style={{ background: `var(${cssVar})` }} />
    </span>
  );
}

function ShadowSample({ cssVar, theme }: { cssVar: string; theme: ThemeKey }) {
  return (
    <span className="doras-docs-swatch-frame" data-doras-theme={attributeFor(theme)}>
      <span
        className="doras-docs-swatch"
        style={{ background: 'var(--doras-color-surface-raised)', boxShadow: `var(${cssVar})` }}
      />
    </span>
  );
}

function Value({ t, theme }: { t: Token; theme: ThemeKey }) {
  const v = t.values[theme];
  return (
    <>
      {t.type === 'color' && t.cssVar && <Swatch cssVar={t.cssVar} theme={theme} />}
      {t.type === 'shadow' && t.cssVar && <ShadowSample cssVar={t.cssVar} theme={theme} />}
      <Code>{v.css}</Code>
      {v.aliasOf && <div className="doras-docs-muted">{breakable(v.aliasOf)}</div>}
    </>
  );
}

/** Every token's value in each theme, with its description and names in code. */
export function TokenTable({ tokens, code = true }: { tokens: Token[]; code?: boolean }) {
  return (
    <Unstyled>
      <table className="doras-docs-table doras-docs-tokens">
        <thead>
          <tr>
            <th scope="col">Token</th>
            {THEMES.map((theme) => (
              <th scope="col" key={theme.key}>
                {theme.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tokens.map((t) => (
            <tr key={t.name}>
              <th scope="row">
                <Code>{t.name}</Code>
                {t.description && <div>{t.description}</div>}
                {code && t.code && <CodeNames code={t.code} />}
              </th>
              {sameInEveryTheme(t) ? (
                <td colSpan={THEMES.length}>
                  <Value t={t} theme="light" />
                  <div className="doras-docs-muted">The same in every theme</div>
                </td>
              ) : (
                THEMES.map((theme) => (
                  <td key={theme.key}>
                    <Value t={t} theme={theme.key} />
                  </td>
                ))
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </Unstyled>
  );
}

const typeStyle = (t: Token): CSSProperties => ({
  fontFamily: `var(${t.cssVar}-font-family)`,
  fontSize: `var(${t.cssVar}-font-size)`,
  fontWeight: `var(${t.cssVar}-font-weight)` as CSSProperties['fontWeight'],
  lineHeight: `var(${t.cssVar}-line-height)`,
  letterSpacing: `var(${t.cssVar}-letter-spacing)`,
});

const SAMPLE_TEXT: Record<string, string> = {
  heading: 'Find your Atmosphere account',
  body: 'We never put a sign-in link in an email. Type the code instead.',
  label: 'Continue with Atmosphere',
  caption: 'Hosted by Bluesky',
  fine: 'One Atmosphere account for every app',
  code: '123 456',
};

/** Each type style, set in itself, with its values. */
export function TypeSpecimens({ tokens }: { tokens: Token[] }) {
  return (
    <Unstyled>
      <table className="doras-docs-table">
        <tbody>
          {tokens.map((t) => {
            const kind = t.name.split('.')[1] ?? 'body';
            return (
              <tr key={t.name}>
                <th scope="row" style={{ inlineSize: '14rem' }}>
                  <Code>{t.name}</Code>
                  {t.description && <div>{t.description}</div>}
                  {t.code && <CodeNames code={t.code} />}
                </th>
                <td>
                  <div className="doras-docs-sample" style={typeStyle(t)}>
                    {SAMPLE_TEXT[kind] ?? SAMPLE_TEXT.body}
                  </div>
                  <div className="doras-docs-muted">
                    <Code>{t.values.light.css}</Code>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Unstyled>
  );
}

/** Lengths drawn to scale: spacing as bars, sizes as squares, radii as corners. */
export function ScaleTable({
  tokens,
  draw,
}: {
  tokens: Token[];
  draw: 'bar' | 'square' | 'radius' | 'border' | 'none';
}) {
  const sample = (t: Token): ReactNode => {
    const v = `var(${t.cssVar})`;
    switch (draw) {
      case 'bar':
        return <span className="doras-docs-bar" style={{ inlineSize: v }} />;
      case 'square':
        return (
          <span
            className="doras-docs-bar"
            style={{ inlineSize: `min(${v}, 100%)`, blockSize: `min(${v}, 6rem)` }}
          />
        );
      case 'radius':
        return (
          <span
            className="doras-docs-sample"
            style={{
              display: 'block',
              inlineSize: '6rem',
              blockSize: '3rem',
              borderRadius: v,
              border: '2px solid var(--doras-color-border-emphasis)',
            }}
          />
        );
      case 'border':
        return (
          <span
            style={{
              display: 'block',
              borderBlockStart: `${v} solid currentColor`,
              inlineSize: '6rem',
            }}
          />
        );
      case 'none':
        return null;
    }
  };
  return (
    <Unstyled>
      <table className="doras-docs-table">
        <tbody>
          {tokens.map((t) => (
            <tr key={t.name}>
              <th scope="row" style={{ inlineSize: '16rem' }}>
                <Code>{t.name}</Code>
                {t.description && <div>{t.description}</div>}
                {t.code && <CodeNames code={t.code} />}
              </th>
              <td style={{ inlineSize: '8rem' }}>
                <Code>{t.values.light.css}</Code>
                {t.values.light.aliasOf && (
                  <div className="doras-docs-muted">{breakable(t.values.light.aliasOf)}</div>
                )}
              </td>
              <td>{sample(t)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Unstyled>
  );
}

/**
 * Durations and easings, each with a dot to play. The dots use the real
 * tokens, so with reduced motion on they jump instead of sliding.
 */
export function MotionTable({ tokens }: { tokens: Token[] }) {
  const [moved, setMoved] = useState(false);
  const transition = (t: Token): string =>
    t.type === 'duration'
      ? `inset-inline-start var(${t.cssVar}) var(--doras-motion-easing-standard)`
      : `inset-inline-start var(--doras-motion-duration-slow) var(${t.cssVar})`;
  return (
    <Unstyled>
      <button type="button" className="doras-docs-button" onClick={() => setMoved((m) => !m)}>
        {moved ? 'Play back' : 'Play'}
      </button>
      <table className="doras-docs-table">
        <tbody>
          {tokens.map((t) => (
            <tr key={t.name}>
              <th scope="row" style={{ inlineSize: '16rem' }}>
                <Code>{t.name}</Code>
                {t.description && <div>{t.description}</div>}
                {t.code && <CodeNames code={t.code} />}
              </th>
              <td style={{ inlineSize: '12rem' }}>
                <Code>{t.values.light.css}</Code>
              </td>
              <td>
                <span
                  className="doras-docs-motion-track"
                  data-moved={moved || undefined}
                  style={{ display: 'block' }}
                >
                  <span className="doras-docs-motion-dot" style={{ transition: transition(t) }} />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Unstyled>
  );
}

function LucideIcon({ node, mirror }: { node: IconNode; mirror: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={mirror ? { transform: 'scaleX(-1)' } : undefined}
    >
      {node.map(([tag, attrs], i) => createElement(tag, { key: i, ...attrs }))}
    </svg>
  );
}

/** The Lucide icons Doras uses, with what each means. */
export function IconGrid({ rtl = false }: { rtl?: boolean }) {
  return (
    <Unstyled>
      <div className="doras-docs-grid">
        {ICONS.map((icon) => {
          return (
            <div className="doras-docs-icon" key={icon.name}>
              <LucideIcon node={icon.node} mirror={rtl && Boolean(icon.mirrors)} />
              <code>{icon.name}</code>
              <span>{icon.meaning}</span>
              {icon.mirrors && <span className="doras-docs-muted">Mirrors right to left</span>}
            </div>
          );
        })}
      </div>
    </Unstyled>
  );
}

const LOCALE_NAMES: [Locale, string][] = [
  ['en-GB', 'UK English (source)'],
  ['en-XA', 'Pseudo-locale'],
  ['ar', 'Arabic (test)'],
  ['de', 'German (test)'],
  ['ja', 'Japanese (test)'],
];

// Sample values for placeholders: numbers for plurals and numbers, words for the rest.
const SAMPLE_VALUES: Record<string, string> = {
  provider: 'Bluesky',
  label: 'Passkey',
  handle: 'sam.bsky.social',
};

function sampleValues(message: string): Record<string, string | number> {
  const values: Record<string, string | number> = {};
  const visit = (elements: ReturnType<IntlMessageFormat['getAst']>) => {
    for (const el of elements) {
      if ('options' in el) {
        values[el.value] = 15;
        for (const option of Object.values(el.options)) visit(option.value);
      } else if (el.type === 1) values[el.value] = SAMPLE_VALUES[el.value] ?? 'Sample';
      else if (el.type === 2) values[el.value] = 15;
    }
  };
  visit(new IntlMessageFormat(message, 'en-GB').getAst());
  return values;
}

/** A message formatted with sample values, then as written, if it has placeholders. */
function sample(locale: Locale, key: MessageKey) {
  const message = catalogues[locale][key];
  const formatted = withoutIsolation(format(locale, key, sampleValues(catalogues['en-GB'][key])));
  return (
    <>
      {formatted}
      {formatted !== message && (
        <div dir="ltr">
          <code>{message}</code>
        </div>
      )}
    </>
  );
}

const descriptions = (source as { messages: Record<string, { description: string }> }).messages;

/** Catalogue messages in every locale, as ICU MessageFormat, with their descriptions. */
export function StringsTable({ keys }: { keys: readonly MessageKey[] }) {
  return (
    <Unstyled>
      <table className="doras-docs-table">
        <tbody>
          {keys.map((key) => (
            <tr key={key}>
              <th scope="row" style={{ inlineSize: '16rem' }}>
                <code>{key}</code>
                <div>{descriptions[key]?.description}</div>
              </th>
              <td>
                <dl className="doras-docs-strings">
                  {LOCALE_NAMES.map(([locale, name]) => (
                    <div key={locale}>
                      <dt className="doras-docs-muted">{name}</dt>
                      <dd lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                        {sample(locale, key)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Unstyled>
  );
}

/** Every measurement event, by journey, with when it fires and what it carries. */
export function MeasurementTable() {
  const journeys = [...new Set(measurementEvents.map((e) => e.journey))];
  return (
    <Unstyled>
      {journeys.map((journey) => (
        <section key={journey}>
          <h3 className="doras-docs-subheading">{journey}</h3>
          <table className="doras-docs-table">
            <thead>
              <tr>
                <th scope="col">Event</th>
                <th scope="col">When</th>
                <th scope="col">Carries</th>
              </tr>
            </thead>
            <tbody>
              {measurementEvents
                .filter((e) => e.journey === journey)
                .map((e) => (
                  <tr key={e.name}>
                    <th scope="row" style={{ inlineSize: '16rem' }}>
                      <code>{e.name}</code>
                    </th>
                    <td>{e.when}</td>
                    <td>
                      {Object.entries(e.carries).length
                        ? Object.entries(e.carries).map(([k, v]) => (
                            <div key={k}>
                              <code>{k}</code>: {v.description}{' '}
                              <span className="doras-docs-muted">
                                {v.values
                                  ? v.values.join(', ')
                                  : v.type === 'integer'
                                    ? 'a count'
                                    : 'true or false'}
                              </span>
                            </div>
                          ))
                        : 'Nothing'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
      ))}
    </Unstyled>
  );
}
