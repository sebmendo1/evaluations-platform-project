import { describe, expect, it } from "vitest";

import { buildImpact, computeOutcomeChanges, straddles } from "@/lib/domain/impact";
import {
  canResolve,
  createInterrupt,
  exemptFromThirtySecondRule,
  interruptTypes,
  queueOrder,
  requiresSenior,
  unsourcedAdverseReasons,
  type Evidence,
  type Interrupt,
} from "@/lib/domain/interrupt";
import { skillTextNamesThreshold, threshold } from "@/lib/domain/policy-cards";

const evidence: Evidence = {
  label: "credit report",
  page: 3,
  excerpt: "$612.00",
  extractor: "document-reader",
};

function interrupt(overrides: Partial<Interrupt> = {}): Interrupt {
  return createInterrupt({
    runId: "run_1",
    loanRef: "HL-40128",
    type: "conflicting_extraction",
    step: 4,
    question: "Which is the true source?",
    payload: {
      type: "conflicting_extraction",
      field: "AutoTradelinePayment",
      candidates: [{ value: "$612.00", source: evidence }],
    },
    evidence: [evidence],
    impact: {
      field: "DebtToIncomeRatio",
      before: "41.2%",
      after: ["41.6%"],
      outcomeChanges: false,
      narrative: "Both sit under the policy threshold.",
    },
    raisedAt: "2026-09-03T12:00:00Z",
    waitedSeconds: 720,
    borrower: "Reyes, M.",
    product: "HELOC 2nd lien",
    amount: "$85,000",
    spend: "$1.42",
    stepLabel: "step 4 of 8 · obligations and DTI",
    ...overrides,
  });
}

describe("00 · INV-2 · interrupts are typed", () => {
  it("has exactly five types and no `other`", () => {
    expect(interruptTypes).toHaveLength(5);
    expect(interruptTypes).not.toContain("other");
    expect(interruptTypes).not.toContain("agent_uncertain");
    expect(interruptTypes).not.toContain("needs_review");
  });

  it("no code path can construct an interrupt without evidence", () => {
    // 03 §Acceptance names this exact constraint.
    expect(() => interrupt({ evidence: [] })).toThrow(/no evidence/);
  });

  it("requires the question to be one sentence ending in a question mark", () => {
    expect(() => interrupt({ question: "The source is unclear" })).toThrow(/question mark/);
  });

  it("refuses a payload whose type disagrees with the interrupt type", () => {
    expect(() =>
      interrupt({
        type: "low_confidence",
        payload: {
          type: "conflicting_extraction",
          field: "f",
          candidates: [{ value: "1", source: evidence }],
        },
      }),
    ).toThrow(/does not match/);
  });
});

describe("03 §Common shape · impact.outcome_changes is computed", () => {
  it("straddles a threshold only when candidates land on both sides", () => {
    expect(straddles([41.2, 41.6], 43)).toBe(false);
    expect(straddles([42.8, 43.4], 43)).toBe(true);
    expect(straddles([44.0, 44.5], 43)).toBe(false);
  });

  it("reads the DTI limit from the policy card rather than a literal", () => {
    expect(threshold("dti-thresholds", "standard")).toBe(43);
    expect(threshold("dti-thresholds", "withReserves")).toBe(45);
  });

  it("HL-40128 · both candidates sit under 43%, so the outcome is unchanged", () => {
    expect(
      computeOutcomeChanges({
        field: "DebtToIncomeRatio",
        derived: [41.2, 41.6],
      }),
    ).toBe(false);
  });

  it("a conflict that crosses the card changes the outcome", () => {
    expect(
      computeOutcomeChanges({ field: "DebtToIncomeRatio", derived: [42.8, 43.6] }),
    ).toBe(true);
  });

  it("uses the reserves threshold when reserves apply", () => {
    expect(
      computeOutcomeChanges({
        field: "DebtToIncomeRatio",
        derived: [43.5, 44.2],
        withReserves: true,
      }),
    ).toBe(false);
  });

  it("categorical candidates change the outcome only when they disagree on it", () => {
    expect(
      computeOutcomeChanges({ field: "FloodZone", outcomes: ["approve", "approve"] }),
    ).toBe(false);
    expect(
      computeOutcomeChanges({ field: "AppraisedValue", outcomes: ["approve", "hold"] }),
    ).toBe(true);
  });

  it("refuses to invent a threshold that no card holds", () => {
    expect(() => threshold("dti-thresholds", "invented")).toThrow(/INV-8/);
  });

  it("buildImpact derives the flag rather than accepting one", () => {
    const impact = buildImpact({
      field: "DebtToIncomeRatio",
      derived: [39.8, 38.4],
      before: "39.8%",
      after: ["38.4%"],
      narrative: "Outcome unchanged.",
    });
    expect(impact.outcomeChanges).toBe(false);
  });
});

