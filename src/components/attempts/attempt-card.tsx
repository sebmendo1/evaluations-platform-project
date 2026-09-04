import Link from "next/link";

import { attemptVerdict, columnFor, type Attempt } from "@/lib/data/attempts";
import { stepsLabel } from "@/lib/data/procedure";
import { toneClass, type ToneName } from "@/lib/rich-text";

const stageTone: Record<string, ToneName> = {
  drafted: "none",
  grading: "hold",
  inconclusive: "hold",
  kept: "keep",
  discarded: "discard",
};

const stageLabel: Record<string, string> = {
  drafted: "drafted",
  grading: "grading",
  inconclusive: "inconclusive",
  kept: "kept",
  discarded: "discarded",
};

export function AttemptStatus({ attempt }: { attempt: Attempt }) {
  const column = columnFor(attempt);
  return (
    <span className={toneClass[stageTone[column]]}>
      {stageLabel[column]}
      {attempt.stage === "grading"
        ? ` ${attempt.runsGraded} of ${attempt.runsPlanned}`
        : null}
    </span>
  );
}

/**
 * One attempt, rendered the same way everywhere it appears — board, list and the
 * rail. A restrained card: what it changes, which step it touches, and its
 * evidence. No file paths and no diff counts; the reader is an underwriter.
 */
export function AttemptCard({ attempt }: { attempt: Attempt }) {
  const computed = attemptVerdict(attempt);
  const steps = attempt.changes.flatMap((change) => change.steps);
  const unique = [...new Set(steps)].sort((a, b) => a - b);

  return (
    <Link className="acard" href={`/attempts/${attempt.slug}`}>
      <div className="acard-head">
        <span className="acard-title">{attempt.title}</span>
        <AttemptStatus attempt={attempt} />
      </div>

      <p className="acard-summary">{attempt.summary}</p>

      <div className="acard-meta">
        <span>{stepsLabel(unique)}</span>
        <span className="mono">{attempt.bundle}</span>
      </div>

      <div className="acard-foot">
        {attempt.result ? (
          <span className="mono">
            {attempt.result.accuracy.toFixed(1)}% ±{attempt.result.interval.toFixed(1)} ·
            n {attempt.result.n}
          </span>
        ) : (
          <span className="v-none">no runs yet</span>
        )}
        {computed !== "pending" && attempt.result ? (
          <span className="acard-cost mono">{attempt.result.cost}</span>
        ) : null}
      </div>
    </Link>
  );
}
