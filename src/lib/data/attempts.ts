/**
 * Attempts — one hypothesis about the underwriting procedure, tested at a stated
 * number of runs.
 *
 * Spec: 04 §1 · Experiments, 02 · Experiment, 01 §3 · The value driver
 *
 * Written in the language of the work rather than the language of the change:
 * what an attempt did to a step, what it did to the reviewer's queue, and what
 * the evidence was. Verdicts are computed by `verdict()` and never stored, per
 * INV-3.
 */

import { BASELINE } from "../domain/constants";
import { verdict, type ExperimentResult, type Verdict } from "../domain/verdict";
import type { RichText } from "../rich-text";

/** Where an attempt sits in the loop described in 01 §3. */
export type AttemptStage = "drafted" | "grading" | "decided";

export type ProcedureChange = {
  /** Steps of the locked procedure this touches. Empty means no step changed. */
  steps: number[];
  /** What the run used to do. */
  before: string;
  /** What it does now. */
  after: string;
};

export type AttemptResult = ExperimentResult & { cost: string; wallMinutes: number };

export type Turn =
  | { who: string; kind: "prompt"; paras: RichText[] }
  | { who: string; kind: "user"; paras: RichText[] }
  | { who: string; kind: "message"; paras: RichText[]; action?: ActionBox };

export type ActionBox = {
  text: RichText;
  buttons: { label: string; href?: string; primary?: boolean }[];
};

export type Attempt = {
  slug: string;
  title: string;
  /** One sentence a reviewer can read without context. */
  summary: string;
  stage: AttemptStage;
  owner: string;
  /** The bundle this attempt produced, and what it came from. */
  bundle: string;
  from: string;
  hypothesis: string;
  changes: ProcedureChange[];
  corpus: string;
  runsPlanned: number;
  runsGraded: number;
  grader: "strict" | "tolerant";
  result: AttemptResult | null;
  /** What it did, or would do, to the interrupt queue. This is the link between
   *  an experiment and the human on the other end of it (01 §3). */
  queueEffect: string;
  draftedOn: string;
  decidedOn: string | null;
  promoted: boolean;
  turns: Turn[];
};

const CORPUS = {
  standard: "150-field standard set",
  conflicts: "20 obligation conflicts from production",
} as const;

