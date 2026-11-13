// The docs page template. A component whose meta has parameters.doras.spec
// gets every section, from overview to evidence. A spec whose component
// isn't built yet gets the same page without the live examples.
import { measurementEvents } from '@doras/specs';
import {
  Controls,
  Description,
  Heading,
  Primary,
  Source,
  Stories,
  Subtitle,
  Title,
  useOf,
} from '@storybook/addon-docs/blocks';
import type { ReactNode } from 'react';
import { StringsTable, TokenTable } from './blocks.tsx';
import { MOCK_WARNING, type MockDocs } from './mock.ts';
import type { ComponentSpec } from './spec.ts';
import { token } from './tokens.ts';
import './docs.css';

function List({ items }: { items: ReactNode[] }) {
  if (!items.length) return <p>None.</p>;
  return (
    <ul>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

type ScreenReaderResult = NonNullable<
  ComponentSpec['accessibility']['screenReaderResults']
>[number];

/** The setups every component is tested with by hand (#19), in this order. */
const SCREEN_READERS: Record<ScreenReaderResult['setup'], string> = {
  'voiceover-safari-macos': 'VoiceOver, Safari, macOS',
  'voiceover-safari-ios': 'VoiceOver, Safari, iOS',
  'nvda-firefox-windows': 'NVDA, Firefox, Windows',
  'nvda-chrome-windows': 'NVDA, Chrome, Windows',
  'talkback-chrome-android': 'TalkBack, Chrome, Android',
};

const RESULTS: Record<ScreenReaderResult['result'], string> = {
  works: 'Works',
  'works-with-notes': 'Works, with notes',
  problems: 'Problems',
};

/** Each setup's result, or “Not yet tested”: a gap shows rather than hides. */
function ScreenReaderResults({ results = [] }: { results?: ScreenReaderResult[] }) {
  const rows = Object.entries(SCREEN_READERS).map(([setup, label]) => {
    const found = results.find((r) => r.setup === setup);
    if (!found) return [label, 'Not yet tested', '', ''];
    return [
      label,
      RESULTS[found.result],
      <>
        {found.date}
        <br />
        <span className="doras-docs-muted">{found.versions}</span>
      </>,
      <>
        {found.notes?.join(' ')}
        {found.issue && (
          <>
            {' '}
            <a href={found.issue}>Issue</a>
          </>
        )}
      </>,
    ];
  });
  return (
    <>
      <Table head={['Screen reader', 'Result', 'Tested', 'Notes']} rows={rows} />
      <p className="doras-docs-muted">
        Tested by hand, following the screen reader testing guide in the repository. See the{' '}
        <a href="?path=/docs/accessibility-statement--docs">accessibility statement</a>.
      </p>
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="doras-docs-section">
      <Heading>{title}</Heading>
      {children}
    </section>
  );
}

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <table className="doras-docs-table doras-docs-api">
      <thead>
        <tr>
          {head.map((h) => (
            <th scope="col" key={h}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(([first, ...rest], i) => (
          <tr key={i}>
            <th scope="row">{first}</th>
            {rest.map((cell, j) => (
              <td key={j}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PropsTable({ spec }: { spec: ComponentSpec }) {
  return (
    <Table
      head={['Prop', 'Values', 'Default', 'What it does']}
      rows={spec.props.map((p) => [
        <code key="n">{p.name}</code>,
        p.type === 'enum' ? (
          <ul className="doras-docs-values">
            {(p.values ?? []).map((v) => (
              <li key={v.value}>
                <code>{v.value}</code>: {v.description}
              </li>
            ))}
          </ul>
        ) : (
          p.type
        ),
        p.default === undefined ? (
          p.required ? (
            'Required'
          ) : (
            'None'
          )
        ) : (
          <code>{JSON.stringify(p.default)}</code>
        ),
        p.description,
      ])}
    />
  );
}

function EventsTables({ spec }: { spec: ComponentSpec }) {
  const ui = spec.events.filter((e) => e.kind === 'ui');
  const measured = spec.events.filter((e) => e.kind === 'measurement');
  return (
    <>
      <h3>Events</h3>
      {ui.length ? (
        <Table
          head={['Event', 'When', 'Carries']}
          rows={ui.map((e) => [
            <code key="n">{e.name}</code>,
            e.when,
            'detail' in e && e.detail
              ? Object.entries(e.detail).map(([k, v]) => (
                  <div key={k}>
                    <code>
                      {k}: {v.type}
                    </code>{' '}
                    {v.description}
                  </div>
                ))
              : 'Nothing',
          ])}
        />
      ) : (
        <p>None.</p>
      )}
      <h3>Measurement events</h3>
      <p>
        Shared names for sign-in moments that apps can count, sent as <code>doras-measure</code>{' '}
        events. Nothing personal is included, and Doras never sends them anywhere.
      </p>
      {measured.length ? (
        <Table
          head={['Event', 'When', 'Carries']}
          rows={measured.map((e) => {
            const listed = measurementEvents.find((m) => m.name === e.name);
            const carries = Object.entries(listed?.carries ?? {});
            return [
              <code key="n">{e.name}</code>,
              e.when,
              carries.length
                ? carries.map(([k, v]) => (
                    <div key={k}>
                      <code>{k}</code>: {v.values ? v.values.join(', ') : v.type}
                    </div>
                  ))
                : 'Nothing',
            ];
          })}
        />
      ) : (
        <p>None.</p>
      )}
    </>
  );
}

export function SpecSections({ spec, live = true }: { spec: ComponentSpec; live?: boolean }) {
  const web = spec.platforms.web;
  const a11y = spec.accessibility;
  return (
    <>
      <p>{spec.summary}</p>
      <p className="doras-docs-muted">
        <code>{`<${web.tag}>`}</code> · {spec.group}
      </p>

      <Section title="Overview">
        {live ? (
          <>
            <Primary />
            <Controls />
          </>
        ) : (
          <p className="doras-docs-note">
            This component isn't built yet. This page is generated from its spec, which the build
            implements.
          </p>
        )}
      </Section>

      <Section title="When to use it">
        <List items={spec.usage.when} />
        <h3>When not to</h3>
        <List
          items={spec.usage.whenNot.map((w) => (
            <>
              {w.text}
              {w.instead && <> Use {w.instead} instead.</>}
            </>
          ))}
        />
        <h3>Related components</h3>
        <List
          items={spec.related.map((r) => (
            <>
              <strong>{r.component}:</strong> {r.relationship}
            </>
          ))}
        />
      </Section>

      <Section title="Anatomy">
        <ol>
          {spec.anatomy.map((a) => (
            <li key={a.part}>
              <strong>{a.part}</strong>
              {a.optional && ' (optional)'}: {a.description}
            </li>
          ))}
        </ol>
      </Section>

      <Section title="States">
        <List
          items={spec.states.map((s) => (
            <>
              <strong>{s.name}:</strong> {s.description}
            </>
          ))}
        />
        {live && <Stories title="Every state" includePrimary={false} />}
      </Section>

      <Section title="Props and events">
        <PropsTable spec={spec} />
        <EventsTables spec={spec} />
        <h3>On the web</h3>
        <p>
          <code>{`<${web.tag}>`}</code>
          {web.formAssociated ? ' takes part in forms, as native buttons and inputs do.' : '.'}{' '}
          Props are properties, and kebab-case attributes.
        </p>
        {web.slots.length > 0 && (
          <Table
            head={['Slot', 'What goes in it']}
            rows={web.slots.map((s) => [
              s.name ? <code key="n">{s.name}</code> : 'Default',
              s.description,
            ])}
          />
        )}
      </Section>

      <Section title="Accessibility">
        <p>
          <strong>Role:</strong> {a11y.role}
          <br />
          <strong>Accessible name:</strong> {a11y.name}
        </p>
        <h3>Keyboard</h3>
        <Table
          head={['Keys', 'What happens']}
          rows={a11y.keyboard.map((k) => [<kbd key="k">{k.keys}</kbd>, k.action])}
        />
        <h3>Screen readers</h3>
        <List items={a11y.screenReader} />
        <h3>Screen reader results</h3>
        <ScreenReaderResults results={a11y.screenReaderResults} />
        {a11y.announcements && (
          <>
            <h3>Announcements</h3>
            <List items={a11y.announcements} />
          </>
        )}
        {a11y.notes && (
          <>
            <h3>Notes</h3>
            <List items={a11y.notes} />
          </>
        )}
      </Section>

      <Section title="Tokens">
        <TokenTable tokens={spec.tokens.map(token)} code={false} />
      </Section>

      <Section title="Content">
        <List items={spec.content.guidelines} />
        <h3>Strings</h3>
        {spec.strings.length ? (
          <StringsTable keys={spec.strings as Parameters<typeof StringsTable>[0]['keys']} />
        ) : (
          <p>It shows no strings of its own: its text comes from the app.</p>
        )}
        {spec.content.terms && (
          <>
            <h3>Words it uses</h3>
            <dl>
              {spec.content.terms.map((t) => (
                <div key={t.term}>
                  <dt>
                    <strong>{t.term}</strong>
                  </dt>
                  <dd>{t.meaning}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </Section>

      <Section title="Do and don't">
        {spec.dosAndDonts.map((d, i) => (
          <div className="doras-docs-pair" key={i} style={{ marginBlockEnd: '1rem' }}>
            <div className="doras-docs-do">
              <strong>Do</strong>
              <p>{d.do}</p>
            </div>
            <div className="doras-docs-dont">
              <strong>Don't</strong>
              <p>{d.dont}</p>
            </div>
          </div>
        ))}
      </Section>

      <Section title="Evidence and decisions">
        <List
          items={spec.evidence.map((e) => (
            <>
              {e.point}
              {e.source && (
                <>
                  {' '}
                  (<a href={e.source.href}>{e.source.label}</a>)
                </>
              )}
            </>
          ))}
        />
      </Section>
    </>
  );
}

/** A browser mock's page: what the browser draws, and what makes it. */
function MockSections({ mock }: { mock: MockDocs }) {
  return (
    <>
      <p className="doras-docs-mock" role="note">
        {MOCK_WARNING}
      </p>
      <p>{mock.summary}</p>
      <p className="doras-docs-muted">
        <code>{`<${mock.tag}>`}</code> · <code>@doras/browser-mocks</code>, which is never published
      </p>

      <Section title="Overview">
        <Primary />
      </Section>

      <Section title="What makes the browser show it">
        <p>
          Apps never draw this. They call the browser, and the browser draws its own. Front Door
          makes these calls for you.
        </p>
        {mock.triggers.map((trigger) => (
          <div key={trigger.api}>
            <h3 className="doras-docs-subheading">{trigger.api}</h3>
            <p>{trigger.when}</p>
            <Source language="jsx" code={trigger.code} />
            <p>
              <a href={trigger.href}>More about {trigger.api}</a>
            </p>
          </div>
        ))}
      </Section>

      <Section title="In the flows">
        <p>The clickable flows listen for these events, as a page would wait for the browser.</p>
        <Table
          head={['Event', 'When']}
          rows={mock.events.map((event) => [
            <code key={event.name}>{event.name}</code>,
            event.when,
          ])}
        />
        {mock.notes && <List items={mock.notes} />}
        <Stories title="Every state" includePrimary={false} />
      </Section>
    </>
  );
}

export function DocsPage() {
  const meta = useOf('meta', ['meta']);
  const doras = (
    meta.preparedMeta.parameters as { doras?: { spec?: ComponentSpec; mock?: MockDocs } }
  ).doras;
  const spec = doras?.spec;
  return (
    <>
      <Title />
      {doras?.mock ? (
        <MockSections mock={doras.mock} />
      ) : spec ? (
        <SpecSections spec={spec} />
      ) : (
        <>
          <Subtitle />
          <Description />
          <Primary />
          <Controls />
          <Stories />
        </>
      )}
    </>
  );
}
