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
};

export type BatchFilter = "held" | "running" | "cleared" | "sampled" | "all";

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

const runningIds = [
  "HL-40102",
  "HL-40118",
  "HL-40133",
  "HL-40147",
  "HL-40160",
  "HL-40173",
  "HL-40188",
  "HL-40201",
];

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

const morningFiles: BatchFile[] = [
  ...heldInterrupts.map((interrupt) => ({
    id: interrupt.loanRef,
    state: "held" as const,
    interruptCount: 1,
    interruptLabel: interruptLabels[interrupt.type],
    step: `${interrupt.step} / 8`,
    cost: interrupt.spend,
    age: waitLabel(interrupt.waitedSeconds),
  })),
  ...runningIds.map((id, i) => ({
    id,
    state: "running" as const,
    interruptCount: 0,
    step: `${(i % 7) + 2} / 8`,
    cost: `$${(1.1 + i * 0.13).toFixed(2)}`,
    age: `${i + 2}m`,
  })),
  ...clearedIds.map((id, i) => ({
    id,
    state: "cleared" as const,
    interruptCount: i % MORNING_INTERRUPTED_EVERY === 3 ? 1 : 0,
    sampled: sampledSet.has(id),
    step: "8 / 8",
    cost: `$${(1.94 + ((i * 7) % 40) / 100).toFixed(2)}`,
    age: `${12 + i}m`,
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
    lede: "108 HELOC files submitted at 09:12, running on bundle 0.12.0. Each file is a turn in this thread.",
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
    lede: "96 HELOC files submitted at 13:40 on bundle 0.11.0. Closed at 18:05 with every file decided.",
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

export function filterFiles(batch: Batch, filter: BatchFilter) {
  if (filter === "all") return batch.files;
  if (filter === "sampled") return batch.files.filter((file) => file.sampled);
  return batch.files.filter((file) => file.state === filter);
}

export function batchFilters(batch: Batch) {
  const filters: { key: BatchFilter; label: string; count: number }[] = [];
  const order: RunState[] = ["held", "running", "cleared", "crashed"];
  const names: Record<string, string> = {
    held: "Held",
    running: "Running",
    cleared: "Cleared",
    crashed: "Crashed",
  };

  for (const state of order) {
    const count = countFiles(batch, state);
    if (count > 0) filters.push({ key: state as BatchFilter, label: names[state], count });
  }

  const sampled = countSampled(batch);
  if (sampled > 0) filters.push({ key: "sampled", label: "Sampled", count: sampled });

  filters.push({ key: "all", label: "All", count: batch.files.length });
  return filters;
}

export function isBatchFilter(value: string | undefined): value is BatchFilter {
  return (
    value === "held" ||
    value === "running" ||
    value === "cleared" ||
    value === "sampled" ||
    value === "all"
  );
}

export const currentBatch = batches[0];
