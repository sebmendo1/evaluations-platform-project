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

describe("07 §The rail · a running loan is marked, not loaded (08 §7)", () => {
  const model = buildRailModel("evaluations");
  const expRail = buildRailModel("experiments");
  const mark = readFileSync("src/components/shell/run-mark.tsx", "utf8");
  const rail = readFileSync("src/components/shell/rail.tsx", "utf8");

  it("GIVEN an agent is running a loan THEN its row carries the animated dot matrix", () => {
    const running = new Set<string>(runningLoans.map((loan) => loan.loanRef));
    for (const loan of model.loans) {
      expect(loan.state === "working").toBe(running.has(loan.loanRef));
    }
    expect(rail).toContain("<RunMark state={loan.state} />");
    expect(mark).toContain('variant="dot-matrix"');
    expect(mark).toMatch(/state === "working" \?/);
  });

  it("AND a held loan's row carries a still hold-coloured dot", () => {
    expect(model.loans.filter((loan) => loan.state === "held")).toHaveLength(
      heldInterrupts.length,
    );
    expect(mark).toContain("runmark-dot");
    const css = readFileSync("src/app/notebook.css", "utf8");
    const at = css.indexOf(".runmark-held {");
    expect(css.slice(at, at + 80)).toMatch(/color:\s*var\(--p-hold\)/);
  });

  it("AND the animated mark is hidden from assistive technology while the row names its state", () => {
    expect(mark).toContain('aria-hidden="true"');
    expect(mark).toContain("sr-only");
    expect(mark).toContain('working: "agent working"');
    // The loader's own status role would put a live region on every running row.
    expect(mark).toMatch(/<Loader[^>]*\bdecorative\b/);
  });

  it("AND on Experiments only the attempt being graded animates", () => {
    const grading = attempts.filter((attempt) => attempt.stage === "grading");
    expect(expRail.loans.filter((loan) => loan.state === "working")).toHaveLength(
      grading.length,
    );
    expect(expRail.loans.some((loan) => loan.state === "held")).toBe(false);
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
      expect.arrayContaining(["Pipeline", "Open", "Reviewed"]),
    );
    expect(trail[4]?.items.length).toBe(
      currentBatch.files.filter((file) => file.state === "held").length,
    );
    expect(filePage).toContain("activeLoanCrumbs");
  });

  it("GIVEN a reviewer is on an experiment THEN the crumb trail is Experiments › the bundle › the write-up section", () => {
    const attempt = attempts.find((entry) => entry.bundle === "0.12.0");
    expect(attempt).toBeDefined();
    const trail = experimentCrumbs({
      attemptSlug: attempt!.slug,
      section: "procedure",
    });
    expect(trail.map((segment) => segment.label)).toEqual([
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
    expect(trail[1]?.items).toHaveLength(attempts.length);
    expect(crumbs).toContain("Pages under");
    expect(crumbs).toContain("crumb-menu");
  });
});

describe("07 §Two products · product dropdown in the rail brand row", () => {
  const switcher = readFileSync("src/components/shell/product-switch.tsx", "utf8");
  const railSource = readFileSync("src/components/shell/rail.tsx", "utf8");
  const logo = readFileSync("src/components/shell/chase-logo.tsx", "utf8");
  const ask = readFileSync("src/components/ask/chat.tsx", "utf8");
  const evalRail = buildRailModel("evaluations");
  const expRail = buildRailModel("experiments");

  it("THEN the rail brand row carries the Chase mark and a product dropdown", () => {
    expect(railSource).toContain("<ChaseLogo");
    expect(railSource).toContain("<ProductSwitch");
    expect(railSource).not.toContain("Loan Originator");
    expect(railSource).not.toMatch(/brandmark-name/);
    const brandAt = railSource.indexOf('className="rail-brand"');
    const switchAt = railSource.indexOf("<ProductSwitch");
    const primaryAt = railSource.indexOf('className="rail-primary"');
    expect(brandAt).toBeGreaterThan(-1);
    expect(switchAt).toBeGreaterThan(brandAt);
    expect(primaryAt).toBeGreaterThan(switchAt);
  });

  it("AND Loan Originator appears on the Agent home hero, not as a rail lockup", () => {
    expect(ask).toMatch(/ask-hero-name brandtype">Loan Originator</);
  });

  it("AND the dropdown names the current product", () => {
    expect(switcher).toContain("DropdownMenu");
    expect(switcher).toContain("product-switch");
    expect(switcher).toContain("productById(current).label");
    expect(switcher).toContain("ChevronsUpDownIcon");
    expect(switcher).not.toContain("<details");
    expect(switcher).not.toContain("product-seg");
  });

  it("AND choosing the other product opens that product in one click", () => {
    expect(switcher).toContain("href={product.home}");
    expect(switcher).toContain("router.push(returnHref(id))");
    expect(switcher).toContain("products.map");
  });

  it("AND the mark still collapses the rail", () => {
    expect(logo).toContain("toggleRail");
    expect(logo).not.toContain("Evaluations");
    expect(logo).toContain("Collapse the sidebar");
  });

  it("GIVEN a reviewer is in Evaluations THEN the rail lists Agent, Overview and Loans", () => {
    expect(evalRail.primary.map((item) => item.label)).toEqual([
      "Agent",
      "Overview",
      "Loans",
    ]);
    expect(evalRail.utility.map((item) => item.label)).toEqual([
      "Governance",
      "Settings",
    ]);
    expect(evalRail.loansLabel).toBe("Active loans");
    expect(evalRail.primary.some((item) => item.label === "Experiments")).toBe(false);
  });

  it("GIVEN a reviewer is in Experiments THEN the rail lists Experiments and Attempts", () => {
    expect(expRail.primary.map((item) => item.label)).toEqual(["Experiments", "Attempts"]);
    expect(expRail.loansLabel).toBe("Attempts");
    expect(expRail.loans.map((row) => row.href)).toEqual(
      attempts.map((attempt) => `/attempts/${attempt.slug}`),
    );
    expect(expRail.loans.every((row) => row.product === "")).toBe(true);
    expect(expRail.loans.map((row) => row.loanRef)).toEqual(
      attempts.map((attempt) => attempt.bundle),
    );
    expect(expRail.loansHref).toBe("/attempts");
    expect(evalRail.loansLabel).toBe("Active loans");
  });
});

describe("07 §Conversation · Agent empty state (Figma)", () => {
  const ask = readFileSync("src/components/ask/chat.tsx", "utf8");
  const notebook = readFileSync("src/app/notebook.css", "utf8");

  it("GIVEN a reviewer opens Agent with an empty thread THEN Loan Originator is the hero brand signal above the composer", () => {
    expect(ask).toMatch(/ask-hero-name brandtype">Loan Originator</);
    expect(ask).toContain('className="ask-hero"');
    expect(ask).toContain('className="composer-card"');
    const brandAt = ask.indexOf("Loan Originator");
    const composerAt = ask.indexOf("<Composer");
    expect(brandAt).toBeGreaterThan(-1);
    expect(composerAt).toBeGreaterThan(brandAt);
  });

  it("AND Answer/Act is a two-segment pill beside that brand", () => {
    expect(ask).toContain("ModeToggle");
    expect(ask).toMatch(/>\s*Answer\s*</);
    expect(ask).toMatch(/>\s*Act\s*</);
    expect(ask).toContain('role="radiogroup"');
  });

  it("AND the composer uses a soft panel fill with a circular send control", () => {
    const card = notebook.slice(
      notebook.indexOf(".composer-card {"),
      notebook.indexOf(".composer-card {") + 220,
    );
    expect(card).toMatch(/background:\s*var\(--p-panel\)/);
    expect(card).toMatch(/border-radius:\s*16px/);
    const sendAt = notebook.indexOf(".composer-card .composer-send {");
    const send = notebook.slice(sendAt, sendAt + 320);
    expect(send).toMatch(/border-radius:\s*1000px/);
    expect(ask).toContain('aria-label="Send"');
  });

  it("AND the placeholder invites a held file, bundle, or number", () => {
    expect(ask).toContain(
      'placeholder="Ask about a held file, a bundle, or a number"',
    );
  });

  it("AND the empty state carries no suggestion chips and no disclaimer", () => {
    expect(ask).not.toContain("ask-suggestions");
    expect(ask).not.toContain("askSuggestions");
    expect(ask).not.toContain("ask-note");
    expect(ask).not.toContain("composer-scope");
    expect(ask).not.toContain("No model sits behind");
  });
});
