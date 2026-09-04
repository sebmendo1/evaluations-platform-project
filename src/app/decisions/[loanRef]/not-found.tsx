import Link from "next/link";

export const metadata = {
  title: "No decision on record",
};

/**
 * A held or running file has no written record yet, so there is nothing to trace.
 * 02 · Run → Decision: only a cleared run produces one.
 */
export default function NotFound() {
  return (
    <>
      <h1>No decision on record</h1>
      <p className="lede">
        Only a cleared run has a written record, so only a cleared file has an audit
        chain. This reference is held, running, or belongs to another workspace.
      </p>
      <div className="actions">
        <Link className="btn pri" href="/batches/batch-0903-am?filter=cleared">
          Browse cleared files
        </Link>
        <Link className="btn" href="/governance#g-audit">
          Back to the audit chain
        </Link>
      </div>
      <p className="impact">
        A held file is waiting on a person and has produced no decision to trace. Open it
        from the queue instead — the interrupt carries everything needed to answer it.
      </p>
    </>
  );
}
