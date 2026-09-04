"use client";

import { useState } from "react";

/**
 * 05 §5 · Rollback.
 *
 *   GIVEN a live bundle is rolled back
 *   THEN the prior version returns to `live` and the rolled-back version becomes
 *        `retired`
 *   AND decisions already stamped with the retired version are NOT altered (INV-6)
 *   AND the rollback is written to the ledger with a reason
 *
 * The reason is required, because an append-only ledger entry that says only
 * "rolled back" is not reviewable. Retired is not deleted: the decisions that
 * version produced are still in the book.
 */
export function Rollback({
  live,
  priorVersion,
  decisionsStamped,
}: {
  live: string;
  priorVersion: string;
  decisionsStamped: number;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  if (done) {
    return (
      <div className="sec">
        <div className="sechead">
          <h2>Rollback</h2>
          <span className="h">written to the ledger</span>
        </div>
        <div
          className="verdictline"
          role="status"
          style={{ background: "var(--p-hold-bg)", color: "var(--p-hold)" }}
        >
          {done}
        </div>
        <p className="impact">
          {priorVersion} is live again and {live} is retired — not deleted. The{" "}
          {decisionsStamped.toLocaleString()} decisions already stamped with {live} are
          unchanged, because a correction supersedes and never overwrites (INV-6). {live}
          stays in this surface permanently, since the files it decided are still in the
          book.
        </p>
      </div>
    );
  }

  return (
    <div className="sec">
      <div className="sechead">
        <h2>Rollback</h2>
        <span className="h">retired is not deleted</span>
      </div>

      {!open ? (
        <>
          <p className="impact">
            Rolling back returns {priorVersion} to live and retires {live}. Decisions
            already stamped with {live} are left exactly as they are.
          </p>
          <div className="actions">
            <button className="btn dan" type="button" onClick={() => setOpen(true)}>
              Roll back to {priorVersion}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="field" style={{ maxWidth: "520px" }}>
            <label htmlFor="rollback-reason">
              Reason — this is written to the ledger and cannot be edited afterwards
            </label>
            <textarea
              id="rollback-reason"
              value={reason}
              placeholder="Sampled accuracy fell 1.8 points over two batches while autonomy held…"
              onChange={(event) => setReason(event.target.value)}
            />
          </div>
          {problem ? (
            <p className="impact" style={{ color: "var(--p-discard)" }} role="alert">
              {problem}
            </p>
          ) : null}
          <div className="actions">
            <button
              className="btn dan"
              type="button"
              onClick={() => {
                if (!reason.trim()) {
                  setProblem(
                    "A reason is required. An append-only entry that says only “rolled back” is not reviewable later.",
                  );
                  return;
                }
                setProblem(null);
                setDone(
                  `${live} retired · ${priorVersion} returned to live · reason written to the ledger`,
                );
              }}
            >
              Confirm rollback
            </button>
            <button className="btn" type="button" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
