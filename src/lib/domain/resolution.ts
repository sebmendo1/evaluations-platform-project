/**
 * Spec: 02 · Resolution, 02 · Case, 02 · Contracts
 *
 * "Every resolution writes exactly one case" is a non-nullable foreign key on a
 * write path in the real system. This prototype has no write path, so the
 * constructor throws instead — a resolution that does not produce a case is a
 * broken flywheel and the write is rejected.
 */

import type { InterruptType } from "./interrupt";

export type CaseOrigin = "production_resolution" | "blind_review" | "authored";

export type Corpus = "heloc-150" | "obligations-conflicts" | "heloc-150-plus-corrections";

export type Case = {
  id: string;
  corpus: Corpus;
  origin: CaseOrigin;
  /** Folder ref plus the state at the stop point. */
  input: { loanRef: string; step: number; interruptType: InterruptType | null };
  /** The human's answer, which is what makes this a label. */
  expected: string;
  labelledBy: string;
  labelledAt: string;
};

export type Resolution = {
  interruptId: string;
  answer: string;
  /** Required for policy_judgment, per 03 §Type 3. */
  rationale: string | null;
  resolvedBy: string;
  resolvedAt: string;
  durationSec: number;
  /** Non-nullable. 02 · Contracts. */
  caseId: string;
};

/** Which corpus a resolution of each type feeds. 04 §3. */
const CORPUS_BY_TYPE: Record<InterruptType, Corpus> = {
  conflicting_extraction: "obligations-conflicts",
  low_confidence: "obligations-conflicts",
  missing_document: "heloc-150",
  policy_judgment: "heloc-150",
  mandatory_escalation: "heloc-150",
};

export function corpusForType(type: InterruptType): Corpus {
  return CORPUS_BY_TYPE[type];
}

export type ResolutionInput = {
  interruptId: string;
  interruptType: InterruptType;
  loanRef: string;
  step: number;
  answer: string;
  rationale?: string | null;
  resolvedBy: string;
  durationSec: number;
  at?: string;
};

/**
 * The guarded write path. Produces the resolution and its case together, so the
 * two cannot come apart.
 *
 * 03 §Type 3 makes `rationale` required for a policy judgment because that answer
 * becomes the record.
 */
export function createResolution(input: ResolutionInput): {
  resolution: Resolution;
  case: Case;
} {
  if (!input.answer.trim()) {
    throw new Error("02 · Resolution: an answer is required");
  }
  if (!input.resolvedBy.trim()) {
    throw new Error("02 · Resolution: a resolution must name the person who made it");
  }
  if (input.interruptType === "policy_judgment" && !input.rationale?.trim()) {
    throw new Error(
      "03 §Type 3: policy_judgment requires a rationale because the answer becomes the record",
    );
  }

  const at = input.at ?? new Date().toISOString();
  const caseId = `case_${input.loanRef.toLowerCase()}_${input.step}`;

  const labelled: Case = {
    id: caseId,
    corpus: corpusForType(input.interruptType),
    origin: "production_resolution",
    input: {
      loanRef: input.loanRef,
      step: input.step,
      interruptType: input.interruptType,
    },
    expected: input.answer,
    labelledBy: input.resolvedBy,
    labelledAt: at,
  };

  return {
    resolution: {
      interruptId: input.interruptId,
      answer: input.answer,
      rationale: input.rationale ?? null,
      resolvedBy: input.resolvedBy,
      resolvedAt: at,
      durationSec: input.durationSec,
      caseId,
    },
    case: labelled,
  };
}

/**
 * 04 §4 — a blind-review correction is a different object from a resolution and
 * must not be merged into one metric. 02 · Naming keeps the words apart.
 */
export function createCorrection(input: {
  loanRef: string;
  field: string;
  trueValue: string;
  reviewer: string;
  at?: string;
}): Case {
  if (!input.trueValue.trim()) {
    throw new Error("04 §4: a correction requires the true value");
  }
  return {
    id: `case_${input.loanRef.toLowerCase()}_${input.field.toLowerCase()}`,
    corpus: "heloc-150-plus-corrections",
    origin: "blind_review",
    input: { loanRef: input.loanRef, step: 0, interruptType: null },
    expected: input.trueValue,
    labelledBy: input.reviewer,
    labelledAt: input.at ?? new Date().toISOString(),
  };
}
