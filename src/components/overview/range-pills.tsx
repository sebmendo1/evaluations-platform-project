"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  OVERVIEW_RANGES,
  isOverviewRange,
  type OverviewRange,
} from "@/lib/data/overview";

/**
 * Figma Overview · period presets. Selection lives in `?range=` so it survives
 * reload and shares the URL with the workspace section tabs.
 */
export function OverviewRangePills({
  rangeLabel,
  initial,
}: {
  rangeLabel: string;
  initial: OverviewRange;
}) {
  const params = useSearchParams();
  const current = isOverviewRange(params.get("range") ?? undefined)
    ? (params.get("range") as OverviewRange)
    : initial;

  function hrefFor(range: OverviewRange): string {
    const next = new URLSearchParams(params.toString());
    if (range === "7d") next.delete("range");
    else next.set("range", range);
    const query = next.toString();
    return query ? `/?${query}` : "/";
  }

  return (
    <div className="ov-range">
      <span className="ov-range-label">{rangeLabel}</span>
      <div className="ov-range-pills" role="group" aria-label="Period">
        {OVERVIEW_RANGES.map((entry) => (
          <Link
            key={entry.key}
            href={hrefFor(entry.key)}
            className={entry.key === current ? "ov-pill on" : "ov-pill"}
            aria-current={entry.key === current ? "true" : undefined}
          >
            {entry.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
