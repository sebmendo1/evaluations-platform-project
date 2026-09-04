/**
 * Spec: 07 §Conversation is not a destination
 *
 * "Conversation is an interface to objects the platform already holds" (00 §What
 * Astro is not), so this answers from the real datasets rather than from canned
 * strings — the held count, the autonomy rate and the verdict are all derived.
 *
 * There is no model behind it. Where a question falls outside what the data can
 * answer, it says so instead of improvising, which is the same discipline 08 §7
 * asks of every number on a screen.
 */

import { autonomyLabel, countFiles, currentBatch } from "../data/batches";
import { fieldFailures, gradedVsSampled } from "../data/experiments";
import { heldInterrupts, interruptLabels } from "../data/interrupts";
import { BASELINE, COST_PER_RUN } from "../domain/constants";
import { requiresSenior } from "../domain/interrupt";
import { verdict } from "../domain/verdict";
import { estimateRun } from "../domain/estimate";
import type { RichText } from "../rich-text";

export type AskAction = {
  prompt: string;
  confirmLabel: string;
  href: string;
  /** 07 requires the scope and cost be stated before anything runs. */
  scope: string;
  cost: string;
};

export type AskReply = {
  paragraphs: RichText[];
  action?: AskAction;
};

const CURRENT = {
  accuracy: 96.4,
  interval: 1.2,
  fieldsGraded: 1800,
  n: 12,
  status: "complete" as const,
};

function heldReply(): AskReply {
  const oldest = heldInterrupts.reduce((a, b) =>
    a.waitedSeconds > b.waitedSeconds ? a : b,
  );
  const senior = heldInterrupts.filter((i) => requiresSenior(i.type));
  const quick = heldInterrupts.filter((i) => !i.impact.outcomeChanges);

  return {
    paragraphs: [
      [
        `${heldInterrupts.length} files are held, and the oldest has waited `,
        { mono: `${Math.round(oldest.waitedSeconds / 60)}m` },
        ". ",
        `${quick.length} of them do not change the outcome either way, so they resolve in one click.`,
      ],
      [
        `${senior.length} need a senior reviewer: `,
        ...senior.flatMap((i, index) => [
          index > 0 ? " and " : "",
          { mono: i.loanRef } as const,
          ` for ${interruptLabels[i.type]}`,
        ]),
        ".",
      ],
    ],
  };
}

function autonomyReply(): AskReply {
  const cleared = countFiles(currentBatch, "cleared");
  const clean = currentBatch.files.filter(
    (f) => f.state === "cleared" && f.interruptCount === 0,
  ).length;

  return {
    paragraphs: [
      [
        "Autonomy on ",
        { mono: currentBatch.id },
        " is ",
        { mono: autonomyLabel(currentBatch) },
        `, which is ${clean} of the ${cleared} cleared files finishing with no interrupt.`,
      ],
      [
        "The denominator is cleared files, not submitted ones — held and running files are excluded, because a file still waiting on a person has not demonstrated anything either way.",
      ],
    ],
  };
}

function verdictReply(): AskReply {
  const computed = verdict(CURRENT, BASELINE);

  return {
    paragraphs: [
      [
        "Real, and the verdict is computed rather than asserted: ",
        { mono: `${CURRENT.accuracy}% ±${CURRENT.interval}` },
        " against a ",
        { mono: `${BASELINE.accuracy}% ±${BASELINE.interval}` },
        " baseline gives ",
        { tone: "keep", text: computed },
        " because the intervals do not touch.",
      ],
      [
        "Production is less flattering. Sampled accuracy reads ",
        { mono: "95.1%" },
        " on 70 fields, which is enough to catch a systematic error and nowhere near enough to carry an interval. I would not claim the production gain yet.",
      ],
    ],
  };
}

function gapReply(): AskReply {
  const latest = gradedVsSampled[gradedVsSampled.length - 1];
  const spread = (latest.graded - latest.sampled).toFixed(1);

  return {
    paragraphs: [
      [
        "The gap is ",
        { mono: `${spread} pt` },
        " on the current bundle and has run between 1.2 and 1.7 across four bundles without closing.",
      ],
      [
        "A stable gap is normal — live files are messier than the corpus, so discount a graded gain by it before promising anything. A widening gap would be the alarm, because it would mean the corpus had drifted away from production.",
      ],
    ],
  };
}

function costReply(): AskReply {
  return {
    paragraphs: [
      [
        "Inference runs ",
        { mono: `$${COST_PER_RUN.toFixed(2)}` },
        " per file, ",
        { mono: currentBatch.spend },
        " across the batch. Income orchestration and DTI are 48% of that between them.",
      ],
      [
        "It is also the cheap half. Human minutes dominate, and the loaded rate behind that figure is still unsourced — so this build will not show you a savings number it cannot defend.",
      ],
    ],
  };
}