export const attempts: Attempt[] = [
  {
    slug: "add-title-review",
    title: "Add title review, and show the checker the obligations",
    summary:
      "Added the missing title step and let the checker rebuild the qualifying payment from the individual debts.",
    stage: "decided",
    owner: "s.mendo",
    bundle: "0.12.0",
    from: "0.11.1",
    hypothesis:
      "Debt-to-income keeps failing for “calculation mismatch”. The checker can only see the total the underwriter wrote down, never the individual obligations behind it, so it cannot rebuild the qualifying payment the way a person would. Give it those lines. And add the title step, which has been missing since the baseline.",
    changes: [
      {
        steps: [7],
        before:
          "Title was never read. Vesting, exceptions and lien position went unconfirmed on every file.",
        after:
          "The title commitment is read and lien position is confirmed before the file can be decided.",
      },
      {
        steps: [4],
        before:
          "The checker re-derived the qualifying payment from the recorded total alone, so any disagreement read as arithmetic it could not reproduce.",
        after:
          "The checker sees each obligation line and rebuilds the payment from the debts themselves.",
      },
    ],
    corpus: CORPUS.standard,
    runsPlanned: 12,
    runsGraded: 12,
    grader: "strict",
    result: {
      accuracy: 96.4,
      interval: 1.2,
      fieldsGraded: 1800,
      n: 12,
      status: "complete",
      cost: "$26.28",
      wallMinutes: 41,
    },
    queueEffect:
      "Closed the calculation-mismatch stops at step 4 — debt-to-income failures fell from 8 in 150 to 1. Autonomy rose from 79% to 86% on the first batch. It did nothing for conflicting extractions, which are still 2 of the 7 files waiting.",
    draftedOn: "2026-09-01",
    decidedOn: "2026-09-03",
    promoted: true,
    turns: [
      {
        who: "you",
        kind: "prompt",
        paras: [
          [
            "Debt-to-income keeps failing for “calculation mismatch”. The checker can only see the total the underwriter wrote down, never the individual obligations behind it, so it cannot rebuild the qualifying payment the way a person would. Give it those lines. And add the title step, which has been missing since the baseline.",
          ],
        ],
      },
      {
        who: "astro",
        kind: "message",
        paras: [
          [
            "Two changes. Step 7 now reads the title commitment, which no version has done since the baseline — that is the gap behind the failed build on ",
            { mono: "0.11.1" },
            ". At step 4 the checker is handed each obligation line alongside the recorded total.",
          ],
          [
            "Graded 12 runs against the 150-field standard set, strict. ",
            { mono: "96.4% ±1.2" },
            " against a ",
            { mono: "92.4% ±2.0" },
            " baseline — the intervals separate, which is the first real movement since the baseline. Debt-to-income failures fell from 8 in 150 to 1, and the one that remains is a genuine document conflict rather than arithmetic.",
          ],
          [
            "It costs seven cents more per file, all of it the extra context the checker now reads.",
          ],
        ],
      },
      {
        who: "you",
        kind: "user",
        paras: [["has it held up on live files?"]],
      },
      {
        who: "astro",
        kind: "message",
        paras: [
          [
            "Partly. Autonomy went 79% to 86% on the first batch, the largest single move so far. But blind review of files that cleared on their own reads ",
            { mono: "95.1%" },
            " against the ",
            { mono: "96.4%" },
            " graded — expected on live files, and worth watching rather than announcing.",
          ],
          [
            "Of the 7 files still waiting, 2 are conflicting extractions, which this attempt did not address.",
          ],
        ],
        action: {
          text: [
            "Twenty of those conflicts share one shape. Test a rule that prefers the lender statement when the two sources disagree by little?",
          ],
          buttons: [
            { label: "Draft the attempt", href: "/experiments/new", primary: true },
            { label: "Not now" },
          ],
        },
      },
    ],
  },

  {
    slug: "widen-what-the-checker-sees",
    title: "Widen what the checker can see",
    summary:
      "The checker only sees the step it is verifying, so it cannot cross-check reserves or the flood determination against the rest of the file.",
    stage: "grading",
    owner: "s.mendo",
    bundle: "0.12.1-draft",
    from: "0.12.0",
    hypothesis:
      "The checker is handed only the slice of the worksheet belonging to the step under review. That means it cannot see reserves when it checks collateral, or the flood determination when it checks insurance. Give it the whole worksheet and re-grade.",
    changes: [
      {
        steps: [5, 6],
        before:
          "The checker verified each step against that step's entries alone, so a figure that only looks wrong next to another step's entry passed.",
        after:
          "The checker reads the whole worksheet and can contradict a figure using anything already recorded on the file.",
      },
    ],
    corpus: CORPUS.standard,
    runsPlanned: 12,
    runsGraded: 8,
    grader: "strict",
    result: {
      accuracy: 96.9,
      interval: 1.6,
      fieldsGraded: 1200,
      n: 8,
      status: "complete",
      cost: "$17.44",
      wallMinutes: 27,
    },
    queueEffect:
      "Would likely close the flood-zone stops, which are 1 of the 7 waiting. Nothing to claim yet — at eight runs the interval still overlaps the bundle it is trying to beat.",
    draftedOn: "2026-09-03",
    decidedOn: null,
    promoted: false,
    turns: [
      {
        who: "you",
        kind: "prompt",
        paras: [
          [
            "The checker is handed only the slice of the worksheet belonging to the step under review. That means it cannot see reserves when it checks collateral, or the flood determination when it checks insurance. Give it the whole worksheet and re-grade.",
          ],
        ],
      },
      {
        who: "astro",
        kind: "message",
        paras: [
          [
            "Eight of twelve runs graded so far: ",
            { mono: "96.9% ±1.6" },
            ". That interval still overlaps ",
            { mono: "0.12.0" },
            ", so there is nothing to call — the remaining four runs should narrow it to about ±1.2.",
          ],
          [
            "No new failure shapes have appeared. Flood zone is still the one ambiguous parcel in the set.",
          ],
        ],
      },
      {
        who: "astro",
        kind: "message",
        paras: [
          [
            "Nothing reaches the ledger until the run finishes. A partial result is not a record, and reading one as though it were is how a bundle gets promoted on noise.",
          ],
        ],
      },
    ],
  },

  {
    slug: "move-to-a-newer-model",
    title: "Move to a newer model",
    summary:
      "Raised the underlying model and how hard it reasons. No change to the procedure itself.",
    stage: "decided",
    owner: "s.mendo",
    bundle: "0.11.0",
    from: "0.10.1",
    hypothesis:
      "A newer model is available. Raise it and the reasoning effort, change nothing about the procedure, and grade against the standard set before we touch any of the steps.",
    changes: [
      {
        steps: [],
        before: "The previous model at standard reasoning effort.",
        after:
          "A newer model reasoning harder on every step. The procedure, the policy cards and the checker are untouched.",
      },
    ],
    corpus: CORPUS.standard,
    runsPlanned: 5,
    runsGraded: 5,
    grader: "strict",
    result: {
      accuracy: 93.8,
      interval: 1.9,
      fieldsGraded: 750,
      n: 5,
      status: "complete",
      cost: "$10.60",
      wallMinutes: 19,
    },
    queueEffect:
      "No measurable change to what stops. The lesson is about evidence rather than the model: a 1.4-point move needs roughly 20 runs to prove at this spread, and five will never do it.",
    draftedOn: "2026-08-28",
    decidedOn: "2026-08-29",
    promoted: false,
    turns: [
      {
        who: "you",
        kind: "prompt",
        paras: [
          [
            "A newer model is available. Raise it and the reasoning effort, change nothing about the procedure, and grade against the standard set before we touch any of the steps.",
          ],
        ],
      },
      {
        who: "astro",
        kind: "message",
        paras: [
          [
            { mono: "93.8% ±1.9" },
            " against a ",
            { mono: "92.4% ±2.0" },
            " baseline. The intervals overlap, so the 1.4-point gain is not separable at five runs. Cost per file rose nineteen cents from the higher effort.",
          ],
        ],
      },
      { who: "you", kind: "user", paras: [["worth running it at twelve to find out?"]] },
      {
        who: "astro",
        kind: "message",
        paras: [
          [
            "Probably not on its own. At this spread a 1.4-point move needs roughly 20 runs to separate, about $42. The same money spent on the step-4 change bought four points at twelve runs.",
          ],
          [
            "Model upgrades are cheap to adopt and expensive to prove. The bundle carries the newer model either way — the honest record is that this attempt did not demonstrate the gain.",
          ],
        ],
      },
    ],
  },

  {
    slug: "split-obligations-from-the-payment",
    title: "Split obligations from the qualifying payment",
    summary:
      "Step 4 was assembling the debt picture and building the qualifying payment in one pass. Split so each half can be checked on its own.",
    stage: "decided",
    owner: "s.mendo",
    bundle: "0.10.0",
    from: "0.9.2",
    hypothesis:
      "Step 4 does two jobs at once — gathering every debt from its true source, and turning them into the qualifying payment. Separate them so each has its own acceptance criteria and the checker can verify them independently.",
    changes: [
      {
        steps: [4],
        before:
          "One pass gathered the debts and produced the payment, so a wrong payment and a missed debt looked the same from outside.",
        after:
          "Two halves with their own acceptance criteria. The checker can say which half it disagrees with.",
      },
    ],
    corpus: CORPUS.standard,
    runsPlanned: 5,
    runsGraded: 5,
    grader: "strict",
    result: {
      accuracy: 93.1,
      interval: 2.1,
      fieldsGraded: 750,
      n: 5,
      status: "complete",
      cost: "$11.55",
      wallMinutes: 22,
    },
    queueEffect:
      "Debt-to-income failures moved 8 to 7 in 150 — the split made the procedure easier to read without giving the checker anything new to check against. The structure was kept; the accuracy claim was not made.",
    draftedOn: "2026-08-17",
    decidedOn: "2026-08-18",
    promoted: false,
    turns: [
      {
        who: "you",
        kind: "prompt",
        paras: [
          [
            "Step 4 does two jobs at once — gathering every debt from its true source, and turning them into the qualifying payment. Separate them so each has its own acceptance criteria and the checker can verify them independently.",
          ],
        ],
      },
      {
        who: "astro",
        kind: "message",
        paras: [
          [
            { mono: "93.1% ±2.1" },
            " against ",
            { mono: "92.4% ±2.0" },
            " — overlapping intervals. Debt-to-income failures went 8 to 7 in 150.",
          ],
          [
            "The split made the procedure easier to read without giving the checker anything new to check against, which is why the number barely moved. Worth keeping for legibility; not worth claiming as accuracy.",
          ],
        ],
      },
    ],
  },

  {
    slug: "drop-the-page-references",
    title: "Drop the page references",
    summary:
      "Removed the page reference the document reader returned with every value, to see whether accuracy held. It did not.",
    stage: "decided",
    owner: "s.mendo",
    bundle: "0.10.1",
    from: "0.10.0",
    hypothesis:
      "The document reader returns a page reference with every value it pulls. That is a lot of output on a document-heavy file. Drop it and see whether accuracy holds — if it does, every document step gets cheaper.",
    changes: [
      {
        steps: [1, 2, 3, 5, 6],
        before:
          "Every extracted value arrived with the document and page it came from.",
        after:
          "Values arrived bare. Cheaper to produce, and impossible to check against the source.",
      },
    ],
    corpus: CORPUS.standard,
    runsPlanned: 5,
    runsGraded: 5,
    grader: "strict",
    result: {
      accuracy: 88.9,
      interval: 2.4,
      fieldsGraded: 750,
      n: 5,
      status: "complete",
      cost: "$11.40",
      wallMinutes: 18,
    },
    queueEffect:
      "The stops disappeared and the errors did not. Without a page reference the checker cannot tell a misread from a disagreement, so it stopped flagging either — a cheaper file that nobody could verify. Reverted, and kept as the case that proves why citations are not overhead.",
    draftedOn: "2026-08-19",
    decidedOn: "2026-08-20",
    promoted: false,
    turns: [
      {
        who: "you",
        kind: "prompt",
        paras: [
          [
            "The document reader returns a page reference with every value it pulls. That is a lot of output on a document-heavy file. Drop it and see whether accuracy holds — if it does, every document step gets cheaper.",
          ],
        ],
      },
      {
        who: "astro",
        kind: "message",
        paras: [
          [
            { mono: "88.9% ±2.4" },
            ", below the ",
            { mono: "92.4% ±2.0" },
            " baseline. Cost fell eleven cents a file. The failures spread across fields rather than clustering, which is the tell.",
          ],
        ],
      },
      {
        who: "you",
        kind: "user",
        paras: [["why did it get worse rather than just cheaper?"]],
      },
      {
        who: "astro",
        kind: "message",
        paras: [
          [
            "Because the page reference is what makes checking possible, not what makes reading accurate. The reader was no less correct than before.",
          ],
          [
            "What it lost was the checker's only way to go back to the source, so the disagreements stopped being raised at all. The drop is verification collapsing, not reading getting worse — which is why this row stays in the ledger instead of being deleted.",
          ],
        ],
      },
    ],
  },

  {
    slug: "prefer-the-lender-statement",
    title: "Prefer the lender statement on small disagreements",
    summary:
      "Sixteen of twenty obligation conflicts resolved to the lender statement. Stop asking when the two sources are close.",
    stage: "drafted",
    owner: "s.mendo",
    bundle: "0.12.1-draft",
    from: "0.12.0",
    hypothesis:
      "Sixteen of the twenty obligation conflicts a person has resolved came down to the lender statement rather than the credit report. Prefer it at step 4, and only ask when the two disagree by more than $50.",
    changes: [
      {
        steps: [4],
        before:
          "Any disagreement between the credit report and the lender statement stops the file and asks a person.",
        after:
          "The lender statement is preferred when the two are within $50 of each other. Larger gaps still ask.",
      },
    ],
    corpus: CORPUS.conflicts,
    runsPlanned: 12,
    runsGraded: 0,
    grader: "strict",
    result: null,
    queueEffect:
      "Would remove roughly three of every four conflicting-extraction stops — 78 of them over ten days at 41 seconds each. It is also precisely the change the autonomy guardrail exists to police: a wrong pick under $50 raises autonomy and lowers accuracy at the same time, and only blind review would ever see it.",
    draftedOn: "2026-09-03",
    decidedOn: null,
    promoted: false,
    turns: [
      {
        who: "you",
        kind: "prompt",
        paras: [
          [
            "Sixteen of the twenty obligation conflicts a person has resolved came down to the lender statement rather than the credit report. Prefer it at step 4, and only ask when the two disagree by more than $50.",
          ],
        ],
      },
      {
        who: "astro",
        kind: "message",
        paras: [
          [
            "Drafted, not run. The set is the twenty conflicts pulled from files a person already answered, so it tests the change against real disagreements rather than invented ones. At twelve runs the estimate is ",
            { mono: "$26.28" },
            " and about 41 minutes.",
          ],
          [
            "Worth saying before you spend it: this removes a question rather than correcting a wrong answer. If the rule fires on a pair that differs by less than $50 and picks the wrong side, autonomy goes up while accuracy goes down, and the only thing that would notice is blind review.",
          ],
        ],
        action: {
          text: ["Open the runner with this hypothesis loaded?"],
          buttons: [
            { label: "Open runner", href: "/experiments/new", primary: true },
            { label: "Discard draft" },
          ],
        },
      },
    ],
  },
];

