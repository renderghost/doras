// The docs page template. A component whose meta has parameters.doras.spec
// gets every section, from overview to evidence. Anything else gets
// Storybook's usual page.
import {
  ArgTypes,
  Controls,
  Description,
  Heading,
  Primary,
  Stories,
  Subtitle,
  Title,
  useOf,
} from '@storybook/addon-docs/blocks';
import type { ReactNode } from 'react';
import { StringsTable, TokenTable } from './blocks.tsx';
import type { ComponentSpec } from './spec.ts';
import { token } from './tokens.ts';
import './docs.css';

function List({ items }: { items: ReactNode[] }) {
  return (
    <ul>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
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

export function SpecSections({ spec }: { spec: ComponentSpec }) {
  const ui = spec.events.filter((e) => e.kind === 'ui');
  const measurement = spec.events.filter((e) => e.kind === 'measurement');
  const eventTable = (events: ComponentSpec['events']) => (
    <table className="doras-docs-table">
      <thead>
        <tr>
          <th scope="col">Event</th>
          <th scope="col">When</th>
          <th scope="col">Detail</th>
        </tr>
      </thead>
      <tbody>
        {events.map((e) => (
          <tr key={e.name}>
            <th scope="row">
              <code>{e.name}</code>
            </th>
            <td>{e.when}</td>
            <td>{e.detail ? <code>{e.detail}</code> : 'None'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <>
      <p>{spec.summary}</p>
      <p className="doras-docs-muted">
        <code>{`<${spec.tag}>`}</code> · {spec.group}
      </p>

      <Section title="Overview">
        <Primary />
        <Controls />
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
      </Section>

      <Section title="Anatomy">
        <ol>
          {spec.anatomy.map((a) => (
            <li key={a.part}>
              <strong>{a.part}:</strong> {a.description}
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
        <Stories title="" includePrimary={false} />
      </Section>

      <Section title="Props and events">
        <ArgTypes />
        <h3>Events</h3>
        {ui.length ? eventTable(ui) : <p>None.</p>}
        <h3>Measurement events</h3>
        <p>
          Shared names for sign-in moments that apps can count. Nothing personal is included, and
          Doras never sends them anywhere.
        </p>
        {measurement.length ? eventTable(measurement) : <p>None.</p>}
      </Section>

      <Section title="Accessibility">
        <p>
          <strong>Role:</strong> {spec.accessibility.role}
          <br />
          <strong>Accessible name:</strong> {spec.accessibility.name}
        </p>
        <h3>Keyboard</h3>
        <table className="doras-docs-table">
          <thead>
            <tr>
              <th scope="col">Keys</th>
              <th scope="col">What happens</th>
            </tr>
          </thead>
          <tbody>
            {spec.accessibility.keyboard.map((k) => (
              <tr key={k.keys}>
                <th scope="row">
                  <kbd>{k.keys}</kbd>
                </th>
                <td>{k.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3>Screen readers</h3>
        <List items={spec.accessibility.screenReader} />
        {spec.accessibility.notes && (
          <>
            <h3>Notes</h3>
            <List items={spec.accessibility.notes} />
          </>
        )}
      </Section>

      <Section title="Tokens">
        <TokenTable tokens={spec.tokens.map(token)} code={false} />
      </Section>

      <Section title="Content">
        <List items={spec.content.guidelines} />
        <h3>Strings</h3>
        <StringsTable keys={spec.content.strings} />
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

export function DocsPage() {
  const meta = useOf('meta', ['meta']);
  const spec = (meta.preparedMeta.parameters as { doras?: { spec?: ComponentSpec } }).doras?.spec;
  return (
    <>
      <Title />
      {spec ? (
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
