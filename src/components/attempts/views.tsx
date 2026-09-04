import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import {
  attempts,
  attemptsInColumn,
  attemptVerdict,
  boardColumns,
  columnFor,
  type Attempt,
} from "@/lib/data/attempts";
import { stepsLabel } from "@/lib/data/procedure";
import { toneClass, type ToneName } from "@/lib/rich-text";

import { AttemptCard, AttemptStatus } from "./attempt-card";

const columnTone: Record<string, ToneName> = {
  drafted: "none",
  grading: "hold",
  inconclusive: "hold",
  kept: "keep",
  discarded: "discard",
};

/** Kanban — the loop in 01 §3 read left to right. */
export function BoardView() {
  return (
    <>
      <div className="board">
        {boardColumns.map((column) => {
          const items = attemptsInColumn(column.key);
          return (
            <section className="bcol" key={column.key}>
              <header className="bcol-head">
                <span className={toneClass[columnTone[column.key]]}>{column.label}</span>
                <span className="bcol-count mono">{items.length}</span>
              </header>
              <p className="bcol-blurb">{column.blurb}</p>
              <div className="bcol-body">
                {items.length === 0 ? (
                  <p className="bcol-none">None</p>
                ) : (
                  items.map((attempt) => (
                    <AttemptCard attempt={attempt} key={attempt.slug} />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
      <p className="takeaway">
        Two of the six reached a verdict. That is the normal shape of this work — an
        attempt that comes back inconclusive has still told you the change was not worth
        the runs, and the discarded column is where the most transferable lessons sit.
      </p>
    </>
  );
}

const DAY = 24 * 60 * 60 * 1000;

/** Gantt — drafted to decided, so the reader can see how long evidence takes. */
export function TimelineView() {
  const dated = attempts.filter((attempt) => attempt.draftedOn);
  const starts = dated.map((a) => new Date(a.draftedOn).getTime());
  const ends = dated.map((a) =>
    new Date(a.decidedOn ?? a.draftedOn).getTime() + DAY,
  );
  const min = Math.min(...starts);
  const max = Math.max(...ends);
  const span = max - min;

  const ticks: { at: number; label: string }[] = [];
  for (let t = min; t <= max; t += 4 * DAY) {
    ticks.push({
      at: ((t - min) / span) * 100,
      label: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }).format(new Date(t)),
    });
  }

  return (
    <>
      <div className="gantt">
        <div className="gantt-axis" aria-hidden="true">
          {ticks.map((tick) => (
            <span className="gantt-tick mono" key={tick.label} style={{ left: `${tick.at}%` }}>
              {tick.label}
            </span>
          ))}
        </div>

        {dated.map((attempt) => {
          const start = new Date(attempt.draftedOn).getTime();
          const end = new Date(attempt.decidedOn ?? attempt.draftedOn).getTime() + DAY;
          const left = ((start - min) / span) * 100;
          const width = Math.max(((end - start) / span) * 100, 1.5);
          const column = columnFor(attempt);
          const open = attempt.decidedOn === null;

          return (
            <div className="gantt-row" key={attempt.slug}>
              <Link className="gantt-name" href={`/attempts/${attempt.slug}`}>
                {attempt.title}
              </Link>
              <div className="gantt-track">
                {ticks.map((tick) => (
                  <span
                    className="gantt-grid"
                    key={tick.label}
                    style={{ left: `${tick.at}%` }}
                    aria-hidden="true"
                  />
                ))}
                <span
                  className={open ? `gantt-bar ${column} open` : `gantt-bar ${column}`}
                  style={{ left: `${left}%`, width: `${width}%` }}
                >
                  <span className="sr-only">
                    {attempt.draftedOn} to {attempt.decidedOn ?? "open"}
                  </span>
                </span>
              </div>
              <span className="gantt-meta mono">
                {attempt.result ? `${attempt.result.wallMinutes}m` : "—"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="ckey">
        {boardColumns.map((column) => (
          <span key={column.key}>
            <span className={`dot gantt-swatch ${column.key}`} />
            {column.label}
          </span>
        ))}
      </div>
      <p className="takeaway">
        The bars are calendar days from drafting to a decision, not machine time — the
        runs themselves take between eighteen and forty-one minutes. What takes days is
        deciding what to test and reading the result honestly, which is the part no extra
        compute shortens.
      </p>
    </>
  );
}

/** List — the same six as a table, for scanning rather than triage. */
export function ListView() {
  if (attempts.length === 0) {
    return (
      <EmptyState
        icon={
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.25}>
            <path d="M3 4.5v3M13 4.5v3M3 6h10" />
          </svg>
        }
        heading="No attempts yet"
        action={
          <Link className="btn pri" href="/experiments/new">
            New experiment
          </Link>
        }
      >
        An attempt is a hypothesis about the procedure and enough runs to test it.
      </EmptyState>
    );
  }

  return (
    <>
      <div className="wrap scroll">
        <table className="tbl">
          <caption className="sr-only">Every attempt, newest first</caption>
          <thead>
            <tr>
              <th>attempt</th>
              <th>procedure</th>
              <th>status</th>
              <th>evidence</th>
              <th>spent</th>
              <th>bundle</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((attempt: Attempt) => {
              const touched = [
                ...new Set(attempt.changes.flatMap((c) => c.steps)),
              ].sort((a, b) => a - b);

              return (
                <tr key={attempt.slug}>
                  <td className="nc">
                    <Link href={`/attempts/${attempt.slug}`}>{attempt.title}</Link>
                  </td>
                  <td className="nc">{stepsLabel(touched)}</td>
                  <td>
                    <AttemptStatus attempt={attempt} />
                  </td>
                  <td className="m">
                    {attempt.result
                      ? `${attempt.result.accuracy.toFixed(1)}% ±${attempt.result.interval.toFixed(1)}`
                      : "—"}
                  </td>
                  <td className="m">{attempt.result?.cost ?? "—"}</td>
                  <td className="m">{attempt.bundle}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="impact">
        Verdicts are computed from the interval, never entered. An attempt whose band
        overlaps the baseline reads inconclusive however much the point estimate moved.
      </p>
    </>
  );
}

export function attemptCounts() {
  return {
    board: attempts.length,
    timeline: attempts.filter((a) => a.draftedOn).length,
    list: attempts.length,
    decided: attempts.filter((a) => attemptVerdict(a) !== "pending").length,
  };
}
