export type Verdict =
  | "keep"
  | "discard"
  | "inconclusive"
  | "baseline"
  | "crash"
  | "running"
  | "closed";

export const verdictTone: Record<Verdict, "keep" | "discard" | "hold" | "none"> = {
  keep: "keep",
  discard: "discard",
  inconclusive: "hold",
  baseline: "none",
  crash: "none",
  running: "none",
  closed: "none",
};

/** Mean accuracy with a 95% interval, one row per bundle. Drives the interval plot. */
export type BundleInterval = {
  v: string;
  mean: number;
  err: number;
  n: number;
  verdict: Verdict;
};

export const bundleIntervals: BundleInterval[] = [
  { v: "0.9.2", mean: 92.4, err: 2.0, n: 5, verdict: "baseline" },
  { v: "0.10.0", mean: 93.1, err: 2.1, n: 5, verdict: "inconclusive" },
  { v: "0.10.1", mean: 88.9, err: 2.4, n: 5, verdict: "discard" },
  { v: "0.11.0", mean: 93.8, err: 1.9, n: 5, verdict: "inconclusive" },
  { v: "0.12.0", mean: 96.4, err: 1.2, n: 12, verdict: "keep" },
];

/** Graded accuracy against blind sampled production accuracy. */
export const gradedVsSampled: { v: string; graded: number; sampled: number }[] = [
  { v: "0.9.2", graded: 92.4, sampled: 90.8 },
  { v: "0.10.0", graded: 93.1, sampled: 91.4 },
  { v: "0.11.0", graded: 93.8, sampled: 92.6 },
  { v: "0.12.0", graded: 96.4, sampled: 95.1 },
];

export type LedgerEntry = {
  entry: string;
  kind: "batch" | "eval";
  metric: string;
  runs: number;
  cost: string;
  verdict: Verdict;
  note: string;
  href?: string;
  current?: boolean;
};

export const ledger: LedgerEntry[] = [
  {
    entry: "batch-0903-am",
    kind: "batch",
    metric: "86% autonomy",
    runs: 108,
    cost: "$237",
    verdict: "running",
    note: "first batch on 0.12.0",
    href: "/batches/batch-0903-am",
    current: true,
  },
  {
    entry: "0.12.0",
    kind: "eval",
    metric: "96.4% ±1.2",
    runs: 12,
    cost: "$26.28",
    verdict: "keep",
    note: "step-7 title review; checker sees obligation lines",
    href: "/attempts/add-step-7-title-review",
  },
  {
    entry: "0.11.1",
    kind: "eval",
    metric: "—",
    runs: 2,
    cost: "$3.10",
    verdict: "crash",
    note: "bundle load failed, step-7 skill missing",
  },
  {
    entry: "0.11.0",
    kind: "eval",
    metric: "93.8% ±1.9",
    runs: 5,
    cost: "$10.60",
    verdict: "inconclusive",
    note: "Opus 4.8 to Opus 5, effort xhigh",
    href: "/attempts/move-to-opus-5",
  },
  {
    entry: "batch-0902-pm",
    kind: "batch",
    metric: "79% autonomy",
    runs: 96,
    cost: "$222",
    verdict: "closed",
    note: "last batch on 0.11.0",
    href: "/batches/batch-0902-pm",
  },
  {
    entry: "0.10.1",
    kind: "eval",
    metric: "88.9% ±2.4",
    runs: 5,
    cost: "$11.40",
    verdict: "discard",
    note: "dropped page citations from document-reader",
    href: "/attempts/drop-page-citations",
  },
  {
    entry: "0.10.0",
    kind: "eval",
    metric: "93.1% ±2.1",
    runs: 5,
    cost: "$11.55",
    verdict: "inconclusive",
    note: "split step-4 into obligations and qualifying payment",
    href: "/attempts/split-step-4-in-two",
  },
  {
    entry: "0.9.2",
    kind: "eval",
    metric: "92.4% ±2.0",
    runs: 5,
    cost: "$12.25",
    verdict: "baseline",
    note: "HELOC File Review v1, Opus 4.8",
  },
];