function dtiReply(): AskReply {
  const row = fieldFailures.find((f) => f.field === "DebtToIncomeRatio");
  const counts = row?.counts ?? [];

  return {
    paragraphs: [
      [
        { mono: "DebtToIncomeRatio" },
        ` is failing on ${counts[counts.length - 1]} case in 150, down from ${counts[0]}.`,
      ],
      [
        "It is no longer a calculation error — the checker re-derives cleanly since it started seeing the obligation lines. The remaining miss is a genuine document conflict, the same shape as the twenty in ",
        { mono: "obligations-conflicts" },
        ".",
      ],
    ],
    action: {
      prompt:
        "Twenty conflicts share that shape. Start an attempt testing a source-precedence rule in step 4?",
      confirmLabel: "Start attempt",
      href: "/experiments/new",
      scope: "obligations-conflicts · 20 cases · bundle 0.12.1-draft",
      cost: estimateRun(12).cost,
    },
  };
}

function rerunReply(): AskReply {
  const held = countFiles(currentBatch, "held");
  const estimate = estimateRun(held);

  return {
    paragraphs: [
      [
        `Re-running the ${held} held files on `,
        { mono: currentBatch.bundle },
        " would discard the questions they are currently asking and start them again from the top.",
      ],
      [
        "That loses the interrupt payloads, so nothing would be added to the corpus. Worth doing only if you think the payloads themselves are wrong.",
      ],
    ],
    action: {
      prompt: `Re-run the ${held} held files on ${currentBatch.bundle}?`,
      confirmLabel: "Re-run held files",
      href: `/batches/${currentBatch.id}?filter=held`,
      scope: `${held} held files · ${currentBatch.id} · bundle ${currentBatch.bundle}`,
      cost: estimate.cost,
    },
  };
}

function attemptReply(): AskReply {
  const estimate = estimateRun(12);

  return {
    paragraphs: [
      [
        "The twenty ",
        { mono: "obligations-conflicts" },
        " cases came out of production resolutions, so they are the corpus that matters most for this change.",
      ],
      [
        `At 12 runs the estimate is ${estimate.cost} and about ${estimate.minutes} minutes, landing near ±${estimate.intervalLabel}. `,
        estimate.separates
          ? "That is tight enough to separate from baseline."
          : `At 5 runs it would come back inconclusive; the minimum that separates is ${estimate.minimumSeparatingN}.`,
      ],
    ],
    action: {
      prompt: "Open the runner with the source-precedence hypothesis loaded?",
      confirmLabel: "Open runner",
      href: "/experiments/new",
      scope: "obligations-conflicts · 20 cases · 12 runs · grader strict",
      cost: estimate.cost,
    },
  };
}

function fallback(): AskReply {
  return {
    paragraphs: [
      [
        "There is no model behind this composer — it reads the workspace rather than generating an answer, so it can only speak to what the platform already holds.",
      ],
      [
        "It can answer the held queue, the autonomy rate and how it is derived, whether the current bundle beat baseline, the graded-against-sampled gap, where cost goes, and what ",
        { mono: "DebtToIncomeRatio" },
        " is failing on. It can also propose re-running the held files or starting an attempt.",
      ],
    ],
  };
}

/**
 * 07 draws a line between Ask answering and Ask acting: "The composer must be able
 * to act, not only answer", with any proposal shown as an explicit confirmation.
 * The mode is that line made a control — in `answer` it explains and stops, in `act`
 * it leads with the operation it would run.
 */
export type AskMode = "answer" | "act";

type Matcher = { test: RegExp; reply: () => AskReply };

const matchers: Matcher[] = [
  { test: /re-?run|rerun|run.*(held|again)/i, reply: rerunReply },
  { test: /start.*attempt|new attempt|experiment.*(start|from)|twenty|precedence/i, reply: attemptReply },
  { test: /held|waiting|queue|first today|look at first/i, reply: heldReply },
  { test: /autonom|cleared with no human|straight/i, reply: autonomyReply },
  { test: /noise|better|separat|verdict|0\.12\.0|keep\b/i, reply: verdictReply },
  { test: /gap|sampled|blind|production accuracy/i, reply: gapReply },
  { test: /cost|spend|money|cheap|expensive|\$/i, reply: costReply },
  { test: /dti|debttoincome|debt.to.income|failing/i, reply: dtiReply },
];

export function respond(question: string, mode: AskMode = "answer"): AskReply {
  const found = matchers.find((matcher) => matcher.test.test(question));
  const reply = found ? found.reply() : fallback();

  if (mode === "answer") {
    // Answering explains and stops. Nothing is proposed, so nothing can be run by
    // accident from a question that only wanted context.
    return { paragraphs: reply.paragraphs };
  }

  if (!reply.action) {
    return {
      paragraphs: [
        ...reply.paragraphs,
        [
          "There is no operation to propose for this one — it is a reading of the workspace rather than something to run. Ask about the held files or the twenty obligation conflicts and there will be.",
        ],
      ],
    };
  }

  return reply;
}

export const askSuggestions = [
  "What should I look at first?",
  "Is 0.12.0 better than baseline?",
  "Why is the sampled gap flat?",
  "Where is cost going?",
];
