// What ships must work in every supported browser (#18): the last two
// Chrome, Edge, Firefox and Samsung Internet, and Safari from 16.4. These
// are the features newer than that, found in the components and the token
// CSS. A feature that only improves things where it's supported is allowed.
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = resolve(import.meta.dirname, '..', '..', '..');

const TOO_NEW: [RegExp, string][] = [
  [/light-dark\(/, 'light-dark(): Safari 17.5'],
  [/@starting-style/, '@starting-style: Safari 17.5'],
  [/field-sizing/, 'field-sizing: not in Safari'],
  [/@scope\b/, '@scope: Safari 17.4'],
  [/anchor-name|position-anchor|\banchor\(/, 'anchor positioning: Safari 26'],
  [/:user-(in)?valid/, ':user-invalid: Safari 16.5'],
  [/interpolate-size/, 'interpolate-size: not in Safari'],
  [/scrollbar-gutter/, 'scrollbar-gutter: Safari 18.2'],
  [/content-visibility/, 'content-visibility: Safari 18'],
  [/text-box(-trim|-edge)?\s*:/, 'text-box: Safari 18.2'],
  [/@container\s+style\(/, 'style queries: Safari 18'],
  [/\bpopover\b|showPopover/, 'popover: Safari 17'],
  [/^\s*&[:.\s[>+~]/m, 'CSS nesting: Safari 16.5'],
  [/\.requestClose\(/, 'dialog.requestClose(): Safari 18.4'],
  [/Promise\.withResolvers/, 'Promise.withResolvers: Safari 17.4'],
  [/Object\.groupBy|Map\.groupBy/, 'groupBy: Safari 17.4'],
  [/checkVisibility/, 'checkVisibility(): Safari 17.4'],
  [/\.(union|intersection|symmetricDifference|isSubsetOf)\(/, 'Set methods: Safari 17'],
];

/** Fine where unsupported: browsers that lack them just skip them. */
const ENHANCEMENTS = [/text-wrap:\s*(balance|pretty)/];

function* files(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* files(path);
    else if (/\.(ts|css)$/.test(entry.name)) yield path;
  }
}

const shipped = [
  ...files(join(ROOT, 'packages/components/src')),
  join(ROOT, 'packages/tokens/dist/css/doras.css'),
].map((file) => ({ file: file.slice(ROOT.length + 1), text: readFileSync(file, 'utf8') }));

describe('what ships', () => {
  it.each(TOO_NEW)('never uses %s', (pattern, what) => {
    const users = shipped
      .filter(({ text }) => pattern.test(ENHANCEMENTS.reduce((t, e) => t.replace(e, ''), text)))
      .map(({ file }) => file);
    expect(users, what).toEqual([]);
  });
});
