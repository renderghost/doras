// The email HTML check (#17): what makes an email work in Outlook, Gmail
// and Apple Mail, and work for everyone. The build runs it on every sample,
// and fails on any problem.
import { parseDocument } from 'htmlparser2';

interface Node {
  type: string;
  name?: string;
  data?: string;
  attribs?: Record<string, string>;
  children?: Node[];
  parent?: Node | null;
}

/** CSS that email apps don't support, or support too unevenly to rely on. */
const UNSUPPORTED: [RegExp, string][] = [
  [/var\(/i, 'CSS custom properties'],
  [/calc\(/i, 'calc()'],
  [/clamp\(/i, 'clamp()'],
  [/display\s*:\s*(inline-)?(flex|grid)/i, 'flex or grid layout'],
  [/(^|[;\s])position\s*:/i, 'positioning'],
  [/(^|[;\s])gap\s*:/i, 'gap'],
  [/@import/i, '@import'],
  [/@font-face/i, 'web fonts'],
];

export interface CheckOptions {
  /** The recovery email has no links at all. */
  links: 'none' | 'allowed';
  /** The email's language, which sets whether it must be right to left. */
  locale: string;
}

const MAX_BYTES = 102 * 1024;

export function checkEmail(html: string, { links, locale }: CheckOptions): string[] {
  const problems: string[] = [];
  const doc = parseDocument(html) as unknown as Node;
  const all: Node[] = [];
  const walk = (n: Node) => {
    all.push(n);
    n.children?.forEach(walk);
  };
  walk(doc);
  // The parser gives <style> and <script> types of their own.
  const tags = (name: string) =>
    all.filter((n) => ['tag', 'style', 'script'].includes(n.type) && n.name === name);

  const root = tags('html')[0];
  if (!root?.attribs?.lang) problems.push('<html> has no lang attribute.');
  else if (root.attribs.lang !== locale)
    problems.push(`<html lang> is ${root.attribs.lang}, not ${locale}.`);
  if (locale === 'ar' && root?.attribs?.dir !== 'rtl')
    problems.push('An Arabic email must be dir="rtl".');

  const h1s = tags('h1').length;
  if (h1s !== 1) problems.push(`There should be one <h1>, and there are ${h1s}.`);

  for (const img of tags('img')) {
    if (img.attribs?.alt === undefined)
      problems.push(`An image has no alt text: ${img.attribs?.src ?? ''}`);
  }

  for (const name of ['script', 'form', 'iframe']) {
    if (tags(name).length) problems.push(`Emails can't use <${name}>.`);
  }

  const anchors = tags('a').filter((a) => a.attribs?.href);
  if (links === 'none' && anchors.length) {
    problems.push(`This email must have no links, and has ${anchors.length}.`);
  }
  for (const a of anchors) {
    if (!/(^|;)\s*color\s*:/i.test(a.attribs?.style ?? '')) {
      problems.push(
        `A link has no inline colour, so apps would show their own: ${a.attribs?.href}`,
      );
    }
  }

  const styles = [
    ...all.filter((n) => n.attribs?.style).map((n) => n.attribs?.style ?? ''),
    ...tags('style').map((s) => s.children?.map((c) => c.data ?? '').join('') ?? ''),
  ];
  for (const [pattern, what] of UNSUPPORTED) {
    if (styles.some((s) => pattern.test(s))) problems.push(`Unsupported CSS: ${what}.`);
  }

  // Every piece of text gets its colour and font inline, not only from a
  // stylesheet in the head, which some apps strip.
  const body = tags('body')[0];
  const inline = (n: Node, property: RegExp): boolean => {
    for (let p: Node | null | undefined = n.parent; p && p !== body?.parent; p = p.parent) {
      if (property.test(p.attribs?.style ?? '')) return true;
    }
    return false;
  };
  // The inbox preview is hidden on purpose, so it needn't be styled.
  const texts = all.filter(
    (n) =>
      n.type === 'text' &&
      (n.data ?? '').trim() &&
      !['style', 'title', 'script'].includes(n.parent?.name ?? '') &&
      !inline(n, /display\s*:\s*none/i),
  );
  for (const t of texts) {
    if (!body || !isInside(t, body)) continue;
    if (!inline(t, /(^|;)\s*color\s*:/i))
      problems.push(`Text without an inline colour: “${(t.data ?? '').trim().slice(0, 40)}”`);
    else if (!inline(t, /font-family\s*:/i))
      problems.push(`Text without an inline font: “${(t.data ?? '').trim().slice(0, 40)}”`);
  }

  const bytes = new TextEncoder().encode(html).length;
  if (bytes > MAX_BYTES)
    problems.push(`It's ${Math.round(bytes / 1024)}KB; Gmail clips emails over 102KB.`);

  return [...new Set(problems)];
}

function isInside(n: Node, ancestor: Node): boolean {
  for (let p = n.parent; p; p = p.parent) if (p === ancestor) return true;
  return false;
}
