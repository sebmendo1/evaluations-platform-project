/** Calibrated against the ledger: 12 runs cost $26.28 and landed at ±1.2,
 *  5 runs cost about $11 and landed near ±2.0. */
const COST_PER_RUN = 2.19;
const MINUTES_PER_RUN = 3.42;
const SPREAD = 4.25;

export const BASELINE_MEAN = 92.4;
export const BASELINE_ERR = 2.0;
export const EXPECTED_MEAN = 96.4;

export type Estimate = {
  cost: string;
  minutes: number;
  err: string;
  separates: boolean;
};

export function estimateRun(runs: number): Estimate {
  const safe = Math.max(1, runs);
  const err = SPREAD / Math.sqrt(safe);

  return {
    cost: `$${(safe * COST_PER_RUN).toFixed(2)}`,
    minutes: Math.round(safe * MINUTES_PER_RUN),
    err: err.toFixed(1),
    separates: EXPECTED_MEAN - err > BASELINE_MEAN + BASELINE_ERR,
  };
}
