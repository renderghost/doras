// Announcer: the page's shared live regions. Put one early in the page so
// the first message is heard; announce() also creates them if needed.
import type { DorasAnnouncerProps } from '@doras/specs';
import { LitElement, html } from 'lit';
import { define } from '../shared/define.ts';
import { announce, ensureAnnouncer } from './announce.ts';

export class DorasAnnouncer extends LitElement implements DorasAnnouncerProps {
  override connectedCallback(): void {
    super.connectedCallback();
    ensureAnnouncer();
  }

  /** Announces a message to screen readers. */
  announce(message: string, politeness: 'polite' | 'assertive' = 'polite'): void {
    announce(message, politeness);
  }

  override render() {
    return html``;
  }
}

define('doras-announcer', DorasAnnouncer);

declare global {
  interface HTMLElementTagNameMap {
    'doras-announcer': DorasAnnouncer;
  }
}
