/**
 * Spec: 02 · Run, 02 · RunState, 06 · autonomy_rate
 *
 * The state machine is closed at five values. There is deliberately no
 * "resolved" state: a run that stopped for a human and then finished is
 * `cleared` with a non-zero interrupt count, because 06 defines autonomy as
 * binary per file over cleared files. Modelling it as a separate state made the
 * displayed autonomy rate underivable.
 */

export type RunState = "queued" | "running" | "held" | "cleared" | "crashed";

export type Run = {
  id: string;
  loanRef: string;
  /** Non-null means this is a graded eval run rather than production work. */
  corpusCaseId: string | null;
  bundleVersion: string;
  batchId: string | null;
  state: RunState;
  currentStep: number;
  /** How many times this run entered `held`. Zero is what autonomy counts. */
  interruptCount: number;
  cost: number;
  startedAt: string;
  clearedAt: string | null;
};

const TERMINAL: RunState[] = ["cleared", "crashed"];

const TRANSITIONS: Record<RunState, RunState[]> = {
  queued: ["running"],
  running: ["held", "cleared", "crashed"],
  held: ["running"],
  cleared: [],
  crashed: [],
};

export function isTerminal(state: RunState): boolean {
  return TERMINAL.includes(state);
}

export function canTransition(from: RunState, to: RunState): boolean {
  return TRANSITIONS[from].includes(to);
}

/** 02 · RunState — "A run in `held` consumes no inference and accrues no cost." */
export function accruesCost(state: RunState): boolean {
  return state === "running";
}

/**
 * 06 · autonomy_rate = files_cleared_with_zero_interrupts / files_cleared
 *
 * The denominator is cleared files. Held and crashed runs are excluded — a file
 * still waiting on a person has not yet demonstrated anything either way.
 */
export function autonomyRate(runs: Pick<Run, "state" | "interruptCount">[]): number | null {
  const cleared = runs.filter((run) => run.state === "cleared");
  if (cleared.length === 0) return null;
  const untouched = cleared.filter((run) => run.interruptCount === 0);
  return untouched.length / cleared.length;
}
