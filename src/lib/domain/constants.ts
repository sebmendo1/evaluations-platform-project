/**
 * Measured inputs and the baseline, in one place so nothing hardcodes them.
 *
 * Spec: 01 §2 · Unit economics, 04 §3 · Corpora
 */

import type { ExperimentResult } from "./verdict";

/** 04 corroborates this: 5 runs graded 750 fields, 12 runs graded 1,800. */
export const FIELDS_PER_RUN = 150;

/** 01 §2 — measured, Sep 3 batch. */
export const COST_PER_RUN = 2.19;

/** Derived from the 0.12.0 run: 41 minutes of wall clock across 12 runs. */
export const MINUTES_PER_RUN = 41 / 12;

/** 04 §2 — the incumbent every experiment is measured against. */
export const BASELINE: ExperimentResult = {
  accuracy: 92.4,
  interval: 2.0,
  fieldsGraded: 750,
  n: 5,
  status: "complete",
};

/** The accuracy the current bundle actually reached, used to project intervals. */
export const EXPECTED_ACCURACY = 96.4;

/**
 * 01 §2 · `[INPUT]` values. Marked as unsourced so no screen can present a
 * savings figure derived from them as a measurement. Treat as wrong until Finance
 * and Ops supply them in writing (01 §10).
 */
export const UNSOURCED = {
  loadedRatePerMinute: null as number | null,
  manualBaselineMinutes: null as number | null,
} as const;

/** 01 §2 — measured human-side inputs. */
export const AVG_INTERRUPT_MINUTES = 1.6;
export const BLIND_REVIEW_MINUTES = 6;
export const SAMPLE_RATE = 0.05;
