import {
  AVG_INTERRUPT_MINUTES,
  BLIND_REVIEW_MINUTES,
  SAMPLE_RATE,
} from "../domain/constants";

export const autonomySeries = [71, 73, 72, 76, 79, 78, 79, 81, 86, 86];

export const autonomyLabels = [
  "Aug 25",
  "26",
  "27",
  "28",
  "29",
  "Sep 1",
  "2",
  "2",
  "3",
  "3",
];

/** Index into autonomySeries where a bundle went live. */
export const autonomyDeploys: Record<number, string> = {
  4: "0.11.0",
  8: "0.12.0",
};

export type InterruptStat = {
  key: string;
  count: number;
  median: string;
  seconds: number;
};

export const interruptMix: InterruptStat[] = [
  { key: "conflicting_extraction", count: 78, median: "41s", seconds: 41 },
  { key: "low_confidence", count: 52, median: "1m 12s", seconds: 72 },
  { key: "missing_document", count: 41, median: "2m 30s", seconds: 150 },
  { key: "policy_judgment", count: 26, median: "4m 10s", seconds: 250 },
  { key: "mandatory_escalation", count: 17, median: "3m 20s", seconds: 200 },
];

/**
 * 03 §Metrics · "Rate of interrupts breaching the 30-second rule, by type — this is
 * the spec's own health metric. A rising rate means payloads are degrading."
 *
 * Two things fall out of computing it honestly, and both are worth reading.
 *
 * `03 §The 30-second rule` exempts exactly one type, `policy_judgment`, which
 * leaves four non-exempt. But `03 §Acceptance` says "the three non-exempt types".
 * The spec is inconsistent about its own exemption count, and the fourth type —
 * `mandatory_escalation`, senior-only and 3m 20s — looks like it was meant to be
 * exempt alongside deliberation.
 *
 * And on the target itself: no non-exempt type is under 30 seconds today. Two clear
 * the 90-second pilot gate, two do not.
 */
export const THIRTY_SECOND_TARGET = 30;
export const PILOT_GATE_SECONDS = 90;

export type RuleCheck = {
  key: string;
  seconds: number;
  median: string;
  exempt: boolean;
  meetsTarget: boolean;
  meetsPilotGate: boolean;
};

export function thirtySecondRule(): RuleCheck[] {
  return interruptMix.map((item) => {
    const exempt = item.key === "policy_judgment";
    return {
      key: item.key,
      seconds: item.seconds,
      median: item.median,
      exempt,
      meetsTarget: exempt || item.seconds <= THIRTY_SECOND_TARGET,
      meetsPilotGate: exempt || item.seconds <= PILOT_GATE_SECONDS,
    };
  });
}

export function ruleSummary() {
  const checks = thirtySecondRule();
  const nonExempt = checks.filter((check) => !check.exempt);
  return {
    checks,
    nonExempt: nonExempt.length,
    clearingPilotGate: nonExempt.filter((c) => c.meetsPilotGate).length,
    meetingTarget: nonExempt.filter((c) => c.meetsTarget).length,
    /** Share of interrupt volume sitting in a type that breaches the target. */
    volumeBreaching:
      nonExempt
        .filter((c) => !c.meetsTarget)
        .reduce((sum, c) => {
          const item = interruptMix.find((i) => i.key === c.key);
          return sum + (item?.count ?? 0);
        }, 0) / interruptMix.reduce((sum, i) => sum + i.count, 0),
  };
}

export const stepCosts: { step: string; cost: number }[] = [
  { step: "1 file intake", cost: 0.18 },
  { step: "2 credit read", cost: 0.24 },
  { step: "3 income", cost: 0.61 },
  { step: "4 obligations and DTI", cost: 0.44 },
  { step: "5 collateral", cost: 0.19 },
  { step: "6 insurance and flood", cost: 0.12 },
  { step: "7 title review", cost: 0.09 },
  { step: "8 decide and document", cost: 0.32 },
];

export const timeToClear: { bucket: string; count: number }[] = [
  { bucket: "<10m", count: 4 },
  { bucket: "10–15", count: 19 },
  { bucket: "15–20", count: 31 },
  { bucket: "20–25", count: 22 },
  { bucket: "25–30", count: 11 },
  { bucket: "30–40", count: 5 },
  { bucket: "40m+", count: 1 },
];

/**
 * 01 §2 · human_minutes_per_file, which 06 calls the real cost driver.
 *
 *   (1 − autonomy) × avg_interrupt_minutes + sample_rate × blind_review_minutes
 *
 * At 86% autonomy this is about 0.52 minutes a file, and it is the half that
 * dominates the economics — one minute of underwriter time is worth several files
 * of inference.
 */
export const humanMinutesPerFile =
  (1 - 0.86) * AVG_INTERRUPT_MINUTES + SAMPLE_RATE * BLIND_REVIEW_MINUTES;

export const reportKpis = [
  { lab: "Files reviewed", val: "1,004", sub: "across 10 batches" },
  { lab: "Autonomy", val: "86%", sub: "up 15 pt from Aug 25" },
  { lab: "Sampled accuracy", val: "95.1%", sub: "70 fields · blind" },
  { lab: "Cost per file", val: "$2.19", sub: "inference only" },
  {
    lab: "Human minutes per file",
    val: `${humanMinutesPerFile.toFixed(2)}m`,
    sub: "interrupts plus blind review",
  },
  { lab: "Median time to clear", val: "18m", sub: "p90 is 27m" },
  { lab: "Hours saved", val: "~412h", sub: "unsourced · assumes 25m manual" },
];

export const reviewerActivity = [
  {
    reviewer: "j.park",
    resolved: "51",
    median: "1m 05s",
    corrections: "7",
    mix: "mostly extraction conflicts",
    waiting: false,
  },
  {
    reviewer: "s.mendo",
    resolved: "34",
    median: "48s",
    corrections: "4",
    mix: "extraction and low confidence",
    waiting: false,
  },
  {
    reviewer: "a.silva",
    resolved: "29",
    median: "2m 11s",
    corrections: "6",
    mix: "policy judgment and escalation",
    waiting: false,
  },
  {
    reviewer: "unassigned",
    resolved: "7",
    median: "12m and waiting",
    corrections: "—",
    mix: "currently held",
    waiting: true,
  },
];

export const complianceKpis = [
  { lab: "Counteroffers", val: "14", sub: "all human-approved" },
  { lab: "Declines", val: "3", sub: "all human-approved" },
  { lab: "Auto-cleared escalations", val: "0", sub: "policy forbids it" },
  { lab: "Fair-lending flags", val: "0", sub: "17 reasoning traces scanned" },
  { lab: "Reasons traced to a finding", val: "34 of 34", sub: "no unsourced reason" },
  { lab: "Fields with a page citation", val: "99.4%", sub: "6 computed fields excepted" },
];
