/**
 * The locked eight-step procedure every run executes.
 *
 * Spec: 00 §What Astro is ("executes a locked procedure"), 05 §1 ("the step
 * skills map one-to-one onto the locked procedure").
 *
 * Attempts are described in terms of these steps rather than in terms of the
 * files that implement them: a reviewer needs to know that the qualifying payment
 * changed at step 4, not that a markdown file gained six lines.
 */

export type ProcedureStep = {
  n: number;
  name: string;
  /** What an underwriter is actually doing at this step. */
  work: string;
};

export const procedure: ProcedureStep[] = [
  {
    n: 1,
    name: "File intake",
    work: "Check the folder is complete and current, and sweep for documents that contradict each other.",
  },
  {
    n: 2,
    name: "Credit read",
    work: "Place the trusted score, read housing history, and handle derogatory items against written policy.",
  },
  {
    n: 3,
    name: "Income orchestration",
    work: "Classify each income source, route it to the right documents, and verify it continues.",
  },
  {
    n: 4,
    name: "Obligations and DTI",
    work: "Assemble every debt from its true source and build the qualifying payment.",
  },
  {
    n: 5,
    name: "Consumed collateral",
    work: "Take property value from the appraisal, then derive loan-to-value and lien position.",
  },
  {
    n: 6,
    name: "Insurance and flood",
    work: "Read the flood determination and set the insurance conditions.",
  },
  {
    n: 7,
    name: "Title review",
    work: "Read the title commitment for vesting, exceptions, and lien position.",
  },
  {
    n: 8,
    name: "Decide and document",
    work: "Derive the supportable line, choose the outcome, and draft conditions and reasons.",
  },
];

export function step(n: number): ProcedureStep {
  const found = procedure.find((entry) => entry.n === n);
  if (!found) {
    throw new Error(`No step ${n}; the procedure is locked at ${procedure.length} steps`);
  }
  return found;
}

export function stepLabel(n: number): string {
  const entry = step(n);
  return `Step ${entry.n} · ${entry.name}`;
}

export function stepsLabel(ns: number[]): string {
  if (ns.length === 0) return "No procedure change";
  if (ns.length === procedure.length) return "Every step";
  if (ns.length === 1) return stepLabel(ns[0]);
  return `Steps ${ns.join(" and ")}`;
}
