/**
 * Spec: 04 §Pre-flight estimate
 *
 *   estimated_interval ≈ z × sqrt(p(1−p) / (n × fields_per_run))
 *
 * "Telling the user this before they spend $26 is worth more than any chart
 * afterwards." The runner must also state the minimum n that could separate.
 */

import { BASELINE, EXPECTED_ACCURACY, FIELDS_PER_RUN, COST_PER_RUN, MINUTES_PER_RUN } from "./constants";
import { intervalsOverlap, type ExperimentResult } from "./verdict";

const Z_95 = 1.96;

export function estimateInterval(n: number, p = EXPECTED_ACCURACY / 100): number {
  const runs = Math.max(1, n);
  return Z_95 * Math.sqrt((p * (1 - p)) / (runs * FIELDS_PER_RUN)) * 100;
}

export type Estimate = {
  runs: number;
  cost: string;
  costValue: number;
  minutes: number;
  interval: number;
  intervalLabel: string;
  fieldsGraded: number;
  separates: boolean;
  /** The smallest n whose interval clears the baseline band, or null if none
   *  within a sane budget does. */
  minimumSeparatingN: number | null;
};

function projected(n: number): ExperimentResult {
  return {
    accuracy: EXPECTED_ACCURACY,
    interval: estimateInterval(n),
    fieldsGraded: n * FIELDS_PER_RUN,
    n,
    status: "complete",
  };
}

export function wouldSeparate(n: number): boolean {
  return !intervalsOverlap(projected(n), BASELINE);
}

/** 04 §Pre-flight estimate — "suggests the minimum n that could separate." */
export function minimumSeparatingN(limit = 200): number | null {
  for (let n = 1; n <= limit; n++) {
    if (wouldSeparate(n)) return n;
  }
  return null;
}

export function estimateRun(n: number): Estimate {
  const runs = Math.max(1, Math.floor(n) || 1);
  const interval = estimateInterval(runs);

  return {
    runs,
    cost: `$${(runs * COST_PER_RUN).toFixed(2)}`,
    costValue: runs * COST_PER_RUN,
    minutes: Math.round(runs * MINUTES_PER_RUN),
    interval,
    intervalLabel: interval.toFixed(1),
    fieldsGraded: runs * FIELDS_PER_RUN,
    separates: wouldSeparate(runs),
    minimumSeparatingN: minimumSeparatingN(),
  };
}
