// Renders an email to HTML, with its subject and plain text (#17). For
// providers' servers: MJML runs in Node.
import mjml2html from 'mjml';
import { recovery, welcome, type Built, type RecoveryEmail, type WelcomeEmail } from './emails.ts';

export interface Rendered {
  subject: string;
  preview: string;
  html: string;
  text: string;
}

async function compile(built: Built): Promise<Rendered> {
  // fonts: {} stops MJML adding Google Fonts for fonts in the stack, such
  // as Roboto. Emails load no fonts: the stack falls back to the system's.
  const result = await mjml2html(built.mjml, {
    validationLevel: 'strict',
    keepComments: false,
    fonts: {},
  });
  if (result.errors.length) {
    throw new Error(result.errors.map((e) => e.formattedMessage).join('\n'));
  }
  return { subject: built.subject, preview: built.preview, html: result.html, text: built.text };
}

/** The recovery email: the handle and a sign-in code, never a link. */
export const renderRecovery = (email: RecoveryEmail): Promise<Rendered> => compile(recovery(email));

/** The welcome email: confirm the address, and keep the handle. */
export const renderWelcome = (email: WelcomeEmail): Promise<Rendered> => compile(welcome(email));
