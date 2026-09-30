import { attempts } from "./data/attempts";
import { batches, currentBatch, runningLoans } from "./data/batches";
import { heldInterrupts } from "./data/interrupts";
import { queueOrder } from "./domain/interrupt";
import type { ProductId } from "./product";

/** Keys into the hand-built glyph set in components/shell/nav-icons.tsx. */
export type NavIcon =
  | "ask"
  | "overview"
  | "experiments"
  | "attempts"
  | "governance"
  | "reports"
  | "batch"
  | "blindReview"
  | "settings";

export type RailLink = {
  href: string;
  label: string;
  icon?: NavIcon;
  badge?: string;
  badgeWarn?: boolean;
  /** A keyboard shortcut, hidden under `pointer: coarse` (08 §4a). */
  badgeKey?: boolean;
  /** Treat any nested path as active too. */
  prefix?: boolean;
};

/**
 * 08 §7 · `working` is the only state that animates: an agent is on this row now.
 * `held` waits on a person; `idle` is queued, drafted or decided.
 */
export type RailLoanState = "working" | "held" | "idle";

export type RailLoan = {
  href: string;
  borrower: string;
  product: string;
  loanRef: string;
  state: RailLoanState;
};

/**
 * The rail is navigation between surfaces, and nothing else.
 *
 * Figma IA · Evaluations: Agent · Overview · Loans; Governance sits in utility.
 * Experiments still carries Attempts in the body list.
 */
export type RailModel = {
  primary: RailLink[];
  /** Heading of the rail body. Links to the default view of that list. */
  loansHref: string;
  loansLabel: string;
  loans: RailLoan[];
  /** Pinned to the bottom — utility rather than a place you work. */
  utility: RailLink[];
};

function fileHref(loanRef: string): string {
  const batch =
    batches.find((entry) => entry.files.some((file) => file.id === loanRef)) ??
    currentBatch;
  return `/batches/${batch.id}/files/${loanRef}`;
}

function evaluationsRail(): RailModel {
  return {
    primary: [
      { href: "/ask", label: "Agent", icon: "ask", badge: "⌘J", badgeKey: true },
      { href: "/", label: "Overview", icon: "overview" },
      {
        href: `/batches/${currentBatch.id}`,
        label: "Loans",
        icon: "batch",
        prefix: true,
      },
    ],
    loansHref: `/batches/${currentBatch.id}?filter=open`,
    loansLabel: "Active loans",
    loans: [
      ...queueOrder(heldInterrupts).map((interrupt) => ({
        href: fileHref(interrupt.loanRef),
        borrower: interrupt.borrower,
        product: interrupt.product,
        loanRef: interrupt.loanRef,
        state: "held" as const,
      })),
      ...runningLoans.map((loan) => ({
        href: `/batches/${currentBatch.id}?filter=running`,
        borrower: loan.borrower,
        product: loan.product,
        loanRef: loan.loanRef,
        state: "working" as const,
      })),
    ],
    utility: [
      { href: "/governance", label: "Governance", icon: "governance", badge: "0.12.0" },
      { href: "/settings", label: "Settings", icon: "settings" },
    ],
  };
}

function experimentsRail(): RailModel {
  return {
    primary: [
      { href: "/experiments", label: "Experiments", icon: "experiments" },
      { href: "/attempts", label: "Attempts", icon: "attempts", prefix: true },
    ],
    loansHref: "/attempts",
    loansLabel: "Attempts",
    loans: attempts.map((attempt) => ({
      href: `/attempts/${attempt.slug}`,
      borrower: attempt.title,
      product: "",
      loanRef: attempt.bundle,
      state: attempt.stage === "grading" ? ("working" as const) : ("idle" as const),
    })),
    utility: [{ href: "/settings", label: "Settings", icon: "settings" }],
  };
}

export function buildRailModel(product: ProductId = "evaluations"): RailModel {
  return product === "experiments" ? experimentsRail() : evaluationsRail();
}
