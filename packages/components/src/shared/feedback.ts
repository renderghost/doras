// The look shared by messages and notices: an icon beside the words, so
// colour is never the only signal.
import { css } from 'lit';

export const TONE_ICONS = {
  info: 'info',
  success: 'circle-check',
  error: 'circle-alert',
  automated: 'wand-sparkles',
  hint: 'info',
} as const;

export const feedbackStyles = css`
  .feedback {
    display: flex;
    gap: var(--doras-space-inline-sm);
    align-items: flex-start;
  }

  .feedback doras-icon {
    margin-block-start: 0.1em;
  }
`;
