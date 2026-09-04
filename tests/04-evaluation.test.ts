import { describe, expect, it } from "vitest";

import * as verdictModule from "@/lib/domain/verdict";
import { BASELINE } from "@/lib/domain/constants";
import { estimateRun, minimumSeparatingN, wouldSeparate } from "@/lib/domain/estimate";
import {
  canPromote,
  intervalsOverlap,
  inv4Violated,
  verdict,
  type ExperimentResult,
} from "@/lib/domain/verdict";

function result(accuracy: number, interval: number, n = 5): ExperimentResult {
  return { accuracy, interval, fieldsGraded: n * 150, n, status: "complete" };
}

describe("04 §2 · verdict() covers all five outcomes", () => {
  it("returns crash when the run crashed", () => {
    const crashed: ExperimentResult = { ...result(0, 0, 2), status: "crashed" };
    expect(verdict(crashed, BASELINE)).toBe("crash");
  });

  it("returns baseline when there is no incumbent to compare against", () => {
    expect(verdict(result(92.4, 2.0), null)).toBe("baseline");
  });

  it("returns inconclusive when the intervals overlap", () => {
    // 0.11.0 · 93.8 ±1.9 against 92.4 ±2.0 — the gap is real but not separable.
    expect(verdict(result(93.8, 1.9), BASELINE)).toBe("inconclusive");
  });

  it("returns keep when it separates above", () => {
    // 0.12.0 · 96.4 ±1.2 at n=12.
    expect(verdict(result(96.4, 1.2, 12), BASELINE)).toBe("keep");
  });

  it("returns discard when it separates below", () => {
    // At ±1.4 the band's upper edge (90.3) clears the baseline's lower edge (90.4).
    expect(verdict(result(88.9, 1.4, 12), BASELINE)).toBe("discard");
  });
});

describe("spec defect · the ledger's 0.10.1 discard is not derivable", () => {
  it("88.9 ±2.4 overlaps the baseline, so INV-3 forces inconclusive", () => {
    // The ledger and 04 §3 both label the dropped-citations bundle `discard`, but
    // its band [86.5, 91.3] overlaps the baseline's [90.4, 94.4] by 0.9 points.
    // INV-3 admits no override, so the computed verdict disagrees with the record.
    // To genuinely separate below, 0.10.1 needs ±1.5 or tighter, which is n=12
    // rather than the n=5 it ran at. Tracked in specs/04 open questions.
    expect(verdict(result(88.9, 2.4), BASELINE)).toBe("inconclusive");
  });

  it("no baseline in the ledger makes it separate", () => {
    const zeroTenZero = result(93.1, 2.1);
    expect(verdict(result(88.9, 2.4), zeroTenZero)).toBe("inconclusive");
  });
});

describe("04 §2 · interval overlap", () => {
  it("treats touching intervals as overlapping, erring toward inconclusive", () => {
    expect(intervalsOverlap(result(94.4, 0.0), BASELINE)).toBe(true);
  });

  it("separates only when the bands are fully clear of each other", () => {
    expect(intervalsOverlap(result(96.4, 1.2, 12), BASELINE)).toBe(false);
  });

  it("is symmetric", () => {
    const a = result(96.4, 1.2, 12);
    expect(intervalsOverlap(a, BASELINE)).toBe(intervalsOverlap(BASELINE, a));
  });
});

describe("00 · INV-3 · a verdict cannot be entered", () => {
  it("the module exposes a way to derive a verdict and no way to assign one", () => {
    const exported = Object.keys(verdictModule);
    expect(exported).toContain("verdict");
    expect(exported.filter((name) => /^set|assign|override/i.test(name))).toEqual([]);
  });
});

describe("00 · INV-4 · autonomy may never rise at the cost of sampled accuracy", () => {
  it("flags the violating combination", () => {
    expect(inv4Violated(5, -1)).toBe(true);
    expect(inv4Violated(5, 1)).toBe(false);
    expect(inv4Violated(-5, -1)).toBe(false);
  });

  it("blocks a promotion that earns keep but trades accuracy for autonomy", () => {
    const check = canPromote({
      result: result(96.4, 1.2, 12),
      baseline: BASELINE,
      autonomyDelta: 7,
      sampledAccuracyDelta: -1.3,
    });

    expect(check.verdict).toBe("keep");
    expect(check.allowed).toBe(false);
    expect(check.failures.some((f) => f.startsWith("INV-4"))).toBe(true);
  });

  it("allows a promotion where both moved the right way", () => {
    const check = canPromote({
      result: result(96.4, 1.2, 12),
      baseline: BASELINE,
      autonomyDelta: 7,
      sampledAccuracyDelta: 1.1,
    });

    expect(check.allowed).toBe(true);
    expect(check.failures).toEqual([]);
  });

  it("refuses a disabled gate that carries no written reason", () => {
    const check = canPromote({
      result: result(96.4, 1.2, 12),
      baseline: BASELINE,
      autonomyDelta: 7,
      sampledAccuracyDelta: -1.3,
      gateEnabled: false,
    });

    expect(check.allowed).toBe(false);
    expect(check.failures.join(" ")).toContain("without a written reason");
  });

  it("permits an overridden gate when the reason is recorded", () => {
    const check = canPromote({
      result: result(96.4, 1.2, 12),
      baseline: BASELINE,
      autonomyDelta: 7,
      sampledAccuracyDelta: -1.3,
      gateEnabled: false,
      gateDisabledReason: "Sampled n is 70 fields; Compliance accepted the risk in writing.",
    });

    expect(check.allowed).toBe(true);
  });

  it("does not promote an inconclusive result even with no INV-4 conflict", () => {
    const check = canPromote({
      result: result(93.8, 1.9),
      baseline: BASELINE,
      autonomyDelta: 3,
      sampledAccuracyDelta: 0.4,
    });

    expect(check.allowed).toBe(false);
    expect(check.failures[0]).toContain("inconclusive");
  });
});

describe("04 §Pre-flight estimate", () => {
  it("reproduces the spec's stated widths: n=5 is about ±2, n=12 about ±1", () => {
    const five = estimateRun(5);
    const twelve = estimateRun(12);

    expect(Number(five.intervalLabel)).toBeGreaterThan(Number(twelve.intervalLabel));
    expect(five.interval).toBeLessThan(3);
    expect(twelve.interval).toBeLessThan(1.5);
  });

  it("prices 12 runs at the measured cost per run", () => {
    expect(estimateRun(12).cost).toBe("$26.28");
  });

  it("grades 150 fields per run", () => {
    expect(estimateRun(12).fieldsGraded).toBe(1800);
    expect(estimateRun(5).fieldsGraded).toBe(750);
  });

  it("names a minimum separating n rather than only reporting failure", () => {
    const min = minimumSeparatingN();
    expect(min).not.toBeNull();
    expect(wouldSeparate(min as number)).toBe(true);
    expect(wouldSeparate((min as number) - 1)).toBe(false);
  });
});
