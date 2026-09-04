import { describe, expect, it } from "vitest";

import {
  autonomyLabel,
  batchAutonomy,
  batches,
  countClearedWithInterrupt,
  countFiles,
  countSampled,
} from "@/lib/data/batches";

const morning = batches[0];
const afternoon = batches[1];

describe("06 · autonomy_rate is derivable from the batch data", () => {
  it("batch-0903-am reports 86% because 80 of 93 cleared files had no interrupt", () => {
    // The prototype previously showed 86% as 93/108, which uses submitted files.
    // 06 defines the denominator as cleared files, so the interrupt-bearing clears
    // have to exist in the data for the figure to be reachable.
    expect(countFiles(morning, "cleared")).toBe(93);
    expect(countClearedWithInterrupt(morning)).toBe(13);
    expect(autonomyLabel(morning)).toBe("86%");
  });

  it("batch-0902-pm reports 79%, matching its ledger row", () => {
    expect(countFiles(afternoon, "cleared")).toBe(96);
    expect(countClearedWithInterrupt(afternoon)).toBe(20);
    expect(autonomyLabel(afternoon)).toBe("79%");
  });

  it("excludes held and running files from both sides of the ratio", () => {
    const rate = batchAutonomy(morning) as number;
    const cleared = countFiles(morning, "cleared");
    const untouched = cleared - countClearedWithInterrupt(morning);
    expect(rate).toBeCloseTo(untouched / cleared, 6);
    expect(countFiles(morning, "held")).toBe(7);
    expect(countFiles(morning, "running")).toBe(8);
  });
});

describe("02 · Batch integrity", () => {
  it("every file id is unique within a batch", () => {
    for (const batch of batches) {
      const ids = batch.files.map((file) => file.id);
      expect(new Set(ids).size, `${batch.id} has duplicate ids`).toBe(ids.length);
    }
  });

  it("the morning batch holds 108 files and draws 5 blind samples", () => {
    expect(morning.files).toHaveLength(108);
    expect(countSampled(morning)).toBe(5);
  });

  it("has no `resolved` state anywhere — 02 · RunState is closed at five values", () => {
    const states = new Set(batches.flatMap((b) => b.files.map((f) => f.state)));
    for (const state of states) {
      expect(["queued", "running", "held", "cleared", "crashed"]).toContain(state);
    }
  });
});
