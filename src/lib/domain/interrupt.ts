/**
 * Spec: 03 · Interrupts, 00 · INV-2
 *
 * `type` is a closed enum. There is no `other` and no free-text escape: an
 * untypeable situation is a gap in this type system, escalated as a spec defect.
 *
 * The payloads here are domain shapes, not rendering instructions. Each type has
 * its own renderer under src/components/interrupts.
 */

import type { Role } from "./roles";

export type InterruptType =
  | "conflicting_extraction"
  | "missing_document"
  | "policy_judgment"
  | "mandatory_escalation"
  | "low_confidence";

export const interruptTypes: InterruptType[] = [
  "conflicting_extraction",
  "missing_document",
  "policy_judgment",
  "mandatory_escalation",
  "low_confidence",
];

/** 03 §Common shape — an extracted value with its page, never document text. */
export type Evidence = {
  label: string;
  page: number;
  excerpt: string;
  extractor: "document-reader";
};

/**
 * 03 §Common shape · ImpactStatement
 *
 * `outcomeChanges` is the triage signal and must be computed from the policy
 * card, never authored in prose. See impact.ts.
 */
export type ImpactStatement = {
  field: string;
  before: string | null;
  after: string[];
  outcomeChanges: boolean;
  narrative: string;
};

export type UnavailableReason =
  | "not_provided"
  | "employer_refused"
  | "not_applicable"
  | "superseded";

export type AdverseReason = {
  reason: string;
  /** The recorded finding this reason traces to. Null is unsourced and blocks
   *  approval under 03 §Type 4. */
  finding: string | null;
};

export type ConflictingExtraction = {
  type: "conflicting_extraction";
  field: string;
  candidates: { value: string; source: Evidence }[];
};

export type MissingDocument = {
  type: "missing_document";
  documentType: string;
  requiredBy: { step: number; reason: string };
  alternatives: string[];
};

export type PolicyJudgment = {
  type: "policy_judgment";
  card: string;
  clause: string;
  gap: string;
  options: { label: string; consequence: string }[];
};

export type MandatoryEscalation = {
  type: "mandatory_escalation";
  reason: "adverse_action";
  drafted: {
    outcome: "counteroffer" | "decline";
    lineRequested: string;
    lineSupportable: string;
  };
  reasonTable: AdverseReason[];
  fairLending: { scanned: true; flags: string[] };
};

export type LowConfidence = {
  type: "low_confidence";
  field: string;
  recorded: string;
  rederived: string;
  difference: string;
  likelyCause: string | null;
};

export type InterruptPayload =
  | ConflictingExtraction
  | MissingDocument
  | PolicyJudgment
  | MandatoryEscalation
  | LowConfidence;

export type Interrupt = {
  id: string;
  runId: string;
  loanRef: string;
  type: InterruptType;
  step: number;
  /** One sentence, ends in a question mark. 03 §Common shape. */
  question: string;
  payload: InterruptPayload;
  evidence: Evidence[];
  impact: ImpactStatement;
  raisedAt: string;
  waitedSeconds: number;
  /** Denormalised for the queue; the loan's own metadata. */
  borrower: string;
  product: string;
  amount: string;
  spend: string;
  stepLabel: string;
};

/** 03 §Routing — two types are senior-only, enforced rather than advisory. */
export const seniorOnlyTypes: InterruptType[] = [
  "policy_judgment",
  "mandatory_escalation",
];

export function requiresSenior(type: InterruptType): boolean {
  return seniorOnlyTypes.includes(type);
}

export function canResolve(type: InterruptType, role: Role): boolean {
  if (!requiresSenior(type)) return role === "reviewer" || role === "senior_reviewer";
  return role === "senior_reviewer";
}

/**
 * 03 §The 30-second rule. `policy_judgment` is the only exempt type, because it
 * is genuine deliberation rather than payload failure.
 */
export const THIRTY_SECOND_RULE_SECONDS = 30;

export function exemptFromThirtySecondRule(type: InterruptType): boolean {
  return type === "policy_judgment";
}

/**
 * 03 §Acceptance — "No code path can construct an interrupt without evidence and
 * impact." This is that code path.
 */
export function createInterrupt(
  input: Omit<Interrupt, "id"> & { id?: string },
): Interrupt {
  if (input.evidence.length === 0) {
    throw new Error(
      `INV-2: ${input.type} on ${input.loanRef} has no evidence; an interrupt without evidence cannot be resolved in 30 seconds`,
    );
  }
  if (!input.impact) {
    throw new Error(`INV-2: ${input.type} on ${input.loanRef} has no impact statement`);
  }
  if (!input.question.trim().endsWith("?")) {
    throw new Error(
      `03 §Common shape: question must be one sentence ending in a question mark, got "${input.question}"`,
    );
  }
  if (input.payload.type !== input.type) {
    throw new Error(
      `INV-2: payload type ${input.payload.type} does not match interrupt type ${input.type}`,
    );
  }
  return { ...input, id: input.id ?? `int_${input.loanRef.toLowerCase()}` };
}

/**
 * 03 §Type 4 — an adverse reason that cannot be matched to a recorded finding
 * blocks approval, naming which one.
 */
export function unsourcedAdverseReasons(payload: MandatoryEscalation): string[] {
  return payload.reasonTable
    .filter((entry) => entry.finding === null)
    .map((entry) => entry.reason);
}

/** 03 §Routing — queue order is wait time within a routing class, not a priority
 *  score. A score would need tuning and would be gamed. */
export function queueOrder(interrupts: Interrupt[]): Interrupt[] {
  return [...interrupts].sort((a, b) => {
    const seniority = Number(requiresSenior(a.type)) - Number(requiresSenior(b.type));
    if (seniority !== 0) return seniority;
    return b.waitedSeconds - a.waitedSeconds;
  });
}
