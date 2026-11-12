// The modal behaviour the account chooser and passkey prompt share. The
// browser draws these over the page, which can't be used until they close,
// so each mock is a native modal dialog.
import { LitElement, type PropertyValues } from 'lit';

export abstract class MockDialog extends LitElement {
  static override properties = {
    open: { type: Boolean, reflect: true },
  };

  declare open: boolean;

  constructor() {
    super();
    this.open = false;
  }

  protected get dialog(): HTMLDialogElement | null {
    return this.renderRoot.querySelector('dialog');
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('open') && this.open) this.opened();
  }

  protected override updated(changed: PropertyValues): void {
    const dialog = this.dialog;
    if (!dialog || !changed.has('open')) return;
    if (this.open && !dialog.open) dialog.showModal();
    else if (!this.open && dialog.open) dialog.close();
  }

  /** The person closes it, with the close button or a button of the mock's own. */
  protected dismiss = (): void => {
    this.dialog?.close();
  };

  /**
   * Escape, the close button and dismiss() all close the native dialog while
   * `open` is still true, so the person closed it. Setting `open` to false
   * closes it quietly.
   */
  protected onClose = (): void => {
    if (!this.open) return;
    this.open = false;
    this.dismissed();
  };

  /** Called as it opens, before it renders: reset what the last showing changed. */
  protected abstract opened(): void;

  /** Called when the person closed it. */
  protected abstract dismissed(): void;
}
