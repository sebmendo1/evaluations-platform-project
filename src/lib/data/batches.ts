/**
 * Spec: 02 · Batch, 02 · Run, 06 · autonomy_rate
 *
 * A batch file is a Run. There is no `resolved` state: a file that stopped for a
 * person and then finished is `cleared` with a non-zero interrupt count, which is
 * what makes the displayed autonomy rate derivable under 06's definition.
 */

import { autonomyRate, type RunState } from "../domain/run";
import { heldInterrupts, interruptLabels, waitLabel } from "./interrupts";

export type BatchFile = {
  id: string;
  state: RunState;
  /** Zero is what autonomy counts. 06 · autonomy_rate. */
  interruptCount: number;
  /** Present on held files: which typed interrupt is waiting. */
  interruptLabel?: string;
  sampled?: boolean;
  step: string;
  cost: string;
  age: string;
  /** Figma Loans · borrower + product when known (Active loans table). */
  borrower?: string;
  product?: string;
};

/** Legacy state filters still valid in URLs (crumbs, rail running jump). */
export type BatchFilter =
  | "held"
  | "running"
  | "cleared"
  | "sampled"
  | "all"
  | "pipeline"
  | "open"
  | "reviewed";

/** Figma Loans pills — Pipeline / Open / Reviewed. */
export type LoanTab = "pipeline" | "open" | "reviewed";

export type Batch = {
  id: string;
  bundle: string;
  submittedAt: string;
  state: "running" | "closed";
  spend: string;
  perRun: string;
  note: string;
  lede: string;
  files: BatchFile[];
};

/** Files an agent is working right now. 07 §The rail lists them under Active loans. */
export const runningLoans = [
  { loanRef: "HL-40102", borrower: "Okafor, C.", product: "HELOC 1st lien" },
  { loanRef: "HL-40118", borrower: "Brennan, A.", product: "HELOC 2nd lien" },
  { loanRef: "HL-40133", borrower: "Tran, H.", product: "HELOC 2nd lien" },
  { loanRef: "HL-40147", borrower: "Moreau, J.", product: "HELOC 1st lien" },
  { loanRef: "HL-40160", borrower: "Castillo, R.", product: "HELOC 2nd lien" },
  { loanRef: "HL-40173", borrower: "Whitfield, E.", product: "HELOC 2nd lien" },
  { loanRef: "HL-40188", borrower: "Nakamura, S.", product: "HELOC 1st lien" },
  { loanRef: "HL-40201", borrower: "Adeyemi, T.", product: "HELOC 2nd lien" },
] as const;

const runningIds = runningLoans.map((loan) => loan.loanRef);

/** Deterministic id walk. Reserved ids are skipped so the walk cannot collide
 *  with the held, running or sampled files it runs past. */
function walkIds(start: number, count: number, reserved: Set<string> = new Set()) {
  const ids: string[] = [];
  let n = start;
  let step = 0;
  while (ids.length < count) {
    n += (step % 3) + 2;
    step++;
    const id = `HL-${n}`;
    if (!reserved.has(id)) ids.push(id);
  }
  return ids;
}

const sampledOverrides: Record<number, string> = {
  12: "HL-40119",
  26: "HL-40086",
  48: "HL-40044",
  66: "HL-40012",
  81: "HL-39988",
};

export const sampledIds = Object.values(sampledOverrides);
const sampledSet = new Set(sampledIds);

const clearedIds = walkIds(
  39990,
  93,
  new Set([
    ...heldInterrupts.map((interrupt) => interrupt.loanRef),
    ...runningIds,
    ...sampledIds,
  ]),
);
for (const [index, id] of Object.entries(sampledOverrides)) {
  clearedIds[Number(index)] = id;
}

/**
 * 13 of the 93 cleared files stopped for a person before finishing, which is what
 * makes autonomy 80/93 = 86% rather than 100%. Spread deterministically across
 * the batch rather than clustered.
 */
const MORNING_INTERRUPTED_EVERY = 7;

const clearedBorrowers = [
  "Patel, K.",
  "Nguyen, L.",
  "Silva, R.",
  "Hoffman, D.",
  "Ibrahim, A.",
  "Choi, Y.",
  "Garcia, M.",
  "Andersen, P.",
];

