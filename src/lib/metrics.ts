/**
 * The metrics dictionary, as code.
 *
 * Spec: 06 · Metrics dictionary — "Single source of truth for every number Astro
 * displays. A metric that is not defined here may not appear on a screen."
 *
 * `06 §Acceptance` requires the provenance label be "enforced in the component,
 * not left to the caller", so the registry carries the label and the `<Metric>`
 * component renders it. A lab metric cannot render in a production context
 * (INV-10) — that throws rather than degrading quietly, because a graded number
 * presented as production truth is the specific mistake this platform exists to
 * stop making.
 */

/** Where a number is being shown. INV-10 turns on this distinction. */
export type MetricContext = "lab" | "production" | "both";

export type MetricId =
  | "autonomy_rate"
  | "cost_per_run"
  | "human_minutes_per_file"
  | "files_in_batch"
  | "graded_runs"
  | "graded_accuracy"
  | "interval"
  | "sampled_accuracy"
  | "held_count"
  | "interrupt_rate_by_type"
  | "resolution_time"
  | "time_to_clear"
  | "gap"
  | "citation_coverage"
  | "escalation_approval_rate"
  | "runs_to_verdict"
  | "thirty_second_breaches";

export type MetricDef = {
  id: MetricId;
  label: string;
  definition: string;
  /** Rendered adjacent to the number, in the same visual unit. */
  provenance: string | null;
  context: MetricContext;
  /** True when the figure must state the n it rests on. */
  needsN?: boolean;
  /** True when the figure depends on an unsourced [INPUT] from 01. */
  unsourced?: boolean;
  /** Types must never be pooled — 06 §resolution_time. */
  perTypeOnly?: boolean;
};

export const metrics: Record<MetricId, MetricDef> = {
  autonomy_rate: {
    id: "autonomy_rate",
    label: "Autonomy",
    definition: "files cleared with zero interrupts / files cleared",
    provenance: null,
    context: "production",
  },
  cost_per_run: {
    id: "cost_per_run",
    label: "Cost per run",
    definition: "total inference cost / runs completed",
    provenance: null,
    context: "both",
  },
  human_minutes_per_file: {
    id: "human_minutes_per_file",
    label: "Human minutes per file",
    definition: "(interrupt minutes + review minutes) / files",
    provenance: "unsourced rate",
    context: "production",
    unsourced: true,
  },
  files_in_batch: {
    id: "files_in_batch",
    label: "Live files",
    definition: "loan files in the batch",
    provenance: "live files",
    context: "production",
  },
  graded_runs: {
    id: "graded_runs",
    label: "Graded runs",
    definition: "eval runs against a labelled corpus",
    provenance: "graded runs",
    context: "lab",
  },
  graded_accuracy: {
    id: "graded_accuracy",
    label: "Accuracy",
    definition: "fields correct / fields graded, on a labelled corpus",
    provenance: "graded",
    context: "lab",
  },
  interval: {
    id: "interval",
    label: "Interval",
    definition: "± at 95%",
    provenance: "95% interval",
    context: "lab",
  },
  sampled_accuracy: {
    id: "sampled_accuracy",
    label: "Sampled accuracy",
    definition: "fields agreed / fields reviewed blind",
    provenance: "sampled",
    context: "production",
    needsN: true,
  },
  held_count: {
    id: "held_count",
    label: "Waiting on you",
    definition: "runs currently held",
    provenance: null,
    context: "production",
  },
  interrupt_rate_by_type: {
    id: "interrupt_rate_by_type",
    label: "Interrupt mix",
    definition: "interrupts of type / total interrupts",
    provenance: "volume, not burden",
    context: "production",
  },
  resolution_time: {
    id: "resolution_time",
    label: "Resolution time",
    definition: "median and p90, by interrupt type",
    provenance: "by type",
    context: "production",
    perTypeOnly: true,
  },
  time_to_clear: {
    id: "time_to_clear",
    label: "Time to clear",
    definition: "cleared_at − started_at, excluding held time",
    provenance: "excludes held time",
    context: "production",
  },
  gap: {
    id: "gap",
    label: "Graded minus sampled",
    definition: "graded_accuracy − sampled_accuracy",
    provenance: "monitored signal",
    context: "both",
  },
  citation_coverage: {
    id: "citation_coverage",
    label: "Fields with a page citation",
    definition: "fields with a source / total fields",
    provenance: "computed fields excepted",
    context: "production",
  },
  escalation_approval_rate: {
    id: "escalation_approval_rate",
    label: "Escalation approval rate",
    definition: "approved / escalated; 100% means rubber-stamping",
    provenance: null,
    context: "production",
  },
  runs_to_verdict: {
    id: "runs_to_verdict",
    label: "Runs to verdict",
    definition: "n at which an experiment separated",
    provenance: null,
    context: "lab",
  },
  thirty_second_breaches: {
    id: "thirty_second_breaches",
    label: "Over thirty seconds",
    definition:
      "share of non-exempt interrupts whose median resolution exceeds 30s — this spec's own health metric",
    provenance: "non-exempt types",
    context: "production",
  },
};

/**
 * 06 §Metrics deliberately absent. Named so a test can assert none of them exists
 * and a reader can see the omissions were decisions.
 */
export const forbiddenMetrics = [
  "confidence_score",
  "reviewer_leaderboard",
  "quality_score",
  "straight_through_processing",
  "accuracy_trend",
] as const;

export function metric(id: MetricId): MetricDef {
  const found = metrics[id];
  if (!found) {
    throw new Error(
      `06: metric "${id}" is not in the dictionary, so it may not appear on a screen`,
    );
  }
  return found;
}

/** INV-10 · a graded figure may never render as a production measurement. */
export function assertContext(id: MetricId, shown: "lab" | "production") {
  const def = metric(id);
  if (def.context === "both") return;
  if (def.context !== shown) {
    throw new Error(
      `INV-10: ${id} is a ${def.context} metric and cannot render in a ${shown} context`,
    );
  }
}
