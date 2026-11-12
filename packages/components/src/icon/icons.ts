// The Lucide icons Doras uses, taken from the Front Door prototype (ISC
// licence). Each is imported by name, so only these reach a bundle.
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  CircleCheck,
  CircleHelp,
  Clock,
  ExternalLink,
  Eye,
  EyeOff,
  Fingerprint,
  Globe,
  Inbox,
  Info,
  KeyRound,
  Link2,
  LoaderCircle,
  Lock,
  LogOut,
  Mail,
  MailOpen,
  Plus,
  QrCode,
  RectangleEllipsis,
  Send,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Undo2,
  UserPlus,
  UserRound,
  UsersRound,
  WandSparkles,
  X,
  type IconNode,
} from 'lucide';

export interface DorasIcon {
  /** The Lucide name, as on lucide.dev. */
  name: string;
  /** The icon's drawing, from Lucide. */
  node: IconNode;
  /** What it means in Doras. */
  meaning: string;
  /** Icons that point a direction mirror in right-to-left layouts. */
  mirrors?: boolean;
}

const LIST = [
  { name: 'arrow-left', node: ArrowLeft, meaning: 'Back', mirrors: true },
  { name: 'arrow-right', node: ArrowRight, meaning: 'Continue', mirrors: true },
  { name: 'x', node: X, meaning: 'Close' },
  { name: 'chevron-down', node: ChevronDown, meaning: 'Show more' },
  { name: 'check', node: Check, meaning: 'Done or chosen' },
  { name: 'circle-check', node: CircleCheck, meaning: 'Success' },
  { name: 'info', node: Info, meaning: 'Information' },
  { name: 'circle-help', node: CircleHelp, meaning: 'Help' },
  { name: 'clock', node: Clock, meaning: 'Wait' },
  { name: 'loader-circle', node: LoaderCircle, meaning: 'Busy. Stops spinning for reduced motion' },
  { name: 'key-round', node: KeyRound, meaning: 'Passkey' },
  { name: 'fingerprint', node: Fingerprint, meaning: 'Face, fingerprint or screen lock' },
  { name: 'lock', node: Lock, meaning: 'Password' },
  { name: 'rectangle-ellipsis', node: RectangleEllipsis, meaning: 'Password or code field' },
  { name: 'eye', node: Eye, meaning: 'Show password' },
  { name: 'eye-off', node: EyeOff, meaning: 'Hide password' },
  { name: 'mail', node: Mail, meaning: 'Email' },
  { name: 'mail-open', node: MailOpen, meaning: 'Check your email' },
  { name: 'inbox', node: Inbox, meaning: 'Code from Mail' },
  { name: 'send', node: Send, meaning: 'Sent', mirrors: true },
  { name: 'smartphone', node: Smartphone, meaning: 'Phone' },
  { name: 'qr-code', node: QrCode, meaning: 'Use another device' },
  { name: 'shield-check', node: ShieldCheck, meaning: 'Verified or safe' },
  { name: 'sparkles', node: Sparkles, meaning: 'Worked out for you (automated)' },
  { name: 'wand-sparkles', node: WandSparkles, meaning: 'Filled in for you (automated)' },
  { name: 'user-round', node: UserRound, meaning: 'Account' },
  { name: 'users-round', node: UsersRound, meaning: 'Several accounts' },
  { name: 'user-plus', node: UserPlus, meaning: 'Create an account' },
  { name: 'link-2', node: Link2, meaning: 'Accounts linked' },
  { name: 'arrow-left-right', node: ArrowLeftRight, meaning: 'Switch' },
  { name: 'globe', node: Globe, meaning: 'Provider address' },
  { name: 'external-link', node: ExternalLink, meaning: 'Opens in a new tab' },
  { name: 'book-open', node: BookOpen, meaning: 'Learn more' },
  { name: 'settings', node: Settings, meaning: 'Settings' },
  { name: 'plus', node: Plus, meaning: 'Add' },
  { name: 'undo-2', node: Undo2, meaning: 'Undo', mirrors: true },
  { name: 'log-out', node: LogOut, meaning: 'Sign out', mirrors: true },
] as const satisfies readonly DorasIcon[];

/** Every icon's name. */
export type IconName = (typeof LIST)[number]['name'];

/** The icons Doras uses, in the order the Icons page shows them. */
export const ICONS: readonly DorasIcon[] = LIST;

/** Icons by name. */
export const ICON_BY_NAME: ReadonlyMap<string, DorasIcon> = new Map(ICONS.map((i) => [i.name, i]));