const morningFiles: BatchFile[] = [
  ...heldInterrupts.map((interrupt) => ({
    id: interrupt.loanRef,
    state: "held" as const,
    interruptCount: 1,
    interruptLabel: interruptLabels[interrupt.type],
    step: `${interrupt.step} / 8`,
    cost: interrupt.spend,
    age: waitLabel(interrupt.waitedSeconds),
    borrower: interrupt.borrower,
    product: interrupt.product,
  })),
  ...runningLoans.map((loan, i) => ({
    id: loan.loanRef,
    state: "running" as const,
    interruptCount: 0,
    step: `${(i % 7) + 2} / 8`,
    cost: `$${(1.1 + i * 0.13).toFixed(2)}`,
    age: `${i + 2}m`,
    borrower: loan.borrower,
    product: loan.product,
  })),
  ...clearedIds.map((id, i) => ({
    id,
    state: "cleared" as const,
    interruptCount: i % MORNING_INTERRUPTED_EVERY === 3 ? 1 : 0,
    sampled: sampledSet.has(id),
    step: "8 / 8",
    cost: `$${(1.94 + ((i * 7) % 40) / 100).toFixed(2)}`,
    age: `${12 + i}m`,
    borrower: clearedBorrowers[i % clearedBorrowers.length],
    product: i % 2 === 0 ? "HELOC 2nd lien" : "HELOC 1st lien",
  })),
];

/** 96 cleared, 20 of which stopped for a person: 76/96 = 79% autonomy. */
const AFTERNOON_INTERRUPTED_EVERY = 5;

const afternoonFiles: BatchFile[] = walkIds(39620, 96).map((id, i) => ({
  id,
  state: "cleared" as const,
  interruptCount: i % AFTERNOON_INTERRUPTED_EVERY === 0 ? 1 : 0,
  step: "8 / 8",
  cost: `$${(2.02 + ((i * 11) % 46) / 100).toFixed(2)}`,
  age: `${14 + (i % 21)}m`,
}));

export const batches: Batch[] = [
  {
    id: "batch-0903-am",
    bundle: "0.12.0",
    submittedAt: "09:12",
    state: "running",
    spend: "$237",
    perRun: "$2.19",
    note: "first batch on 0.12.0",
    lede: "108 HELOC · bundle 0.12.0 · started 09:12",
    files: morningFiles,
  },
  {
    id: "batch-0902-pm",
    bundle: "0.11.0",
    submittedAt: "13:40",
    state: "closed",
    spend: "$222",
    perRun: "$2.31",
    note: "last batch on 0.11.0",
    lede: "96 HELOC · bundle 0.11.0 · closed 18:05",
    files: afternoonFiles,
  },
];

export function getBatch(id: string) {
  return batches.find((batch) => batch.id === id);
}

export function countFiles(batch: Batch, state: RunState) {
  return batch.files.filter((file) => file.state === state).length;
}

export function countSampled(batch: Batch) {
  return batch.files.filter((file) => file.sampled).length;
}

/** 06 · autonomy_rate, derived rather than stored. */
export function batchAutonomy(batch: Batch): number | null {
  return autonomyRate(batch.files);
}

export function autonomyLabel(batch: Batch): string {
  const rate = batchAutonomy(batch);
  return rate === null ? "—" : `${Math.round(rate * 100)}%`;
}

/** Cleared files that needed a person. The difference between this and zero is
 *  the difference between the autonomy rate and 100%. */
export function countClearedWithInterrupt(batch: Batch) {
  return batch.files.filter((file) => file.state === "cleared" && file.interruptCount > 0)
    .length;
}

export function loanTabForFilter(filter: BatchFilter): LoanTab {
  if (filter === "pipeline" || filter === "all") return "pipeline";
  if (filter === "reviewed" || filter === "cleared" || filter === "sampled") {
    return "reviewed";
  }
  return "open";
}

export function filterFiles(batch: Batch, filter: BatchFilter) {
  const tab = loanTabForFilter(filter);
  if (filter === "sampled") return batch.files.filter((file) => file.sampled);
  if (filter === "held" || filter === "running" || filter === "cleared") {
    return batch.files.filter((file) => file.state === filter);
  }
  if (tab === "pipeline") return batch.files;
  if (tab === "open") {
    return batch.files.filter(
      (file) => file.state === "held" || file.state === "running",
    );
  }
  return batch.files.filter((file) => file.state === "cleared");
}

/** Figma Loans · three pills with counts. */
export function loanTabs(batch: Batch) {
  const open =
    countFiles(batch, "held") + countFiles(batch, "running");
  const reviewed = countFiles(batch, "cleared");
  return [
    { key: "pipeline" as const, label: "Pipeline", count: batch.files.length },
    { key: "open" as const, label: "Open", count: open },
    { key: "reviewed" as const, label: "Reviewed", count: reviewed },
  ];
}

/** @deprecated Prefer loanTabs — kept for callers that still list state chips. */
export function batchFilters(batch: Batch) {
  return loanTabs(batch).map((tab) => ({
    key: tab.key as BatchFilter,
    label: tab.label,
    count: tab.count,
  }));
}

export function isBatchFilter(value: string | undefined): value is BatchFilter {
  return (
    value === "held" ||
    value === "running" ||
    value === "cleared" ||
    value === "sampled" ||
    value === "all" ||
    value === "pipeline" ||
    value === "open" ||
    value === "reviewed"
  );
}

export function isLoanTab(value: string | undefined): value is LoanTab {
  return value === "pipeline" || value === "open" || value === "reviewed";
}

export const currentBatch = batches[0];
