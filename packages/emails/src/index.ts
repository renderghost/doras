// @doras/emails: the emails providers send (#17), built with MJML from the
// same tokens and strings as the components, each with a plain-text version.
export { checkEmail, type CheckOptions } from './check.ts';
export type { RecoveryEmail, WelcomeEmail } from './emails.ts';
export { renderRecovery, renderWelcome, type Rendered } from './render.ts';
