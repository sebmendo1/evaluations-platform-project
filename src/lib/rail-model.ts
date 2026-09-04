import { batches, currentBatch } from "./data/batches";
import { heldInterrupts } from "./data/interrupts";
import { queueOrder } from "./domain/interrupt";

/** Keys into the hand-built glyph set in components/shell/nav-icons.tsx. */
export type NavIcon =
  | "ask"
  | "overview"
  | "experiments"
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
  /** Treat any nested path as active too. */
  prefix?: boolean;
};

export type RailLoan = {
  href: string;
  borrower: string;
  product: string;
  loanRef: string;
};

/**
 * The rail is navigation between surfaces, and nothing else.
 *
 * Batches and blind review used to live here as their own labelled groups. They are
 * current state rather than places, so `07 §Surface map` puts them under Overview —
 * which is the surface that owns "the current state". The body of the rail is
 * Active loans: held files of the current book, labelled with the borrower name
 * and the product (`07 §The rail`). Attempts stay on `/attempts`; an attempt is a
 * hypothesis, not a loan (`02 · Naming`).
 */
export type RailModel = {
  primary: RailLink[];
  /** The Active loans heading links to the held files of the current batch. */
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

export function buildRailModel(): RailModel {
  return {
    primary: [
      { href: "/ask", label: "Ask Astro", icon: "ask", badge: "⌘J" },
      { href: "/", label: "Overview", icon: "overview" },
      {
        href: "/experiments",
        label: "Experiments",
        icon: "experiments",
        badge: "41",
        prefix: true,
      },
      { href: "/governance", label: "Governance", icon: "governance", badge: "0.12.0" },
      { href: "/reports", label: "Reports", icon: "reports" },
    ],
    loansHref: `/batches/${currentBatch.id}?filter=held`,
    loansLabel: "Active loans",
    loans: queueOrder(heldInterrupts).map((interrupt) => ({
      href: fileHref(interrupt.loanRef),
      borrower: interrupt.borrower,
      product: interrupt.product,
      loanRef: interrupt.loanRef,
    })),
    utility: [{ href: "/settings", label: "Settings", icon: "settings" }],
  };
}
