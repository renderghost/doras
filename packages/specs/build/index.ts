// Validates the specs and writes the package: specs and measurement events
// as JavaScript, with types generated from the schema and each spec.
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { render } from './generate.ts';
import {
  checkSpecs,
  measurementProblems,
  readKnown,
  readMeasurementEvents,
  readSpecs,
  type MeasurementEvent,
} from './specs.ts';

async function build(): Promise<void> {
  const list = readMeasurementEvents();
  const problems = measurementProblems(list);
  const events = problems.length ? [] : (list as { events: MeasurementEvent[] }).events;
  const specs = readSpecs();
  problems.push(...checkSpecs(specs, readKnown(events)));
  if (problems.length) {
    throw new Error(`The specs have ${problems.length} problem(s):\n- ${problems.join('\n- ')}`);
  }
  const { js, dts } = await render(specs, events);
  const out = fileURLToPath(new URL('../dist/', import.meta.url));
  mkdirSync(out, { recursive: true });
  writeFileSync(`${out}index.js`, js);
  writeFileSync(`${out}index.d.ts`, dts);
  console.log(`Checked ${specs.size} spec(s) and ${events.length} measurement events.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await build();