describe("03 §Routing", () => {
  it("marks the two senior-only types", () => {
    expect(requiresSenior("policy_judgment")).toBe(true);
    expect(requiresSenior("mandatory_escalation")).toBe(true);
    expect(requiresSenior("conflicting_extraction")).toBe(false);
    expect(requiresSenior("missing_document")).toBe(false);
    expect(requiresSenior("low_confidence")).toBe(false);
  });

  it("a reviewer cannot resolve a senior-only type", () => {
    expect(canResolve("policy_judgment", "reviewer")).toBe(false);
    expect(canResolve("mandatory_escalation", "reviewer")).toBe(false);
    expect(canResolve("conflicting_extraction", "reviewer")).toBe(true);
  });

  it("a senior reviewer can resolve everything", () => {
    for (const type of interruptTypes) {
      expect(canResolve(type, "senior_reviewer")).toBe(true);
    }
  });

  it("a bundle owner is not a reviewer and resolves nothing", () => {
    expect(canResolve("conflicting_extraction", "bundle_owner")).toBe(false);
  });

  it("orders the queue by wait time within a routing class, not by priority", () => {
    const ordered = queueOrder([
      interrupt({ loanRef: "HL-1", waitedSeconds: 60 }),
      interrupt({ loanRef: "HL-2", waitedSeconds: 720 }),
      interrupt({ loanRef: "HL-3", waitedSeconds: 300 }),
    ]);
    expect(ordered.map((i) => i.loanRef)).toEqual(["HL-2", "HL-3", "HL-1"]);
  });
});

describe("03 §The 30-second rule", () => {
  it("exempts policy_judgment and nothing else", () => {
    expect(exemptFromThirtySecondRule("policy_judgment")).toBe(true);
    for (const type of interruptTypes.filter((t) => t !== "policy_judgment")) {
      expect(exemptFromThirtySecondRule(type)).toBe(false);
    }
  });
});

describe("03 §Type 4 · adverse reasons trace to findings", () => {
  it("names the unsourced reason rather than failing vaguely", () => {
    const unsourced = unsourcedAdverseReasons({
      type: "mandatory_escalation",
      reason: "adverse_action",
      drafted: {
        outcome: "counteroffer",
        lineRequested: "$95,000",
        lineSupportable: "$72,000",
      },
      reasonTable: [
        { reason: "Debt-to-income ratio (42.8%)", finding: "DebtToIncomeRatio" },
        { reason: "Value of collateral", finding: null },
      ],
      fairLending: { scanned: true, flags: [] },
    });
    expect(unsourced).toEqual(["Value of collateral"]);
  });
});

describe("00 · INV-8 · thresholds live in policy cards, never in skill text", () => {
  it("flags a skill body that names a percentage or a dollar threshold", () => {
    expect(skillTextNamesThreshold("Escalate when DTI exceeds 43%.")).toBe(true);
    expect(skillTextNamesThreshold("Escalate above $50 of disagreement.")).toBe(true);
  });

  it("passes a skill body that describes procedure only", () => {
    expect(
      skillTextNamesThreshold(
        "Assemble the debt picture from each debt's true source and construct the qualifying payment.",
      ),
    ).toBe(false);
  });
});
