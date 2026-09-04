import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { currentBatch } from "@/lib/data/batches";
import { heldInterrupts } from "@/lib/data/interrupts";
import { attempts } from "@/lib/data/attempts";
import { queueOrder } from "@/lib/domain/interrupt";
import { activeLoanCrumbs, experimentCrumbs } from "@/lib/crumbs";
import { buildRailModel } from "@/lib/rail-model";

describe("07 §The rail · Active loans, not attempts", () => {
  const model = buildRailModel();
  const rail = readFileSync("src/components/shell/rail.tsx", "utf8");

  it("GIVEN the rail is open THEN the group heading reads Active loans", () => {
    expect(model.loansLabel).toBe("Active loans");
    expect(rail).toContain("{model.loansLabel}");
    expect(rail).not.toMatch(/>[\s]*attempts[\s]*</);
  });

  it("AND each row shows the borrower name and the loan product", () => {
    const expected = queueOrder(heldInterrupts);
    expect(model.loans).toHaveLength(expected.length);
    for (const [index, loan] of model.loans.entries()) {
      expect(loan.borrower).toBe(expected[index].borrower);
      expect(loan.product).toBe(expected[index].product);
      expect(loan.loanRef).toBe(expected[index].loanRef);
      expect(loan.borrower.length).toBeGreaterThan(0);
      expect(loan.product).toMatch(/^HELOC /);
    }
    expect(rail).toContain("{loan.borrower}");
    expect(rail).toContain("{loan.product}");
  });

  it("AND a row opens that loan's file, not an attempt", () => {
    expect(model.loansHref).toBe(`/batches/${currentBatch.id}?filter=held`);
    for (const loan of model.loans) {
      expect(loan.href).toBe(`/batches/${currentBatch.id}/files/${loan.loanRef}`);
      expect(loan.href).not.toMatch(/\/attempts\/);
    }
  });
});

describe("07 §Breadcrumbs · Active loans and Experiments", () => {
  const crumbs = readFileSync("src/components/crumbs.tsx", "utf8");
  const filePage = readFileSync(
    "src/app/batches/[batchId]/files/[fileId]/page.tsx",
    "utf8",
  );
  const experimentPage = readFileSync("src/app/experiments/page.tsx", "utf8");
  const attemptPage = readFileSync("src/app/attempts/[attemptSlug]/page.tsx", "utf8");

  it("GIVEN a reviewer is on a held file THEN the crumb trail is Overview › Active loans › the batch › held › the borrower › the pause", () => {
    const trail = activeLoanCrumbs({
      batchId: currentBatch.id,
      filter: "held",
      loanRef: "HL-40128",
      section: "pause",
    });
    expect(trail.map((segment) => segment.label)).toEqual([
      "Overview",
      "Active loans",
      currentBatch.id,
      "held",
      "Reyes, M.",
      "conflicting extraction",
    ]);
  });

  it("AND the Active loans caret lists every held loan by borrower and product", () => {
    const trail = activeLoanCrumbs({
      batchId: currentBatch.id,
      filter: "held",
      loanRef: "HL-40128",
      section: "pause",
    });
    const loans = trail.find((segment) => segment.label === "Active loans");
    const expected = queueOrder(heldInterrupts);
    expect(loans?.items).toHaveLength(expected.length);
    for (const [index, item] of (loans?.items ?? []).entries()) {
      expect(item.label).toBe(expected[index].borrower);
      expect(item.detail).toContain(expected[index].product);
      expect(item.detail).toContain(expected[index].loanRef);
      expect(item.href).toBe(
        `/batches/${currentBatch.id}/files/${expected[index].loanRef}`,
      );
    }
  });

  it("AND the batch caret lists every batch AND the filter caret lists every filter on that batch AND the borrower caret lists the other held files in that batch", () => {
    const trail = activeLoanCrumbs({
      batchId: currentBatch.id,
      filter: "held",
      loanRef: "HL-40128",
      section: "pause",
    });
    expect(trail[2]?.items.map((item) => item.label)).toContain("batch-0903-am");
    expect(trail[2]?.items.map((item) => item.label)).toContain("batch-0902-pm");
    expect(trail[3]?.items.map((item) => item.label)).toEqual(
      expect.arrayContaining(["held", "running", "cleared", "all"]),
    );
    expect(trail[4]?.items.length).toBe(
      currentBatch.files.filter((file) => file.state === "held").length,
    );
    expect(filePage).toContain("activeLoanCrumbs");
  });

  it("GIVEN a reviewer is on an experiment THEN the crumb trail is Overview › Experiments › the bundle › the write-up section", () => {
    const attempt = attempts.find((entry) => entry.bundle === "0.12.0");
    expect(attempt).toBeDefined();
    const trail = experimentCrumbs({
      attemptSlug: attempt!.slug,
      section: "procedure",
    });
    expect(trail.map((segment) => segment.label)).toEqual([
      "Overview",
      "Experiments",
      "0.12.0",
      "Write-up",
    ]);
  });

  it("AND the Experiments caret lists New experiment, the attempts board, and every attempt", () => {
    const trail = experimentCrumbs({ view: "index" });
    const experiments = trail.find((segment) => segment.label === "Experiments");
    const hrefs = experiments?.items.map((item) => item.href) ?? [];
    expect(hrefs).toContain("/experiments/new");
    expect(hrefs).toContain("/attempts");
    for (const attempt of attempts) {
      expect(hrefs).toContain(`/attempts/${attempt.slug}`);
    }
    expect(experimentPage).toContain("experimentCrumbs");
    expect(attemptPage).toContain("experimentCrumbs");
  });

  it("AND the bundle caret lists the other attempts", () => {
    const attempt = attempts.find((entry) => entry.bundle === "0.12.0");
    const trail = experimentCrumbs({
      attemptSlug: attempt!.slug,
      section: "procedure",
    });
    expect(trail[2]?.items).toHaveLength(attempts.length);
    expect(crumbs).toContain("Pages under");
    expect(crumbs).toContain("crumb-menu");
  });
});
