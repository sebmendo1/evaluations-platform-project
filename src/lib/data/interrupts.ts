/**
 * The seven interrupts currently held in batch-0903-am, expressed as the typed
 * payloads in 03 rather than as rendering instructions.
 *
 * Every `impact.outcomeChanges` here is computed by `buildImpact` from the policy
 * cards. The data carries only the per-candidate figures the run itself derived.
 */

import { buildImpact } from "../domain/impact";
import { createInterrupt, type Evidence, type Interrupt } from "../domain/interrupt";

function ev(label: string, page: number, excerpt: string): Evidence {
  return { label, page, excerpt, extractor: "document-reader" };
}

export const heldInterrupts: Interrupt[] = [
  createInterrupt({
    runId: "run_40128",
    loanRef: "HL-40128",
    type: "conflicting_extraction",
    step: 4,
    stepLabel: "step 4 of 8 · obligations and DTI",
    question:
      "Two sources give a different monthly payment for the auto tradeline. Which is the true source?",
    payload: {
      type: "conflicting_extraction",
      field: "AutoTradelinePayment",
      candidates: [
        { value: "$612.00", source: ev("credit report", 3, "tradeline 4 · $612.00") },
        {
          value: "$584.19",
          source: ev("lender statement", 1, "current amount due · $584.19"),
        },
      ],
    },
    evidence: [
      ev("credit report", 3, "tradeline 4 · $612.00"),
      ev("lender statement", 1, "current amount due · $584.19"),
    ],
    impact: buildImpact({
      field: "DebtToIncomeRatio",
      derived: [41.2, 41.6],
      before: "41.2%",
      after: ["41.2%", "41.6%"],
      narrative:
        "DTI moves 41.2% to 41.6%. Both sit under the 43% policy threshold, so the outcome is unchanged either way.",
    }),
    raisedAt: "2026-09-03T12:29:00Z",
    waitedSeconds: 720,
    borrower: "Reyes, M.",
    product: "HELOC 2nd lien",
    amount: "$85,000",
    spend: "$1.42",
  }),

  createInterrupt({
    runId: "run_40093",
    loanRef: "HL-40093",
    type: "missing_document",
    step: 3,
    stepLabel: "step 3 of 8 · income orchestration",
    question:
      "The 2025 W-2 isn’t in the folder — can income be verified for continuance without it?",
    payload: {
      type: "missing_document",
      documentType: "2025 W-2",
      requiredBy: {
        step: 3,
        reason: "wage income needs a second year to establish continuance",
      },
      alternatives: [
        "a 2025 year-end paystub showing year-to-date wages",
        "a written verification of employment",
        "a 2025 tax return with a W-2 transcript",
      ],
    },
    evidence: [
      ev("paystub", 1, "wage income · $9,240 / mo"),
      ev("paystub", 2, "wage income · $9,240 / mo"),
    ],
    impact: buildImpact({
      field: "WageIncome",
      outcomes: ["approve", "approve"],
      before: "$9,240 / mo",
      after: ["$9,240 / mo"],
      narrative:
        "Marked unavailable, step 3 routes this source to the self-employment path and the file continues. Wage income is already verified from two paystubs on pages 1 and 2.",
    }),
    raisedAt: "2026-09-03T12:32:00Z",
    waitedSeconds: 540,
    borrower: "Okonkwo, A.",
    product: "HELOC 1st lien",
    amount: "$140,000",
    spend: "$0.98",
  }),

  createInterrupt({
    runId: "run_40211",
    loanRef: "HL-40211",
    type: "policy_judgment",
    step: 5,
    stepLabel: "step 5 of 8 · consumed collateral",
    question:
      "Appraised value sits 8% below the AVM range and the policy card doesn’t cover a gap this size — how should this be ruled?",
    payload: {
      type: "policy_judgment",
      card: "collateral",
      clause:
        "Policy card, collateral §4 — value is consumed from the appraisal, not derived. Where the appraisal falls outside the AVM range, escalate.",
      gap: "The card says escalate but does not say what an acceptable gap is, so there is no threshold to apply.",
      options: [
        { label: "Accept", consequence: "use the appraised value; LTV lands at 78.4%" },
        { label: "Order review", consequence: "hold the file for a second appraisal" },
      ],
    },
    evidence: [
      ev("appraisal", 1, "appraised value · $552,000"),
      ev("AVM report", 1, "range · $600,000 to $624,000"),
    ],
    impact: buildImpact({
      field: "AppraisedValue",
      outcomes: ["approve", "hold"],
      before: "$612,000",
      after: ["$552,000 · LTV 78.4%", "held for a second appraisal"],
      narrative:
        "Accepting keeps LTV at 78.4%, inside the lien-position limit. Ordering a review stops the file until a second appraisal lands, so the two options do not reach the same outcome.",
    }),
    raisedAt: "2026-09-03T12:35:00Z",
    waitedSeconds: 360,
    borrower: "Halvorsen, J.",
    product: "HELOC 2nd lien",
    amount: "$60,000",
    spend: "$1.77",
  }),

  createInterrupt({
    runId: "run_40155",
    loanRef: "HL-40155",
    type: "mandatory_escalation",
    step: 8,
    stepLabel: "step 8 of 8 · decide and document",
    question:
      "Counteroffer drafted — policy requires a human to approve the adverse action reasons, so do these stand?",
    payload: {
      type: "mandatory_escalation",
      reason: "adverse_action",
      drafted: {
        outcome: "counteroffer",
        lineRequested: "$95,000",
        lineSupportable: "$72,000",
      },
      reasonTable: [
        { reason: "Debt-to-income ratio (42.8%)", finding: "DebtToIncomeRatio · step 4" },
        { reason: "Value of collateral", finding: "PropertyValue · step 5" },
      ],
      fairLending: { scanned: true, flags: [] },
    },
    evidence: [
      ev("credit report", 3, "total obligations · $3,180 / mo"),
      ev("appraisal", 1, "appraised value · $410,000"),
    ],
    impact: buildImpact({
      field: "Outcome",
      outcomes: ["counteroffer", "decline"],
      before: "$95,000 requested",
      after: ["$72,000 counteroffer", "decline"],
      narrative:
        "Both reasons match the Chase adverse-action table and each traces to a recorded finding. Fair-lending check passed — no prohibited-basis characteristic entered the reasoning.",
    }),
    raisedAt: "2026-09-03T12:37:00Z",
    waitedSeconds: 240,
    borrower: "Duarte, R.",
    product: "HELOC 2nd lien",
    amount: "$95,000 → $72,000",
    spend: "$2.31",
  }),

  createInterrupt({
    runId: "run_40077",
    loanRef: "HL-40077",
    type: "low_confidence",
    step: 4,
    stepLabel: "step 4 of 8 · obligations and DTI",
    question:
      "The checker couldn’t re-derive the qualifying payment from what the underwriter recorded — which figure stands?",
    payload: {
      type: "low_confidence",
      field: "QualifyingPayment",
      recorded: "$3,418.00",
      rederived: "$3,296.50",
      difference: "$121.50",
      likelyCause: "escrow counted twice, pg 2 and pg 7",
    },
    evidence: [
      ev("mortgage statement", 2, "escrow · $121.50"),
      ev("mortgage statement", 7, "escrow · $121.50"),
    ],
    impact: buildImpact({
      field: "DebtToIncomeRatio",
      derived: [39.8, 38.4],
      before: "39.8%",
      after: ["39.8%", "38.4%"],
      narrative:
        "DTI moves 39.8% to 38.4%. Outcome unchanged, but the recorded figure is what appears on the final record.",
    }),
    raisedAt: "2026-09-03T12:38:00Z",
    waitedSeconds: 180,
    borrower: "Lindqvist, P.",
    product: "HELOC 1st lien",
    amount: "$210,000",
    spend: "$1.51",
  }),

  createInterrupt({
    runId: "run_40190",
    loanRef: "HL-40190",
    type: "conflicting_extraction",
    step: 2,
    stepLabel: "step 2 of 8 · credit read",
    question:
      "Two housing history entries overlap for the same 14 months. Which one is current?",
    payload: {
      type: "conflicting_extraction",
      field: "HousingHistory",
      candidates: [
        { value: "Rented", source: ev("application", 1, "Mar 2024 to present") },
        { value: "Owned", source: ev("credit report", 2, "Jan 2023 to present") },
      ],
    },
    evidence: [
      ev("application", 1, "Rented · Mar 2024 to present"),
      ev("credit report", 2, "Owned · Jan 2023 to present"),
    ],
    impact: buildImpact({
      field: "HousingHistory",
      outcomes: ["approve", "approve"],
      before: "Owned, 6 yr",
      after: ["Rented since Mar 2024", "Owned since Jan 2023"],
      narrative:
        "Changes the housing-history read at step 2, which feeds derogatory handling. No effect on DTI and no effect on the outcome.",
    }),
    raisedAt: "2026-09-03T12:39:00Z",
    waitedSeconds: 120,
    borrower: "Achebe, N.",
    product: "HELOC 2nd lien",
    amount: "$48,000",
    spend: "$0.64",
  }),

  createInterrupt({
    runId: "run_40244",
    loanRef: "HL-40244",
    type: "low_confidence",
    step: 6,
    stepLabel: "step 6 of 8 · insurance and flood",
    question:
      "The flood determination returned two zone codes for adjacent parcels. Which applies to the subject property?",
    payload: {
      type: "low_confidence",
      field: "FloodZone",
      recorded: "Zone X",
      rederived: "Zone AE",
      difference: "one zone band",
      likelyCause: "adjacent parcels 0412-88 and 0412-89 both returned",
    },
    evidence: [
      ev("determination", 1, "parcel 0412-88 · Zone X"),
      ev("determination", 2, "parcel 0412-89 · Zone AE"),
    ],
    impact: buildImpact({
      field: "FloodZone",
      outcomes: ["approve", "approve"],
      before: "Zone X",
      after: ["Zone X", "Zone AE"],
      narrative:
        "Zone AE requires flood insurance before closing and adds a condition to the final record. Zone X does not. The outcome stays an approval either way; the conditions differ.",
    }),
    raisedAt: "2026-09-03T12:40:00Z",
    waitedSeconds: 60,
    borrower: "Mwangi, S.",
    product: "HELOC 1st lien",
    amount: "$118,000",
    spend: "$1.93",
  }),
];

export const interruptLabels: Record<string, string> = {
  conflicting_extraction: "conflicting extraction",
  missing_document: "missing document",
  policy_judgment: "policy judgment",
  mandatory_escalation: "escalation · adverse action",
  low_confidence: "low confidence",
};

export function getInterrupt(loanRef: string) {
  return heldInterrupts.find(
    (interrupt) => interrupt.loanRef.toLowerCase() === loanRef.toLowerCase(),
  );
}

/** 03 §Common shape — the tint follows the type, and escalation reads as adverse. */
export function toneFor(type: Interrupt["type"]): "c-hold" | "c-acc" | "c-dis" {
  if (type === "mandatory_escalation") return "c-dis";
  if (type === "policy_judgment") return "c-acc";
  return "c-hold";
}

export function waitLabel(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.round(seconds / 60)}m`;
}
