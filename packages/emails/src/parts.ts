// The parts every email is made of (#17): the head, with dark mode; the
// provider's identity; a heading; paragraphs; the facts, with a code in
// them; a button; and the footer. Each returns MJML.
import { DIRECTIONS, type Locale } from '@doras/i18n';
import { escape } from './text.ts';
import { palette, px, type, typeValue } from './tokens.ts';

const light = palette('light');
const dark = palette('dark');
const body = typeValue('body.md');
const family = body.fontFamily.map((f) => (/\s/.test(f) ? `'${f}'` : f)).join(', ');

/** Text starts on the left, or on the right in a right-to-left language. */
export const startOf = (locale: Locale): 'left' | 'right' =>
  DIRECTIONS[locale] === 'rtl' ? 'right' : 'left';

/**
 * Dark mode, for the email apps that follow the system's (Apple Mail,
 * Outlook on Mac and phones). Outlook.com marks its dark mode with
 * data-ogsc and data-ogsb instead of the media query.
 */
function darkMode(): string {
  const backgrounds = (p: string) => `
    ${p}.doras-page, ${p}.doras-page > div { background-color: ${dark['surface.subtle']} !important; }
    ${p}.doras-card > table, ${p}.doras-card > table > tbody > tr > td { background-color: ${dark['surface.raised']} !important; border-color: ${dark['border.default']} !important; }
    ${p}.doras-button td, ${p}.doras-button a { background-color: ${dark['action.primary.surface']} !important; border-color: ${dark['action.primary.border']} !important; }`;
  const colours = (p: string) => `
    ${p}.doras-text div, ${p}.doras-text h1, ${p}.doras-text th, ${p}.doras-text td { color: ${dark['text.default']} !important; }
    ${p}.doras-fine div, ${p}.doras-text th, ${p}.doras-subtle { color: ${dark['text.subtle']} !important; }
    ${p}.doras-fine a, ${p}.doras-text a { color: ${dark['link.text']} !important; }
    ${p}.doras-button a { color: ${dark['action.primary.text']} !important; }`;
  return `@media (prefers-color-scheme: dark) {${backgrounds('')}${colours('')}
  }${backgrounds('[data-ogsb] ')}${colours('[data-ogsc] ')}`;
}

export function head(subject: string, preview: string): string {
  return `<mj-head>
    <mj-title>${escape(subject)}</mj-title>
    <mj-preview>${escape(preview)}</mj-preview>
    <mj-raw>
      <meta name="color-scheme" content="light dark" />
      <meta name="supported-color-schemes" content="light dark" />
    </mj-raw>
    <mj-attributes>
      <mj-all font-family="${escape(family)}" />
      <mj-text color="${light['text.default']}" font-size="${body.fontSize.value}px" line-height="${body.lineHeight}" padding="0 0 ${px('space.stack.md')}" />
      <mj-section padding="0" />
      <mj-column padding="0" />
    </mj-attributes>
    <mj-style>${darkMode()}</mj-style>
  </mj-head>`;
}

/** The provider's identity, above the card: its name, and that it's an Atmosphere provider. */
export function header(locale: Locale, provider: string, label: string): string {
  const align = startOf(locale);
  return `<mj-section padding="${px('space.inset.lg')} ${px('space.inset.md')}">
    <mj-column>
      <mj-text css-class="doras-text" align="${align}" padding="0">
        <p style="margin:0;${type('label.lg')}"><span dir="auto">${escape(provider)}</span></p>
        <p class="doras-subtle" style="margin:0;color:${light['text.subtle']};${type('caption')}">${escape(label)}</p>
      </mj-text>
    </mj-column>
  </mj-section>`;
}

/** The card the message sits in. */
export function card(content: string): string {
  return `<mj-section css-class="doras-card" background-color="${light['surface.raised']}" border="${px('border-width.default')} solid ${light['border.default']}" border-radius="${px('radius.card')}" padding="${px('space.inset.xl')} ${px('space.inset.lg')}">
    <mj-column>${content}</mj-column>
  </mj-section>`;
}

/** The one heading: a real h1. */
export function heading(locale: Locale, text: string): string {
  return `<mj-text css-class="doras-text" align="${startOf(locale)}"><h1 style="margin:0;${type('heading.lg')}">${text}</h1></mj-text>`;
}

/** A paragraph. Its text is HTML from text.ts, already escaped. */
export function paragraph(locale: Locale, text: string, fine = false): string {
  return `<mj-text css-class="${fine ? 'doras-fine' : 'doras-text'}" align="${startOf(locale)}"${
    fine ? ` color="${light['text.subtle']}"` : ''
  }><p style="margin:0;${type(fine ? 'caption' : 'body.md')}">${text}</p></mj-text>`;
}

export interface Fact {
  label: string;
  /** HTML, already escaped. */
  value: string;
  code?: boolean;
}

/**
 * The facts, as a real table: each label is a row header. A code is large,
 * spaced and left to right, digit by digit for screen readers.
 */
export function facts(locale: Locale, list: Fact[]): string {
  const align = startOf(locale);
  const rows = list
    .map(
      (f) => `<tr>
        <th scope="row" style="padding:${px('space.inset.sm')} 0;text-align:${align};vertical-align:middle;font-weight:400;color:${light['text.subtle']};${type('body.sm')}">${escape(f.label)}</th>
        <td style="padding:${px('space.inset.sm')} 0;text-align:${align};vertical-align:middle;color:${light['text.default']};${
          f.code ? type('code') : `${type('label.lg')}`
        }"${f.code ? ' dir="ltr"' : ''}>${f.value}</td>
      </tr>`,
    )
    .join('');
  return `<mj-table css-class="doras-text" padding="0 0 ${px('space.stack.lg')}" width="100%" cellpadding="0" cellspacing="0" border="none">${rows}</mj-table>`;
}

/** A button: a link styled as one, with the address in full under it for apps that hide buttons. */
export function button(locale: Locale, label: string, href: string): string {
  return `<mj-button css-class="doras-button" href="${escape(href)}" align="${startOf(locale)}" background-color="${light['action.primary.surface']}" color="${light['action.primary.text']}" border="${px('border-width.default')} solid ${light['action.primary.border']}" border-radius="${px('radius.control')}" font-size="${typeValue('label.lg').fontSize.value}px" font-weight="${typeValue('label.lg').fontWeight}" inner-padding="${px('space.inset.sm')} ${px('space.inset.lg')}" padding="0 0 ${px('space.stack.md')}">${escape(label)}</mj-button>`;
}

/** The footer, under the card: why the email came, and who sent it. */
export function footer(locale: Locale, lines: string[]): string {
  return `<mj-section padding="${px('space.inset.lg')} ${px('space.inset.md')}">
    <mj-column>${lines.map((line) => paragraph(locale, line, true)).join('')}</mj-column>
  </mj-section>`;
}

/** The whole email. */
export function email(locale: Locale, parts: { head: string; body: string[] }): string {
  return `<mjml lang="${locale}" dir="${DIRECTIONS[locale]}">
  ${parts.head}
  <mj-body css-class="doras-page" background-color="${light['surface.subtle']}" width="560px">
    ${parts.body.join('\n')}
  </mj-body>
</mjml>`;
}
