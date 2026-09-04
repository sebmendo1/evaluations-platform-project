import { describe, expect, it } from "vitest";

import { requiresNamedApproval, writeDecision } from "@/lib/domain/decision";
import {
  citation,
  computed,
  extracted,
  hasPageCitation,
  stated,
} from "@/lib/domain/provenance";
import { createCorrection, createResolution } from "@/lib/domain/resolution";
import { accruesCost, autonomyRate, canTransition, isTerminal } from "@/lib/domain/run";

describe("00 · INV-1 · every recorded field resolves to a source", () => {
  it("builds the three shapes and nothing else", () => {
    expect(extracted("credit report", 3).kind).toBe("extracted");
    expect(computed("dti", ["TotalObligations", "GrossIncome"]).kind).toBe("computed");
    expect(stated("j.park", "2026-09-03T12:09:00Z", "res_1").kind).toBe("stated");
  });

  it("rejects an extracted field with no page", () => {
    expect(() => extracted("credit report", 0)).toThrow(/page number/);
  });

  it("rejects a computed field with no inputs", () => {
    expect(() => computed("dti", [])).toThrow(/input field ids/);
  });

  it("rejects a stated field that names nobody", () => {
    expect(() => stated("", "now", "res_1")).toThrow(/named person/);
  });

  it("renders a citation for each shape", () => {
    expect(citation(extracted("credit report", 3))).toBe("credit report pg 3");
    expect(citation(computed("dti", ["a"]))).toContain("computed");
    expect(citation(stated("j.park", "now", "res_1"))).toContain("j.park");
  });

  it("counts only extracted fields toward page-citation coverage", () => {
    // 05 §3 — computed fields are the stated exception behind the 99.4% figure.
    expect(hasPageCitation(extracted("appraisal", 1))).toBe(true);
    expect(hasPageCitation(computed("dti", ["a"]))).toBe(false);
  });
});

describe("02 · RunState", () => {
  it("has no `resolved` state — a file that stopped and finished is cleared", () => {
    // The prototype previously modelled this as a sixth state, which made the
    // displayed autonomy rate underivable under 06's definition.
    expect(canTransition("held", "running")).toBe(true);
    expect(canTransition("held", "cleared")).toBe(false);
  });

  it("treats cleared and crashed as terminal", () => {
    expect(isTerminal("cleared")).toBe(true);
    expect(isTerminal("crashed")).toBe(true);
    expect(isTerminal("held")).toBe(false);
  });

  it("accrues no cost while held", () => {
    // 02 · RunState and 03 §Non-functional both require this.
    expect(accruesCost("held")).toBe(false);
    expect(accruesCost("running")).toBe(true);
  });
});

describe("06 · autonomy_rate", () => {
  const run = (state: "cleared" | "held" | "crashed", interruptCount: number) => ({
    state,
    interruptCount,
  });

  it("divides zero-interrupt clears by cleared files, not submitted files", () => {
    const runs = [
      ...Array.from({ length: 80 }, () => run("cleared", 0)),
      ...Array.from({ length: 13 }, () => run("cleared", 1)),
      ...Array.from({ length: 7 }, () => run("held", 1)),
      ...Array.from({ length: 8 }, () => run("crashed", 0)),
    ];
    // 80 of 93 cleared = 86%. Held and crashed are excluded from both sides.
    expect(autonomyRate(runs)).toBeCloseTo(0.8602, 3);
  });

  it("is binary per file — one interrupt counts as zero, not as a fraction", () => {
    expect(autonomyRate([run("cleared", 1)])).toBe(0);
    expect(autonomyRate([run("cleared", 4)])).toBe(0);
    expect(autonomyRate([run("cleared", 0)])).toBe(1);
  });

  it("is undefined with nothing cleared yet", () => {
    expect(autonomyRate([run("held", 1)])).toBeNull();
  });
});

