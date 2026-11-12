// Look-alikes of the browser's own UI, so flows can be clicked through in
// Storybook. Never for production: real browsers draw their own, and
// production packages fail to build if they import this one.
export { DorasMockAccountChooser, type MockAccount } from './account-chooser/account-chooser.ts';
export { DorasMockAutofill, type AutofillKind } from './autofill/autofill.ts';
export {
  DorasMockPasskeyPrompt,
  UNLOCK_MS,
  type PasskeyPromptMode,
} from './passkey-prompt/passkey-prompt.ts';
