import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { currentBatch, runningLoans } from "@/lib/data/batches";
import { heldInterrupts } from "@/lib/data/interrupts";
import { attempts } from "@/lib/data/attempts";
import { queueOrder } from "@/lib/domain/interrupt";
import { activeLoanCrumbs, experimentCrumbs } from "@/lib/crumbs";
import { buildRailModel } from "@/lib/rail-model";

describe("07 §The rail · Active loans, not attempts", () => {
  const model = buildRailModel("evaluations");
  const rail = readFileSync("src/components/shell/rail.tsx", "utf8");

  it("GIVEN the Evaluations rail is open THEN the group heading reads Active loans", () => {
    expect(model.loansLabel).toBe("Active loans");
    expect(rail).toContain("{model.loansLabel}");
    expect(rail).not.toMatch(/>[\s]*attempts[\s]*</);
  });

  it("AND each row shows the borrower name and the loan product on one line", () => {
    const held = queueOrder(heldInterrupts);
    expect(model.loans).toHaveLength(held.length + runningLoans.length);
    const expected = [
      ...held.map((entry) => ({ ...entry, state: "held" })),
      ...runningLoans.map((entry) => ({ ...entry, state: "working" })),
    ];
    for (const [index, loan] of model.loans.entries()) {
      expect(loan.borrower).toBe(expected[index].borrower);
      expect(loan.product).toBe(expected[index].product);
      expect(loan.loanRef).toBe(expected[index].loanRef);
      expect(loan.state).toBe(expected[index].state);
      expect(loan.borrower.length).toBeGreaterThan(0);
      expect(loan.product).toMatch(/^HELOC /);
    }
    expect(rail).toContain("{loan.borrower}");
    expect(rail).toContain("{loan.product}");
    // One line: the loan ref moves to the tooltip rather than a second row.
    expect(rail).toContain("loan.loanRef].filter(Boolean)");
    expect(rail).not.toContain('<span className="mono">{loan.loanRef}</span>');
    // A narrow rail truncates the product rather than wrapping the row.
    const css = readFileSync("src/app/notebook.css", "utf8");
    const row = css.slice(css.indexOf("  .row {"), css.indexOf("  .row .name {"));
    expect(row).toMatch(/white-space:\s*nowrap/);
    const meta = css.slice(css.indexOf("  .row .meta {"), css.indexOf("  .runmark {"));
    expect(meta).toMatch(/text-overflow:\s*ellipsis/);
  });

  it("AND a row opens that loan's file, not an attempt", () => {
    expect(model.loansHref).toBe(`/batches/${currentBatch.id}?filter=open`);
    for (const loan of model.loans) {
      expect(loan.href).not.toMatch(/\/attempts\//);
      if (loan.state === "held") {
        expect(loan.href).toBe(`/batches/${currentBatch.id}/files/${loan.loanRef}`);
      } else {
        // A running file has no pause to answer, so it opens the running filter.
        expect(loan.href).toBe(`/batches/${currentBatch.id}?filter=running`);
      }
    }
  });
});
