import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  isOverviewRange,
  overviewPeriod,
  OVERVIEW_RANGES,
} from "@/lib/data/overview";
import { metrics } from "@/lib/metrics";

describe("07 §Overview · Figma period instrument", () => {
  const page = readFileSync("src/app/page.tsx", "utf8");

  it("GIVEN a reviewer opens Overview THEN the period range defaults to 7d", () => {
    expect(isOverviewRange("7d")).toBe(true);
    expect(overviewPeriod("7d").range).toBe("7d");
    expect(OVERVIEW_RANGES.map((entry) => entry.key)).toEqual([
      "1d",
      "7d",
      "30d",
      "mtd",
      "last_month",
    ]);
    expect(page).toContain('rangeParam) ? rangeParam : "7d"');
    expect(page).toContain("OverviewRangePills");
  });

  it("AND three KPIs show autonomy, cost per run, and turns per run", () => {
    expect(metrics.turns_per_run.label).toBe("Turns per run");
    expect(page).toContain('id="autonomy_rate"');
    expect(page).toContain('id="cost_per_run"');
    expect(page).toContain('id="turns_per_run"');
    expect(page).toContain('className="ov-kpis"');
  });

  it("AND autonomy and cost period charts sit below the KPIs", () => {
    expect(page).toContain("AreaSeriesChart");
    expect(page).toContain('title="Autonomy"');
    expect(page).toContain('title="Cost per run"');
    const kpisAt = page.indexOf('className="ov-kpis"');
    const chartsAt = page.indexOf('className="ov-charts"');
    const tabsAt = page.indexOf("<SectionTabs");
    expect(kpisAt).toBeGreaterThan(-1);
    expect(chartsAt).toBeGreaterThan(kpisAt);
    expect(tabsAt).toBeGreaterThan(chartsAt);
  });

  it("AND the held queue remains the default workspace section under the charts", () => {
    expect(page).toContain('section) ? section : "queue"');
    expect(page).toContain('label: "Held"');
    expect(page).toContain("<HeldQueue");
  });
});