/** INV-3 · computed, never stored. */
export function attemptVerdict(attempt: Attempt): Verdict | "pending" {
  if (attempt.result === null) return "pending";
  if (attempt.stage === "grading") return "pending";
  return verdict(attempt.result, BASELINE);
}

/** The five columns of the loop in 01 §3, as a board reads them. */
export type BoardColumn = "drafted" | "grading" | "inconclusive" | "kept" | "discarded";

export const boardColumns: { key: BoardColumn; label: string; blurb: string }[] = [
  {
    key: "drafted",
    label: "Drafted",
    blurb: "A hypothesis with a set to test it against. Nothing spent yet.",
  },
  {
    key: "grading",
    label: "Grading",
    blurb: "Running. No verdict until every run is in.",
  },
  {
    key: "inconclusive",
    label: "Inconclusive",
    blurb: "Graded, but the interval overlaps. The change may have worked; the evidence cannot say.",
  },
  { key: "kept", label: "Kept", blurb: "Separated above baseline and promoted." },
  {
    key: "discarded",
    label: "Discarded",
    blurb: "Separated below, and reverted. These rows are the most useful in the ledger.",
  },
];

export function columnFor(attempt: Attempt): BoardColumn {
  if (attempt.stage === "drafted") return "drafted";
  if (attempt.stage === "grading") return "grading";
  const computed = attemptVerdict(attempt);
  if (computed === "keep") return "kept";
  if (computed === "discard") return "discarded";
  return "inconclusive";
}

export function getAttempt(slug: string) {
  return attempts.find((attempt) => attempt.slug === slug);
}

export function attemptsInColumn(column: BoardColumn) {
  return attempts.filter((attempt) => columnFor(attempt) === column);
}
