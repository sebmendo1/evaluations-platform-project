import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  currentBatch,
  filterFiles,
  loanTabForFilter,
  loanTabs,
} from "@/lib/data/batches";

describe("07 §Batch / Loans · Figma Active loans", () => {
  const page = readFileSync("src/app/batches/[batchId]/page.tsx", "utf8");
  const table = readFileSync("src/components/interrupts/batch-table.tsx", "utf8");

  it("GIVEN a reviewer opens Loans THEN the title reads Active loans", () => {
    expect(page).toContain(">Active loans<");
    expect(page).toContain('title: getBatch(batchId) ? "Active loans"');
  });

  it("AND the pills are Pipeline, Open and Reviewed with counts", () => {
    const tabs = loanTabs(currentBatch);
    expect(tabs.map((tab) => tab.label)).toEqual(["Pipeline", "Open", "Reviewed"]);
    expect(tabs[0].count).toBe(currentBatch.files.length);
    expect(tabs[1].count).toBe(
      currentBatch.files.filter(
        (file) => file.state === "held" || file.state === "running",
      ).length,
    );
    expect(tabs[2].count).toBe(
      currentBatch.files.filter((file) => file.state === "cleared").length,
    );
    expect(page).toContain("loans-tabs");
    expect(page).toContain("{tab.label} ({tab.count})");
  });

  it("AND the default pill is Pipeline", () => {
    expect(page).toContain('isBatchFilter(filter) ? filter : "pipeline"');
    expect(loanTabForFilter("pipeline")).toBe("pipeline");
    expect(filterFiles(currentBatch, "pipeline")).toHaveLength(
      currentBatch.files.length,
    );
  });

  it("AND the table columns are Loan, Milestone, Stage, Scope and Updated", () => {
    expect(table).toContain("<th>Loan</th>");
    expect(table).toContain("<th>Milestone</th>");
    expect(table).toContain("<th>Stage</th>");
    expect(table).toContain("<th>Scope</th>");
    expect(table).toContain("<th>Updated</th>");
  });

  it("AND Open lists held then running", () => {
    const open = filterFiles(currentBatch, "open");
    expect(open.every((file) => file.state === "held" || file.state === "running")).toBe(
      true,
    );
    expect(open.some((file) => file.state === "held")).toBe(true);
    expect(open.some((file) => file.state === "running")).toBe(true);
    expect(open.some((file) => file.state === "cleared")).toBe(false);
  });
});
