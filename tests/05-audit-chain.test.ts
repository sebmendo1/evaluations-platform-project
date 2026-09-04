import { describe, expect, it } from "vitest";

import {
  chainFor,
  citationCoverage,
  clearedRefs,
  getDecision,
  sampleDecisionRefs,
} from "@/lib/data/decisions";
import { hasPageCitation } from "@/lib/domain/provenance";
import { ruleSummary, thirtySecondRule } from "@/lib/data/reports";

describe("05 §6 · the audit chain resolves from any decision", () => {
  it("resolves for every cleared file, not just a worked example", () => {
    const refs = clearedRefs();
    expect(refs.length).toBeGreaterThan(180);
    // Sample across both batches rather than trusting the first.
    for (const ref of [refs[0], refs[40], refs[120], refs[refs.length - 1]]) {
      expect(getDecision(ref), `${ref} should resolve`).toBeDefined();
    }
  });

  it("does not resolve for a held file, which has no written record", () => {
    expect(getDecision("HL-40128")).toBeUndefined();
  });

  it("is case-insensitive on the loan reference", () => {
    expect(getDecision("hl-40086")).toBeDefined();
  });

  it("INV-9 · every decision names the bundle that produced it", () => {
    for (const ref of sampleDecisionRefs) {
      const record = getDecision(ref);
      expect(record?.decision.bundleVersion).toBeTruthy();
    }
  });

  it("resolves up to the experiment that authorised the bundle", () => {
    const record = getDecision("HL-40086");
    const chain = chainFor(record!);
    expect(chain.attempt).toBeDefined();
    expect(chain.evidence).toMatch(/%.*n \d+/);
  });

  it("resolves every field down to a page or a named formula", () => {
    const record = getDecision("HL-40086");
    for (const field of chainFor(record!).fields) {
      expect(field.citationText, field.name).toBeTruthy();
      expect(["extracted", "computed", "stated"]).toContain(field.provenance.kind);
    }
  });
});

describe("05 §3 · citation coverage", () => {
  it("excludes computed fields as the stated exception rather than counting them as misses", () => {
    const record = getDecision("HL-40119")!;
    const coverage = citationCoverage(record.fields);
    expect(coverage.computedFields).toBeGreaterThan(0);
    expect(coverage.eligible).toBe(coverage.total - coverage.computedFields);
    expect(coverage.coverage).toBe(1);
    expect(coverage.incident).toBe(false);
  });

  it("treats a decline below the floor as an incident", () => {
    const record = getDecision("HL-40119")!;
    const broken = [
      ...record.fields.slice(0, -1),
      // A field whose provenance cannot be traced to a page.
      {
        ...record.fields[record.fields.length - 1],
        provenance: {
          kind: "stated" as const,
          by: "unknown",
          at: "now",
          resolution: "r",
        },
      },
    ];
    const coverage = citationCoverage(broken);
    expect(coverage.coverage).toBeLessThan(1);
    expect(coverage.incident).toBe(true);
  });

  it("a corrected field carries stated provenance and no page", () => {
    const record = getDecision("HL-40086")!;
    const corrected = record.fields.find((f) => f.name === "InvestmentAccounts")!;
    expect(corrected.provenance.kind).toBe("stated");
    expect(hasPageCitation(corrected.provenance)).toBe(false);
    expect(corrected.value).toBe("$38,050");
  });
});

describe("03 §Metrics · the thirty-second rule is measured, not assumed", () => {
  it("exempts exactly one type", () => {
    expect(thirtySecondRule().filter((check) => check.exempt)).toHaveLength(1);
  });

  it("reports that no non-exempt type meets the 30s target today", () => {
    const summary = ruleSummary();
    expect(summary.meetingTarget).toBe(0);
  });

  it("reports which types clear the 90s pilot gate", () => {
    const summary = ruleSummary();
    // conflicting_extraction at 41s and low_confidence at 1m12s clear it;
    // missing_document at 2m30s and mandatory_escalation at 3m20s do not.
    expect(summary.nonExempt).toBe(4);
    expect(summary.clearingPilotGate).toBe(2);
  });

  it("computes the share of interrupt volume in a breaching type", () => {
    const summary = ruleSummary();
    expect(summary.volumeBreaching).toBeGreaterThan(0);
    expect(summary.volumeBreaching).toBeLessThanOrEqual(1);
  });

  it("spec defect · 03 exempts one type but its criteria say three non-exempt", () => {
    // With one exemption there are four non-exempt types, not three. Filed as an
    // open question in specs/03 rather than resolved by adjusting the data.
    const nonExempt = thirtySecondRule().filter((check) => !check.exempt);
    expect(nonExempt).toHaveLength(4);
  });
});
