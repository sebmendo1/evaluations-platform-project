/**
 * Hand-built 16px stroke icons, matching the charts in 08 §6 — no icon library.
 *
 * 09 §11 forbids "decorative iconography that doesn't encode information", so each
 * glyph names its destination rather than ornamenting it: the experiments mark is
 * an interval with whiskers, which is the identity of that surface, and blind
 * review is a struck-through eye because the reviewer is not told what they hold.
 *
 * Colour comes from `currentColor` so the rail can express selection as state.
 */

type IconProps = { className?: string };

const base = {
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false as const,
};

/** A speech bubble — the unscoped thread. */
export function AskIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M2.5 4a1.5 1.5 0 0 1 1.5-1.5h8A1.5 1.5 0 0 1 13.5 4v5A1.5 1.5 0 0 1 12 10.5H6.5L3.5 13.5V10.5H4A1.5 1.5 0 0 1 2.5 9z" />
      <path d="M5.5 6h5M5.5 8h3" />
    </svg>
  );
}

/** Three stacked measures, the shape of the overview strip. */
export function OverviewIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="2" y="2.5" width="12" height="11" rx="1.5" />
      <path d="M2 6.5h12" />
      <path d="M6.5 6.5v7M10.5 6.5v7" />
    </svg>
  );
}

/** An interval with whiskers. The one chart 08 §6 insists on. */
export function ExperimentsIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 4.5v3M13 4.5v3M3 6h10" />
      <circle cx="9.5" cy="6" r="1.4" fill="currentColor" stroke="none" />
      <path d="M3 11v2.5M11 11v2.5M3 12.25h8" />
      <circle cx="6" cy="12.25" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** A signed artifact — the bundle as the thing under review. */
export function GovernanceIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3.5 2.5h6L12.5 5.5v8h-9z" />
      <path d="M9.5 2.5v3h3" />
      <path d="M5.5 8.5h5M5.5 11h3" />
    </svg>
  );
}

/** Bars over a period, with the axis 08 §6 requires. */
export function ReportsIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M2.5 13.5h11" />
      <path d="M4.5 13.5V9M7.5 13.5V5.5M10.5 13.5V7.5M13 13.5v-2" />
    </svg>
  );
}

/** A batch of files. */
export function BatchIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M2.5 5.5 8 3l5.5 2.5L8 8z" />
      <path d="M2.5 8.5 8 11l5.5-2.5" />
      <path d="M2.5 11.5 8 14l5.5-2.5" />
    </svg>
  );
}

/** A struck eye — the reviewer is not told the file was sampled. */
export function BlindReviewIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M1.8 8S4 4.5 8 4.5s6.2 3.5 6.2 3.5-2.2 3.5-6.2 3.5S1.8 8 1.8 8Z" />
      <circle cx="8" cy="8" r="1.6" />
      <path d="M2.5 13.5 13.5 2.5" />
    </svg>
  );
}

/** Two sliders — preferences, not a decorative cog. */
export function SettingsIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M2.5 5.5h11M2.5 10.5h11" />
      <circle cx="6" cy="5.5" r="1.8" fill="var(--p-paper)" />
      <circle cx="10.5" cy="10.5" r="1.8" fill="var(--p-paper)" />
    </svg>
  );
}

export const navIcons = {
  ask: AskIcon,
  settings: SettingsIcon,
  overview: OverviewIcon,
  experiments: ExperimentsIcon,
  governance: GovernanceIcon,
  reports: ReportsIcon,
  batch: BatchIcon,
  blindReview: BlindReviewIcon,
} as const;

export type NavIconName = keyof typeof navIcons;
