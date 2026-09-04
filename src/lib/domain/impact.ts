/**
 * Spec: 03 §Common shape — "`impact.outcome_changes` is the triage signal. Most
 * conflicts do not change the outcome; telling the reviewer so is what keeps the
 * queue moving. It must be computed, never estimated in prose."
 *
 * So it is computed here, from the policy cards, and the interrupt data carries
 * only the per-candidate derived figures that the run itself produced.
 */

import type { ImpactStatement } from "./interrupt";
import { threshold } from "./policy-cards";

/**
 * The outcome moves only when candidate values land on different sides of the
 * governing threshold. Two values that are both comfortably inside the limit
 * change the record without changing the decision.
 */
export function straddles(values: number[], limit: number): boolean {
  return values.some((value) => value <= limit) && values.some((value) => value > limit);
}

export type DerivedImpact =
  /** Each candidate produces a DTI; the card decides whether the outcome moves. */
  | { field: "DebtToIncomeRatio"; derived: number[]; withReserves?: boolean }
  /** Each candidate produces an LTV against the lien-position limit. */
  | { field: "LoanToValue"; derived: number[]; lien: "first" | "second" }
  /** Categorical candidates, each mapping to a resulting decision outcome. */
  | { field: string; outcomes: string[]; conditions?: string[][] };

export function computeOutcomeChanges(input: DerivedImpact): boolean {
  if ("derived" in input) {
    if (input.field === "DebtToIncomeRatio") {
      const limit = threshold(
        "dti-thresholds",
        input.withReserves ? "withReserves" : "standard",
      );
      return straddles(input.derived, limit);
    }
    const limit = threshold(
      "collateral",
      input.lien === "first" ? "ltvFirstLien" : "cltvSecondLien",
    );
    return straddles(input.derived, limit);
  }

  // Categorical: the outcome moves when the candidates do not all agree on it.
  return new Set(input.outcomes).size > 1;
}

export function buildImpact(
  input: DerivedImpact & {
    before: string | null;
    after: string[];
    narrative: string;
  },
): ImpactStatement {
  return {
    field: input.field,
    before: input.before,
    after: input.after,
    outcomeChanges: computeOutcomeChanges(input),
    narrative: input.narrative,
  };
}