export type ExperimentRow = {
  bundle: string;
  hypothesis: string;
  accuracy: string;
  runs: number;
  cost: string;
  separates: string;
  separatesTone: "keep" | "discard" | "hold" | "none";
  verdict: Verdict;
  href?: string;
  current?: boolean;
};

export const experimentRows: ExperimentRow[] = [
  {
    bundle: "0.12.0",
    hypothesis: "step-7 title review; checker sees obligation lines",
    accuracy: "96.4% ±1.2",
    runs: 12,
    cost: "$26.28",
    separates: "yes, above",
    separatesTone: "keep",
    verdict: "keep",
    href: "/attempts/add-step-7-title-review",
    current: true,
  },
  {
    bundle: "0.11.1",
    hypothesis: "same, first build",
    accuracy: "—",
    runs: 2,
    cost: "$3.10",
    separates: "—",
    separatesTone: "none",
    verdict: "crash",
    href: "/attempts/add-step-7-title-review",
  },
  {
    bundle: "0.11.0",
    hypothesis: "Opus 4.8 to Opus 5, reasoning effort xhigh",
    accuracy: "93.8% ±1.9",
    runs: 5,
    cost: "$10.60",
    separates: "no, overlaps",
    separatesTone: "hold",
    verdict: "inconclusive",
    href: "/attempts/move-to-opus-5",
  },
  {
    bundle: "0.10.1",
    hypothesis: "drop page citations from document-reader",
    accuracy: "88.9% ±2.4",
    runs: 5,
    cost: "$11.40",
    separates: "yes, below",
    separatesTone: "discard",
    verdict: "discard",
    href: "/attempts/drop-page-citations",
  },
  {
    bundle: "0.10.0",
    hypothesis: "split step-4 into obligations and qualifying payment",
    accuracy: "93.1% ±2.1",
    runs: 5,
    cost: "$11.55",
    separates: "no, overlaps",
    separatesTone: "hold",
    verdict: "inconclusive",
    href: "/attempts/split-step-4-in-two",
  },
  {
    bundle: "0.9.2",
    hypothesis: "HELOC File Review v1, Opus 4.8",
    accuracy: "92.4% ±2.0",
    runs: 5,
    cost: "$12.25",
    separates: "—",
    separatesTone: "none",
    verdict: "baseline",
  },
];

export const experimentKpis = [
  { lab: "Experiments", val: "6", sub: "since Aug 12" },
  { lab: "Graded runs", val: "41", sub: "6,150 fields" },
  { lab: "Eval spend", val: "$75.18", sub: "$1.83 per run" },
  { lab: "Reached a verdict", val: "4 of 6", sub: "2 still inconclusive" },
  { lab: "Median runs to verdict", val: "5", sub: "12 needed to separate" },
];

export type FieldFailureRow = {
  field: string;
  counts: string[];
  improved: boolean;
  reading: string;
};

export const fieldFailures: FieldFailureRow[] = [
  {
    field: "DebtToIncomeRatio",
    counts: ["8", "7", "6", "1"],
    improved: true,
    reading: "fixed by giving the checker obligation lines",
  },
  {
    field: "InvestmentAccounts",
    counts: ["3", "3", "3", "3"],
    improved: false,
    reading: "flat — a missing-document problem, not reasoning",
  },
  {
    field: "HousingHistory",
    counts: ["2", "2", "1", "0"],
    improved: true,
    reading: "resolved incidentally",
  },
  {
    field: "FloodZone",
    counts: ["1", "1", "1", "1"],
    improved: false,
    reading: "single ambiguous parcel in the corpus",
  },
];

export const runnerOptions = {
  bundles: [
    "0.12.1-draft — source precedence",
    "0.12.0 — current",
    "0.11.0",
  ],
  corpora: [
    "obligations-conflicts — 20 cases from production",
    "heloc-150 — standard graded set",
    "heloc-150 plus corrections since Aug 1",
  ],
  graders: ["strict — field-exact", "tolerant — numeric within 0.5%"],
};
