// The few icons components draw themselves. Lucide's paths (ISC licence);
// the Atmosphere mark is the prototype's placeholder.
import { svg } from 'lit';

const lucide = (paths: ReturnType<typeof svg>) => svg`<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
  focusable="false"
>${paths}</svg>`;

export const loaderCircle = lucide(svg`<path d="M21 12a9 9 0 1 1-6.219-8.56" />`);

export const chevronDown = lucide(svg`<path d="m6 9 6 6 6-6" />`);

/** The Atmosphere mark: a dot inside an open ring. */
export const atmosphereMark = svg`<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  aria-hidden="true"
  focusable="false"
>
  <circle cx="12" cy="12" r="5" fill="currentColor" />
  <path
    d="M12 2.75a9.25 9.25 0 1 1-8.01 4.62"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
  />
</svg>`;
