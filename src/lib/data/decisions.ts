/**
 * Decisions and their audit chains.
 *
 * Spec: 05 §3 · "The chain resolves down to evidence and up to authorisation", and
 * `05 §6` requires it resolve "from any decision, in one screen" — not from one
 * worked example.
 *
 * Every field carries real `Provenance`, so the chain is generated from the record
 * rather than authored, and `citation_coverage` is computed from it rather than
 * asserted.
 */

import { attempts, getAttempt } from "./attempts";
import { batches } from "./batches";
import { bundleVersions, getVersion } from "./governance";
import {
  citation,
  computed,
  extracted,
  hasPageCitation,
  stated,
  type Provenance,
} from "../domain/provenance";
import { writeDecision, type Decision } from "../domain/decision";

export type RecordedField = {
  name: string;
  value: string;
  step: number;
  provenance: Provenance;
  checkerStatus: "agreed" | "could_not_derive" | "not_applicable";
};

/** The 14-field record every cleared file produces. 02 · Field. */
function fieldsFor(loanRef: string, corrected: boolean): RecordedField[] {
  const fields: RecordedField[] = [
    { name: "BorrowerName", value: "Nakamura, K.", step: 1, provenance: extracted("application", 1), checkerStatus: "agreed" },
    { name: "Occupancy", value: "Primary residence", step: 1, provenance: extracted("application", 1), checkerStatus: "agreed" },
    { name: "CreditScore", value: "748", step: 2, provenance: extracted("credit report", 1), checkerStatus: "agreed" },
    { name: "HousingHistory", value: "Owned, 6 yr", step: 2, provenance: extracted("credit report", 2), checkerStatus: "agreed" },
    { name: "WageIncome", value: "$9,240 / mo", step: 3, provenance: extracted("paystub", 1), checkerStatus: "agreed" },
    { name: "SelfEmployment", value: "None", step: 3, provenance: extracted("tax return", 1), checkerStatus: "not_applicable" },
    { name: "RentalIncome", value: "$1,100 / mo", step: 3, provenance: extracted("Schedule E", 3), checkerStatus: "agreed" },
    {
      name: "InvestmentAccounts",
      value: corrected ? "$38,050" : "$41,300",
      step: 3,
      provenance: corrected
        ? stated("j.park", "2026-09-03T12:09:00Z", `res_${loanRef.toLowerCase()}`)
        : extracted("statement", 2),
      checkerStatus: "agreed",
    },
    { name: "TotalObligations", value: "$2,840 / mo", step: 4, provenance: extracted("credit report", 3), checkerStatus: "agreed" },
    {
      name: "QualifyingPayment",
      value: "$1,206.44",
      step: 4,
      provenance: computed("qualifying_payment", ["TotalObligations", "EscrowMonthly"]),
      checkerStatus: "agreed",
    },
    {
      name: "DebtToIncomeRatio",
      value: "38.9%",
      step: 4,
      provenance: computed("dti", ["QualifyingPayment", "WageIncome", "RentalIncome"]),
      checkerStatus: "agreed",
    },
    { name: "PropertyValue", value: "$612,000", step: 5, provenance: extracted("appraisal", 1), checkerStatus: "agreed" },
    {
      name: "LoanToValue",
      value: "70.4%",
      step: 5,
      provenance: computed("ltv", ["LineSupportable", "PropertyValue"]),
      checkerStatus: "agreed",
    },
    { name: "FloodZone", value: "Zone X", step: 6, provenance: extracted("determination", 1), checkerStatus: "agreed" },
  ];
  return fields;
}

export type DecisionRecord = {
  decision: Decision;
  fields: RecordedField[];
  /** The bundle that produced it and the attempt that authorised the bundle. */
  bundle: string;
  promotedBy: string | null;
  corrected: boolean;
};

const CORRECTED_REFS = new Set(["HL-40086"]);

/** Cleared files are the ones with a written record. 02 · Run → Decision. */
export function clearedRefs(): string[] {
  return batches.flatMap((batch) =>
    batch.files.filter((file) => file.state === "cleared").map((file) => file.id),
  );
}

export function getDecision(loanRef: string): DecisionRecord | undefined {
  const match = clearedRefs().find(
    (ref) => ref.toLowerCase() === loanRef.toLowerCase(),
  );
  if (!match) return undefined;

  const batch = batches.find((b) => b.files.some((f) => f.id === match));
  const bundle = batch?.bundle ?? bundleVersions[0].v;
  const corrected = CORRECTED_REFS.has(match);

  // Goes through the guarded write path, so a record missing its bundle version
  // or carrying an unapproved adverse reason cannot be constructed at all.
  const decision = writeDecision({
    runId: `run_${match.toLowerCase()}`,
    loanRef: match,
    outcome: "approve",
    lineSupportable: "$95,000",
    conditions: ["Flood insurance not required — Zone X"],
    adverseReasons: [],
    bundleVersion: bundle,
    approvedBy: null,
    decidedAt: "2026-09-03T12:00:00Z",
  });

  return {
    decision,
    fields: fieldsFor(match, corrected),
    bundle,
    promotedBy: getVersion(bundle).promotedBy,
    corrected,
  };
}

/**
 * 05 §3 · citation_coverage — "percentage of fields carrying a citation. Currently
 * 99.4%, with computed fields as the stated exception. Any decline in this number is
 * a correctness incident, not a reporting issue."
 */
export const CITATION_COVERAGE_FLOOR = 0.99;

export function citationCoverage(fields: RecordedField[]) {
  const cited = fields.filter((field) => hasPageCitation(field.provenance)).length;
  const computedFields = fields.filter(
    (field) => field.provenance.kind === "computed",
  ).length;
  // A computed field resolves to its inputs and formula rather than a page, which is
  // the stated exception rather than a miss.
  const eligible = fields.length - computedFields;
  const coverage = eligible === 0 ? 1 : cited / eligible;

  return {
    coverage,
    cited,
    eligible,
    computedFields,
    total: fields.length,
    /** Below the floor is a correctness incident, and reads as one. */
    incident: coverage < CITATION_COVERAGE_FLOOR,
  };
}

export function chainFor(record: DecisionRecord) {
  const attempt = record.promotedBy ? getAttempt(record.promotedBy) : undefined;
  return {
    fields: record.fields.map((field) => ({
      ...field,
      citationText: citation(field.provenance),
    })),
    bundle: record.bundle,
    attempt,
    evidence: attempt?.result
      ? `${attempt.result.accuracy.toFixed(1)}% ±${attempt.result.interval.toFixed(1)}, n ${attempt.result.n}`
      : null,
  };
}

export const sampleDecisionRefs = ["HL-40086", "HL-40119", "HL-40044"];
export const allAttempts = attempts;
