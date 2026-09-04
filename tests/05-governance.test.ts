import { describe, expect, it } from "vitest";

import {
  diffBundles,
  getVersion,
  missingSteps,
  stepCoverage,
} from "@/lib/data/governance";
import { BASELINE } from "@/lib/domain/constants";
import { evaluateGate, gatePasses } from "@/lib/domain/promotion";
import type { ExperimentResult } from "@/lib/domain/verdict";

const live = getVersion("0.12.0");
const retired = getVersion("0.11.0");
const baselineBundle = getVersion("0.9.2");

const CURRENT: ExperimentResult = {
  accuracy: 96.4,
  interval: 1.2,
  fieldsGraded: 1800,
  n: 12,
  status: "complete",
};

describe("05 §1 · a step with no skill is rendered, not omitted", () => {
  it("covers all eight steps in the live bundle", () => {
    expect(stepCoverage(live)).toHaveLength(8);
    expect(missingSteps(live)).toEqual([]);
  });

  it("reports step 7 as a gap in the earlier bundles rather than hiding it", () => {
    // The specs say this gap caused the 0.11.1 crash and sat latent from the
    // baseline. Filtering the skill out of the list hid exactly that.
    expect(missingSteps(retired).map((g) => g.step)).toEqual([7]);
    expect(missingSteps(baselineBundle).map((g) => g.step)).toEqual([7]);
  });

  it("still lists the uncovered step, so the reviewer sees eight rows either way", () => {
    const coverage = stepCoverage(retired);
    expect(coverage).toHaveLength(8);
    expect(coverage.find((entry) => entry.step === 7)?.present).toBe(false);
  });
});

describe("05 §2 · compare diffs all six dimensions", () => {
  const diff = diffBundles(retired, live);

  it("covers model, runtime, effort, tool grants, skills and card pins", () => {
    expect(diff.map((row) => row.dimension)).toEqual([
      "Model",
      "Runtime",
      "Reasoning effort",
      "Checker tool grants",
      "Skills",
      "Policy card pins",
    ]);
  });

  it("marks the checker tool grant as changed", () => {
    const row = diff.find((r) => r.dimension === "Checker tool grants");
    expect(row?.changed).toBe(true);
    expect(row?.to).toContain("obligation_lines");
  });

  it("marks the added skill as changed and names it", () => {
    const row = diff.find((r) => r.dimension === "Skills");
    expect(row?.changed).toBe(true);
    expect(row?.to).toContain("step-7-title-review");
  });

  it("marks the collateral card pin as changed", () => {
    const row = diff.find((r) => r.dimension === "Policy card pins");
    expect(row?.changed).toBe(true);
    expect(row?.to).toContain("collateral");
  });

  it("reports the model as unchanged rather than omitting the row", () => {
    const row = diff.find((r) => r.dimension === "Model");
    expect(row?.changed).toBe(false);
  });
});

describe("05 §4 · the promotion gate states every failure individually", () => {
  const healthy = {
    bundle: live,
    result: CURRENT,
    baseline: BASELINE,
    autonomyDelta: 7.2,
    sampledAccuracyDelta: 1.1,
    modelRiskReviewedAt: "Sep 3, 11:40 · d.nguyen",
    signedBy: live.signedBy,
  };

  it("has all seven conditions", () => {
    expect(evaluateGate(healthy)).toHaveLength(7);
  });

  it("passes for the live bundle as measured", () => {
    const conditions = evaluateGate(healthy);
    expect(gatePasses(conditions)).toBe(true);
  });

  it("blocks on INV-4 while still reporting the keep verdict", () => {
    const conditions = evaluateGate({ ...healthy, sampledAccuracyDelta: -1.4 });
    expect(gatePasses(conditions)).toBe(false);
    expect(conditions.find((c) => c.id === "verdict")?.passed).toBe(true);
    expect(conditions.find((c) => c.id === "inv4")?.passed).toBe(false);
  });

  it("blocks a bundle with an uncovered procedure step", () => {
    const conditions = evaluateGate({ ...healthy, bundle: retired });
    const steps = conditions.find((c) => c.id === "steps");
    expect(steps?.passed).toBe(false);
    expect(steps?.detail).toContain("Step 7");
  });

  it("blocks an unsigned bundle and one with no Model Risk review", () => {
    const conditions = evaluateGate({
      ...healthy,
      signedBy: null,
      modelRiskReviewedAt: null,
    });
    expect(conditions.find((c) => c.id === "signed")?.passed).toBe(false);
    expect(conditions.find((c) => c.id === "model-risk")?.passed).toBe(false);
  });

  it("names more than one failure at once rather than stopping at the first", () => {
    const conditions = evaluateGate({
      ...healthy,
      bundle: retired,
      signedBy: null,
      sampledAccuracyDelta: -1.4,
    });
    const failures = conditions.filter((c) => !c.passed);
    expect(failures.length).toBeGreaterThan(2);
  });

  it("cites the spec clause behind each condition", () => {
    for (const condition of evaluateGate(healthy)) {
      expect(condition.cites).toBeTruthy();
    }
  });
});
