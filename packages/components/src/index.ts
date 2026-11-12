// @doras/components: importing a component registers its element.
export { DorasButton } from './button/button.ts';
export { DorasContinueWithAtmosphere } from './continue-with-atmosphere/continue-with-atmosphere.ts';
export { DorasDisclosure } from './disclosure/disclosure.ts';
export { DorasIconButton } from './icon-button/icon-button.ts';
export { DorasLink } from './link/link.ts';
export { DorasCodeField } from './code-field/code-field.ts';
export { DorasEmailField } from './email-field/email-field.ts';
export { DorasFieldset } from './fieldset/fieldset.ts';
export { DorasHandleField, type HandleSuggestion } from './handle-field/handle-field.ts';
export {
  DEFAULT_DOMAINS,
  readHandle,
  type HandleDomains,
  type HandleFix,
  type HandleReading,
} from './handle-field/read-handle.ts';
export { DorasPasswordField } from './password-field/password-field.ts';
export { DorasRadioCards, type RadioCardOption } from './radio-cards/radio-cards.ts';
export { DorasSwitch } from './switch/switch.ts';
export { DorasTextField } from './text-field/text-field.ts';
export { DorasAtmosphereMark } from './atmosphere-mark/atmosphere-mark.ts';
export { DorasDivider } from './divider/divider.ts';
export { DorasFactsList, type Fact } from './facts-list/facts-list.ts';
export { DorasFormattedCode } from './formatted-code/formatted-code.ts';
export { spokenCode } from './formatted-code/format.ts';
export { DorasIcon } from './icon/icon.ts';
export { ICONS, ICON_BY_NAME, type IconName } from './icon/icons.ts';
export { DorasPermissionItem } from './permission-item/permission-item.ts';
export { DorasAccountRow } from './account-row/account-row.ts';
export { DorasAppIdentity } from './app-identity/app-identity.ts';
export { DorasAvatar } from './avatar/avatar.ts';
export { initialsFor } from './avatar/initials.ts';
export { DorasHandle } from './handle/handle.ts';
export { DorasLinkedAccounts } from './linked-accounts/linked-accounts.ts';
export { DorasProviderBadge } from './provider-badge/provider-badge.ts';
export {
  PROVIDERS,
  providerById,
  type Provider,
  type ProviderLogo,
} from './provider-badge/providers.ts';
export { announce } from './announcer/announce.ts';
export { DorasAnnouncer } from './announcer/announcer.ts';
export { DorasBusyState } from './busy-state/busy-state.ts';
export { DorasErrorSummary, type SummaryError } from './error-summary/error-summary.ts';
export { DorasFieldMessage } from './field-message/field-message.ts';
export { DorasNotice } from './notice/notice.ts';
export { DorasToast } from './toast/toast.ts';
export { DorasProviderLink } from './provider-link/provider-link.ts';
export { DorasSheetHeader } from './sheet-header/sheet-header.ts';
export { DorasSkipLink } from './skip-link/skip-link.ts';
export { DorasStepLink } from './step-link/step-link.ts';
