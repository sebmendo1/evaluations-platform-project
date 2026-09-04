"use client";

import Link from "next/link";

import { ClickableRow } from "@/components/clickable-row";
import { EmptyState } from "@/components/empty-state";
import type { Batch, BatchFile, BatchFilter } from "@/lib/data/batches";
import { useResolved } from "@/lib/store/resolved";

/**
 * The batch console's table. Client-side so files answered this session drop out
 * of the held filter and the queue can reach its completion state — 00 §Design
 * rules calls a screen with no zero state the wrong screen.
 */
function StateCell({ file }: { file: BatchFile }) {
  if (file.state === "held") {
    return <td className="v-hold">held · {file.interruptLabel}</td>;
  }
  if (file.state === "running") {
    return <td className="v-none">running</td>;
  }
  if (file.state === "crashed") {
    return <td className="v-dis">crashed</td>;
  }
  if (file.interruptCount > 0) {
    return (
      <td>
        cleared · {file.interruptCount} interrupt{file.interruptCount === 1 ? "" : "s"}
      </td>
    );
  }
  return (
    <td className={file.sampled ? undefined : "v-keep"}>
      cleared
      {file.sampled ? (
        <span className="tag" style={{ marginLeft: "6px" }}>
          sampled
        </span>
      ) : null}
    </td>
  );
}

export function BatchTable({
  batch,
  rows,
  filter,
}: {
  batch: Batch;
  rows: BatchFile[];
  filter: BatchFilter;
}) {
  const resolved = useResolved();
  const answeredRefs = new Set(
    Object.values(resolved).map((entry) => entry.case.input.loanRef),
  );

  // A held file answered this session is no longer held. Only the held and all
  // views change shape; a cleared file was never in question.
  const visible =
    filter === "held" ? rows.filter((file) => !answeredRefs.has(file.id)) : rows;
  const answered = rows.length - visible.length;

  if (visible.length === 0 && filter === "held") {
    return (
      <EmptyState
        tone="keep"
        icon={
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4}>
            <path d="M3 8.5 6.5 12 13 4.5" />
          </svg>
        }
        heading="Nothing waiting"
        action={
          <Link className="btn" href={`/batches/${batch.id}?filter=all`}>
            See the whole batch
          </Link>
        }
      >
        All {rows.length} files that needed a person have been answered, and each one
        wrote a labelled case on its way out. This queue is an inbox, not a monitor.
      </EmptyState>
    );
  }

  return (
    <>
      <div className="wrap scrollY">
        <table className="tbl">
          <caption className="sr-only">
            Files in {batch.id}, filtered to {filter}
          </caption>
          <thead>
            <tr>
              <th>file</th>
              <th>state</th>
              <th>step</th>
              <th>cost</th>
              <th>age</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((file) => {
              // 05 §6 · the audit chain resolves from any decision, so a cleared
              // file links to its own chain rather than to nothing.
              const href =
                file.state === "held"
                  ? `/batches/${batch.id}/files/${file.id}`
                  : file.state === "cleared"
                    ? `/decisions/${file.id}`
                    : undefined;

              const cells = (
                <>
                  <td className="m">
                    {href ? <Link href={href}>{file.id}</Link> : file.id}
                  </td>
                  <StateCell file={file} />
                  <td className="m">{file.step}</td>
                  <td className="m">{file.cost}</td>
                  <td className="m">{file.age}</td>
                </>
              );

              return href ? (
                <ClickableRow key={file.id} href={href}>
                  {cells}
                </ClickableRow>
              ) : (
                <tr key={file.id}>{cells}</tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {answered > 0 ? (
        <p className="impact">
          {answered} answered this session and dropped off the queue, each one now a
          labelled case in the corpus.
        </p>
      ) : null}
    </>
  );
}
