// The two emails providers send (#17). The recovery email has the handle
// and a sign-in code, never a link. The welcome email asks to confirm the
// address, and gives the handle to keep. Each has a plain-text version.
import { formatCode, isolate, type Locale } from '@doras/i18n';
import { button, card, email, facts, footer, head, header, heading, paragraph } from './parts.ts';
import { escape, html, plain, spokenCode } from './text.ts';

/** Who the email is to, and who sends it. */
interface Common {
  locale: Locale;
  /** The person's first name. */
  name: string;
  /** Their handle, without an @. */
  handle: string;
  /** Their email address. */
  email: string;
  /** The app they were signing in to or joined from. */
  app: string;
  /** The provider that hosts the account, and sends the email. */
  provider: string;
}

export interface RecoveryEmail extends Common {
  /** The sign-in code. */
  code: string;
  /** How long the code works, in minutes. */
  minutes: number;
}

export interface WelcomeEmail extends Common {
  /** Where the confirm button goes. */
  confirmUrl: string;
}

export interface Built {
  subject: string;
  preview: string;
  mjml: string;
  text: string;
}

const handleHtml = (handle: string) => `<span dir="ltr">@${escape(handle)}</span>`;

export function recovery(e: RecoveryEmail): Built {
  const { locale } = e;
  const subject = plain(locale, 'email.recovery.subject');
  const preview = plain(locale, 'email.recovery.preview', {
    handle: `@${e.handle}`,
    code: formatCode(e.code),
  });
  const values = { app: { text: e.app, strong: true }, provider: e.provider };
  const mjml = email(locale, {
    head: head(subject, preview),
    body: [
      header(locale, e.provider, plain(locale, 'provider.label')),
      card(
        [
          heading(locale, html(locale, 'email.recovery.subject')),
          paragraph(locale, html(locale, 'email.greeting', { name: e.name })),
          paragraph(locale, html(locale, 'email.recovery.intro', values)),
          facts(locale, [
            { label: plain(locale, 'email.handleLabel'), value: handleHtml(e.handle) },
            {
              label: plain(locale, 'email.recovery.codeLabel'),
              value: spokenCode(e.code),
              code: true,
            },
          ]),
          paragraph(
            locale,
            `${html(locale, 'email.recovery.codeLifetime', { minutes: e.minutes })} ${html(locale, 'email.recovery.next', values)}`,
          ),
          paragraph(locale, html(locale, 'email.recovery.noLinks')),
          paragraph(locale, html(locale, 'email.recovery.ignore')),
          paragraph(locale, html(locale, 'email.signoff', { provider: e.provider })),
        ].join('\n'),
      ),
      footer(locale, [html(locale, 'email.recovery.why', { email: { text: e.email, ltr: true } })]),
    ],
  });
  const text = [
    subject,
    '',
    plain(locale, 'email.greeting', { name: e.name }),
    '',
    plain(locale, 'email.recovery.intro', { app: e.app }),
    '',
    `${plain(locale, 'email.handleLabel')}: ${isolate(`@${e.handle}`)}`,
    `${plain(locale, 'email.recovery.codeLabel')}: ${isolate(spokenCode(e.code))}`,
    '',
    `${plain(locale, 'email.recovery.codeLifetime', { minutes: e.minutes })} ${plain(locale, 'email.recovery.next', { app: e.app, provider: e.provider })}`,
    '',
    plain(locale, 'email.recovery.noLinks'),
    '',
    plain(locale, 'email.recovery.ignore'),
    '',
    plain(locale, 'email.signoff', { provider: e.provider }),
    '',
    '--',
    plain(locale, 'email.recovery.why', { email: e.email }),
  ].join('\n');
  return { subject, preview, mjml, text };
}

export function welcome(e: WelcomeEmail): Built {
  const { locale } = e;
  const subject = plain(locale, 'email.welcome.subject');
  const preview = plain(locale, 'email.welcome.preview', { app: e.app });
  const url = { text: e.confirmUrl, href: e.confirmUrl };
  const mjml = email(locale, {
    head: head(subject, preview),
    body: [
      header(locale, e.provider, plain(locale, 'provider.label')),
      card(
        [
          heading(locale, html(locale, 'email.welcome.heading')),
          paragraph(locale, html(locale, 'email.greeting', { name: e.name })),
          paragraph(locale, html(locale, 'email.welcome.ready', { provider: e.provider })),
          button(locale, plain(locale, 'email.welcome.confirm'), e.confirmUrl),
          paragraph(locale, html(locale, 'email.welcome.fallback', { url }), true),
          facts(locale, [
            { label: plain(locale, 'email.handleLabel'), value: handleHtml(e.handle) },
          ]),
          paragraph(locale, html(locale, 'email.welcome.everywhere', { app: e.app })),
          paragraph(locale, html(locale, 'email.signoff', { provider: e.provider })),
        ].join('\n'),
      ),
      footer(locale, [html(locale, 'email.welcome.why', { provider: e.provider })]),
    ],
  });
  const text = [
    subject,
    '',
    plain(locale, 'email.greeting', { name: e.name }),
    '',
    plain(locale, 'email.welcome.ready', { provider: e.provider }),
    '',
    `${plain(locale, 'email.welcome.confirm')}: ${isolate(e.confirmUrl)}`,
    '',
    `${plain(locale, 'email.handleLabel')}: ${isolate(`@${e.handle}`)}`,
    '',
    plain(locale, 'email.welcome.everywhere', { app: e.app }),
    '',
    plain(locale, 'email.signoff', { provider: e.provider }),
    '',
    '--',
    plain(locale, 'email.welcome.why', { provider: e.provider }),
  ].join('\n');
  return { subject, preview, mjml, text };
}