describe("02 · Contracts · Resolution writes exactly one Case", () => {
  const base = {
    interruptId: "int_1",
    interruptType: "conflicting_extraction" as const,
    loanRef: "HL-40128",
    step: 4,
    answer: "$612.00",
    resolvedBy: "j.park",
    durationSec: 41,
    at: "2026-09-03T12:00:00Z",
  };

  it("produces a case alongside the resolution, with a non-null id", () => {
    const { resolution, case: labelled } = createResolution(base);
    expect(resolution.caseId).toBe(labelled.id);
    expect(labelled.origin).toBe("production_resolution");
    expect(labelled.expected).toBe("$612.00");
  });

  it("routes the case to the corpus for its interrupt type", () => {
    expect(createResolution(base).case.corpus).toBe("obligations-conflicts");
    expect(
      createResolution({ ...base, interruptType: "missing_document" }).case.corpus,
    ).toBe("heloc-150");
  });

  it("rejects a resolution that names nobody", () => {
    expect(() => createResolution({ ...base, resolvedBy: "" })).toThrow(/name the person/);
  });

  it("requires a rationale for a policy judgment", () => {
    // 03 §Type 3 — the answer becomes the record.
    expect(() =>
      createResolution({ ...base, interruptType: "policy_judgment", answer: "Accept" }),
    ).toThrow(/rationale/);

    expect(() =>
      createResolution({
        ...base,
        interruptType: "policy_judgment",
        answer: "Accept",
        rationale: "Three comparable sales support the appraised value.",
      }),
    ).not.toThrow();
  });
});

describe("02 · Naming · a correction is not a resolution", () => {
  it("writes a blind_review case into the corrections corpus", () => {
    const correction = createCorrection({
      loanRef: "HL-40086",
      field: "InvestmentAccounts",
      trueValue: "$38,050",
      reviewer: "j.park",
      at: "2026-09-03T12:09:00Z",
    });
    expect(correction.origin).toBe("blind_review");
    expect(correction.corpus).toBe("heloc-150-plus-corrections");
  });

  it("requires the true value", () => {
    expect(() =>
      createCorrection({ loanRef: "HL-1", field: "f", trueValue: "  ", reviewer: "j" }),
    ).toThrow(/true value/);
  });
});

describe("00 · INV-5 and INV-9 · the decision write path", () => {
  const approve = {
    runId: "run_1",
    loanRef: "HL-40086",
    outcome: "approve" as const,
    lineSupportable: "$95,000",
    conditions: [],
    adverseReasons: [],
    bundleVersion: "0.12.0",
    approvedBy: null,
    decidedAt: "2026-09-03T12:00:00Z",
  };

  it("writes a clean approval with no approver", () => {
    expect(() => writeDecision(approve)).not.toThrow();
  });

  it("INV-9 · refuses a decision with no bundle version", () => {
    expect(() => writeDecision({ ...approve, bundleVersion: "" })).toThrow(/INV-9/);
  });

  it("INV-5 · refuses a counteroffer with adverse reasons and no named approver", () => {
    expect(() =>
      writeDecision({
        ...approve,
        outcome: "counteroffer",
        adverseReasons: [
          { reason: "Debt-to-income ratio (42.8%)", finding: "DebtToIncomeRatio" },
        ],
        approvedBy: null,
      }),
    ).toThrow(/INV-5/);
  });

  it("INV-5 · accepts it once a human is named", () => {
    expect(() =>
      writeDecision({
        ...approve,
        outcome: "counteroffer",
        adverseReasons: [
          { reason: "Debt-to-income ratio (42.8%)", finding: "DebtToIncomeRatio" },
        ],
        approvedBy: "a.silva",
      }),
    ).not.toThrow();
  });

  it("refuses an adverse reason that traces to no finding", () => {
    expect(() =>
      writeDecision({
        ...approve,
        outcome: "decline",
        adverseReasons: [{ reason: "Value of collateral", finding: null }],
        approvedBy: "a.silva",
      }),
    ).toThrow(/does not trace to a recorded finding/);
  });

  it("names the classes that always need approval", () => {
    expect(requiresNamedApproval("counteroffer")).toBe(true);
    expect(requiresNamedApproval("decline")).toBe(true);
    expect(requiresNamedApproval("approve")).toBe(false);
  });
});
