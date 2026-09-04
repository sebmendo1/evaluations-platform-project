import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { currentBatch } from "@/lib/data/batches";
import { heldInterrupts } from "@/lib/data/interrupts";
import { queueOrder } from "@/lib/domain/interrupt";
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
      expect(loan.href).not.toMatch(/\/attempts\//);
    }
  });
});
