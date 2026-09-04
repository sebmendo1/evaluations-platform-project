/**
 * Spec: 04 §2 · Verdict logic, 00 · INV-3, 00 · INV-4
 *
 * "The most important function in the platform. It is computed, never entered,
 * and has no override."
 *
 * There is deliberately no setter and no way to construct a Verdict by hand: the
 * only route to one is through `verdict()`.
 */

export type Verdict = "keep" | "discard" | "inconclusive" | "crash" | "baseline";

export type ExperimentResult = {
  accuracy: number;
  /** ± at 95%. A point estimate without a width is the mistake this platform
   *  exists to stop making, so it is not optional. */
  interval: number;
  fieldsGraded: number;
  n: number;
  status: "complete" | "crashed";
};

export function lower(result: ExperimentResult): number {
  return result.accuracy - result.interval;
}

export function upper(result: ExperimentResult): number {
  return result.accuracy + result.interval;
}

/** 04 §2, transcribed. */
export function intervalsOverlap(a: ExperimentResult, b: ExperimentResult): boolean {
  return !(lower(a) > upper(b) || upper(a) < lower(b));
}

/**
 * 04 §2, transcribed. Overlap yields `inconclusive` — no exceptions, no manual
 * override, no "directionally positive".
 */
export function verdict(
  result: ExperimentResult | null,
  baseline: ExperimentResult | null,
): Verdict {
  if (result === null) return "baseline";
  if (result.status === "crashed") return "crash";
  if (baseline === null) return "baseline";
  if (intervalsOverlap(result, baseline)) return "inconclusive";
  return result.accuracy > baseline.accuracy ? "keep" : "discard";
}

export type PromotionInput = {
  result: ExperimentResult | null;
  baseline: ExperimentResult | null;
  autonomyDelta: number;
  sampledAccuracyDelta: number;
  /** 04 §The INV-4 gate — a toggle exists and defaults on; disabling it requires
   *  a written reason stored with the promotion. */
  gateEnabled?: boolean;
  gateDisabledReason?: string | null;
};

export type PromotionCheck = {
  verdict: Verdict;
  allowed: boolean;
  /** Every failing condition, stated individually. 05 §4. */
  failures: string[];
};

/**
 * INV-4 · Autonomy may never rise at the cost of sampled accuracy.
 *
 * "Removing an interrupt is only a gain if the agent was right to stop asking."
 * Enforced here, at the promotion path, rather than in a policy document.
 */
export function inv4Violated(autonomyDelta: number, sampledAccuracyDelta: number): boolean {
  return autonomyDelta > 0 && sampledAccuracyDelta < 0;
}

export function canPromote(input: PromotionInput): PromotionCheck {
  const computed = verdict(input.result, input.baseline);
  const failures: string[] = [];

  if (computed !== "keep") {
    failures.push(`Verdict is ${computed}, and only keep may be promoted (04 §2)`);
  }

  const gateEnabled = input.gateEnabled ?? true;
  const violated = inv4Violated(input.autonomyDelta, input.sampledAccuracyDelta);

  if (violated && gateEnabled) {
    failures.push(
      `INV-4: autonomy rose ${input.autonomyDelta.toFixed(1)} pt while sampled accuracy fell ${Math.abs(input.sampledAccuracyDelta).toFixed(1)} pt`,
    );
  }

  if (violated && !gateEnabled && !input.gateDisabledReason?.trim()) {
    failures.push(
      "INV-4 gate is disabled without a written reason, which the promotion record requires (04 §The INV-4 gate)",
    );
  }

  return { verdict: computed, allowed: failures.length === 0, failures };
}
