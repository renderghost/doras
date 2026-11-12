// Styles every component shares.
import { css } from 'lit';

/** The focus ring: 2px, 2px away, in the focus colour (WCAG 2.4.13). Forced colours make it Highlight. */
export const focusRing = css`
  :focus-visible {
    outline: var(--doras-border-width-focus) solid var(--doras-color-border-focus);
    outline-offset: var(--doras-focus-offset);
  }
`;

/** Hidden on screen, but read by screen readers. */
export const visuallyHidden = css`
  .visually-hidden {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
`;

/**
 * A spinner whose speed comes from the motion tokens. Reduced motion sets
 * durations to 0, so it stops, whether the system or data-doras-motion asks.
 */
export const spinner = css`
  .spinner {
    display: inline-grid;
    animation: doras-spin calc(var(--doras-motion-duration-slow) * 2.25) linear infinite;
  }

  @keyframes doras-spin {
    to {
      transform: rotate(1turn);
    }
  }
`;
