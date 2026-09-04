/**
 * Spec: 07 §Breadcrumbs.
 *
 * The trail is as deep as the object. Each segment that has children lists every
 * page underneath it, so a reviewer can jump without climbing back to the rail.
 * Active loans and Experiments are the two trees that earn this.
 */

import { attempts } from "./data/attempts";
import {
  batches,
  batchFilters,
  currentBatch,
  getBatch,
  type BatchFilter,
} from "./data/batches";
import { heldInterrupts, interruptLabels } from "./data/interrupts";
import { stepLabel } from "./data/procedure";
import { queueOrder } from "./domain/interrupt";

export type CrumbLink = {
  href: string;
  label: string;
  detail?: string;
  mono?: boolean;
};

export type CrumbSegment = {
  label: string;
  href?: string;
  mono?: boolean;
  current?: boolean;
  items: CrumbLink[];
};

export function overviewSegment(current = false): CrumbSegment {
  return {
    label: "Overview",
    href: "/",
    current,
    items: [
      { href: "/", label: "Waiting on you" },
      { href: "/?section=batches", label: "Batches" },
      { href: "/?section=verify", label: "Blind review" },
      { href: "/?section=ledger", label: "Ledger" },
      { href: "/?section=attempts", label: "Attempts" },
    ],
  };
}

function heldLoanLinks(): CrumbLink[] {
  return queueOrder(heldInterrupts).map((interrupt) => {
    const batch = batchContaining(interrupt.loanRef) ?? currentBatch;
    return {
      href: `/batches/${batch.id}/files/${interrupt.loanRef}`,
      label: interrupt.borrower,
      detail: `${interrupt.product} · ${interrupt.loanRef}`,
    };
  });
}

export function activeLoansSegment(current = false): CrumbSegment {
  return {
    label: "Active loans",
    href: `/batches/${currentBatch.id}?filter=held`,
    current,
    items: heldLoanLinks(),
  };
}

export function batchContaining(loanRef: string) {
  return batches.find((batch) => batch.files.some((file) => file.id === loanRef));
}

function experimentLinks(): CrumbLink[] {
  return [
    { href: "/experiments", label: "All experiments" },
    { href: "/experiments/new", label: "New experiment" },
    { href: "/attempts", label: "Attempts board" },
    ...attempts.map((attempt) => ({
      href: `/attempts/${attempt.slug}`,
      label: attempt.bundle,
      detail: attempt.title,
      mono: true,
    })),
  ];
}

export function experimentsSegment(current = false): CrumbSegment {
  return {
    label: "Experiments",
    href: "/experiments",
    current,
    items: experimentLinks(),
  };
}

export function activeLoanCrumbs(opts: {
  batchId: string;
  filter: BatchFilter;
  loanRef?: string;
  section?: "pause" | "waiting";
}): CrumbSegment[] {
  const batch = getBatch(opts.batchId);
  if (!batch) return [overviewSegment(), activeLoansSegment()];

  const filters = batchFilters(batch);
  const segments: CrumbSegment[] = [
    overviewSegment(),
    activeLoansSegment(),
    {
      label: batch.id,
      href: `/batches/${batch.id}`,
      mono: true,
      items: batches.map((entry) => ({
        href: `/batches/${entry.id}`,
        label: entry.id,
        detail: entry.state,
        mono: true,
      })),
    },
    {
      label: opts.filter,
      href: `/batches/${batch.id}?filter=${opts.filter}`,
      current: !opts.loanRef,
      items: filters.map((entry) => ({
        href: `/batches/${batch.id}?filter=${entry.key}`,
        label: entry.key,
        detail: String(entry.count),
      })),
    },
  ];

  if (!opts.loanRef) return segments;

  const interrupt = heldInterrupts.find((item) => item.loanRef === opts.loanRef);
  const file = batch.files.find((entry) => entry.id === opts.loanRef);

  if (file?.state === "cleared") {
    segments.push({
      label: opts.loanRef,
      href: `/decisions/${opts.loanRef}`,
      mono: true,
      current: true,
      items: [
        {
          href: `/batches/${batch.id}?filter=cleared`,
          label: "All cleared",
        },
        {
          href: `/decisions/${opts.loanRef}`,
          label: opts.loanRef,
          mono: true,
        },
      ],
    });
    return segments;
  }

  const siblings = batch.files.filter((entry) => entry.state === "held");
  const loanHref = `/batches/${batch.id}/files/${opts.loanRef}`;

  segments.push({
    label: interrupt?.borrower ?? opts.loanRef,
    href: loanHref,
    current: !opts.section,
    items: siblings.map((entry) => {
      const held = heldInterrupts.find((item) => item.loanRef === entry.id);
      return {
        href: `/batches/${batch.id}/files/${entry.id}`,
        label: held?.borrower ?? entry.id,
        detail: held ? `${held.product} · ${entry.id}` : entry.id,
      };
    }),
  });

  if (!opts.section || !interrupt) return segments;

  segments.push({
    label:
      opts.section === "waiting"
        ? "Other files waiting"
        : interruptLabels[interrupt.type],
    href: opts.section === "waiting" ? "#waiting" : "#pause",
    current: true,
    items: [
      {
        href: "#pause",
        label: interruptLabels[interrupt.type],
        detail: stepLabel(interrupt.step),
      },
      { href: "#waiting", label: "Other files waiting" },
    ],
  });

  return segments;
}

export function experimentCrumbs(opts: {
  attemptSlug?: string;
  view?: "index" | "new" | "board";
  section?: "procedure" | "queue" | "thread";
}): CrumbSegment[] {
  const segments: CrumbSegment[] = [
    overviewSegment(),
    experimentsSegment(opts.view === "index"),
  ];

  if (opts.view === "new") {
    segments.push({
      label: "New experiment",
      href: "/experiments/new",
      current: true,
      items: experimentLinks(),
    });
    return segments;
  }

  if (opts.view === "board") {
    segments.push({
      label: "Attempts",
      href: "/attempts",
      current: true,
      items: experimentLinks(),
    });
    return segments;
  }

  if (!opts.attemptSlug) return segments;

  const attempt = attempts.find((entry) => entry.slug === opts.attemptSlug);
  segments.push({
    label: attempt?.bundle ?? opts.attemptSlug,
    href: `/attempts/${opts.attemptSlug}`,
    mono: true,
    current: !opts.section,
    items: attempts.map((entry) => ({
      href: `/attempts/${entry.slug}`,
      label: entry.bundle,
      detail: entry.title,
      mono: true,
    })),
  });

  if (!opts.section) return segments;

  const sectionLabel =
    opts.section === "queue"
      ? "What it did to the queue"
      : opts.section === "thread"
        ? "Thread"
        : "Write-up";

  segments.push({
    label: sectionLabel,
    href: `#${opts.section}`,
    current: true,
    items: [
      { href: "#procedure", label: "What changed in the procedure" },
      { href: "#queue", label: "What it did to the queue" },
      { href: "#thread", label: "Thread" },
    ],
  });

  return segments;
}
