/**
 * Overview period instrument — Figma Portfolio-2026 / Overview.
 * Series are daily points for the selected range; autonomy and cost only
 * (06 forbids an accuracy trend line).
 */

export type OverviewRange = "1d" | "7d" | "30d" | "mtd" | "last_month";

export const OVERVIEW_RANGES: { key: OverviewRange; label: string }[] = [
  { key: "1d", label: "1d" },
  { key: "7d", label: "7d" },
  { key: "30d", label: "30d" },
  { key: "mtd", label: "MTD" },
  { key: "last_month", label: "Last month" },
];

export function isOverviewRange(value: string | undefined): value is OverviewRange {
  return OVERVIEW_RANGES.some((entry) => entry.key === value);
}

/** Anchor: end of the demo window (matches Figma Sep 23–29). */
const ANCHOR = new Date(Date.UTC(2026, 8, 29));

function formatDay(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function addDays(base: Date, days: number): Date {
  const next = new Date(base);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function daysBetween(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

export function rangeBounds(range: OverviewRange): { start: Date; end: Date; label: string } {
  const end = ANCHOR;
  let start: Date;
  switch (range) {
    case "1d":
      start = end;
      break;
    case "7d":
      start = addDays(end, -6);
      break;
    case "30d":
      start = addDays(end, -29);
      break;
    case "mtd":
      start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
      break;
    case "last_month": {
      start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - 1, 1));
      const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 0));
      return {
        start,
        end: last,
        label: `${formatDay(start)} - ${formatDay(last)}`,
      };
    }
  }
  return {
    start,
    end,
    label: start.getTime() === end.getTime() ? formatDay(end) : `${formatDay(start)} - ${formatDay(end)}`,
  };
}

export type OverviewPoint = {
  label: string;
  autonomy: number;
  cost: number;
};

/**
 * Deterministic demo series shaped like the Figma area plots: autonomy climbs
 * through the window; cost drifts gently around the $2.19 KPI.
 */
function buildSeries(start: Date, end: Date): OverviewPoint[] {
  const n = Math.max(1, daysBetween(start, end) + 1);
  const points: OverviewPoint[] = [];
  for (let i = 0; i < n; i += 1) {
    const date = addDays(start, i);
    const t = n === 1 ? 1 : i / (n - 1);
    points.push({
      label: formatDay(date),
      autonomy: Math.round(58 + t * 28 + Math.sin(i * 0.9) * 2),
      cost: Number((1.72 + t * 0.47 + Math.sin(i * 1.1) * 0.06).toFixed(2)),
    });
  }
  return points;
}

export type OverviewPeriod = {
  range: OverviewRange;
  rangeLabel: string;
  points: OverviewPoint[];
  autonomy: string;
  cost: string;
  turns: string;
};

export function overviewPeriod(range: OverviewRange = "7d"): OverviewPeriod {
  const { start, end, label } = rangeBounds(range);
  const points = buildSeries(start, end);
  const last = points[points.length - 1];
  const turnsByRange: Record<OverviewRange, string> = {
    "1d": "412",
    "7d": "528",
    "30d": "541",
    mtd: "533",
    last_month: "519",
  };
  return {
    range,
    rangeLabel: label,
    points,
    autonomy: `${last.autonomy}%`,
    cost: `$${last.cost.toFixed(2)}`,
    turns: turnsByRange[range],
  };
}
