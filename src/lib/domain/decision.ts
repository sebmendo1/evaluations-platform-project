/**
 * Spec: 02 · Decision, 00 · INV-5, 00 · INV-9
 *
 * A decision carries the bundle version that produced it, and an adverse action
 * carries a named approver. Both are enforced in the constructor because both are
 * write-path contracts in 02 and this prototype has no write path.
 */

import type { AdverseReason } from "./interrupt";

export type Outcome = "approve" | "counteroffer" | "decline";

export type Decision = {
  runId: string;
  loanRef: string;
  outcome: Outcome;
  lineSupportable: string;
  conditions: string[];
  adverseReasons: AdverseReason[];
  /** INV-9 · every decision is stamped with the bundle that produced it. */
  bundleVersion: string;
  /** INV-5 · non-null exactly when adverseReasons is non-empty. */
  approvedBy: string | null;
  decidedAt: string;
};

export function writeDecision(input: Decision): Decision {
  if (!input.bundleVersion) {
    throw new Error(
      `INV-9: decision for ${input.loanRef} has no bundle version; a decision that cannot name what produced it is not auditable`,
    );
  }

  const hasAdverse = input.adverseReasons.length > 0;

  if (hasAdverse && !input.approvedBy) {
    throw new Error(
      `INV-5: ${input.outcome} on ${input.loanRef} carries adverse-action reasons and cannot be written without a named human approval`,
    );
  }

  if (!hasAdverse && input.approvedBy) {
    throw new Error(
      `02 · Decision: approvedBy is set on ${input.loanRef} but there are no adverse reasons to approve`,
    );
  }

  const unsourced = input.adverseReasons.filter((reason) => reason.finding === null);
  if (unsourced.length > 0) {
    throw new Error(
      `03 §Type 4: adverse reason "${unsourced[0].reason}" does not trace to a recorded finding`,
    );
  }

  return input;
}

/** INV-5 · the classes that never auto-clear, whatever the confidence. */
export function requiresNamedApproval(outcome: Outcome): boolean {
  return outcome === "counteroffer" || outcome === "decline";
}
