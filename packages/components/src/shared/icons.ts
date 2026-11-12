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

export const circleAlert = lucide(
  svg`<circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />`,
);

export const wandSparkles = lucide(
  svg`<path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72" /><path d="m14 7 3 3" /><path d="M5 6v4" /><path d="M19 14v4" /><path d="M10 2v2" /><path d="M7 8H3" /><path d="M21 16h-4" /><path d="M11 3H9" />`,
);

export const eye = lucide(
  svg`<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" />`,
);

export const eyeOff = lucide(
  svg`<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" /><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" /><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" /><path d="m2 2 20 20" />`,
);
