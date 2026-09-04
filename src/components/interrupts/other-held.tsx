"use client";

import Link from "next/link";

import { ClickableRow } from "@/components/clickable-row";
import { EmptyState } from "@/components/empty-state";
import { heldInterrupts, interruptLabels, waitLabel } from "@/lib/data/interrupts";
import { queueOrder } from "@/lib/domain/interrupt";
import { useResolved } from "@/lib/store/resolved";

/** Drops files answered this session, so the list can reach empty. */
export function OtherHeldFiles({
  batchId,
  currentRef,
}: {
  batchId: string;
  currentRef: string;
}) {
  const resolved = useResolved();
  const others = queueOrder(
    heldInterrupts.filter(
      (item) => item.loanRef !== currentRef && resolved[item.id] === undefined,
    ),
  );

  return (
    <div className="sec">
      <div className="sechead">
        <h3>Other files waiting</h3>
        <span className="h">
          <Link href={`/batches/${batchId}?filter=all`}>See the whole batch</Link>
        </span>
      </div>

      {others.length === 0 ? (
        <EmptyState
          tone="keep"
          icon={
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4}>
              <path d="M3 8.5 6.5 12 13 4.5" />
            </svg>
          }
          heading="Nothing else waiting"
          action={
            <Link className="btn" href={`/batches/${batchId}`}>
              Back to the batch
            </Link>
          }
        >
          Every other file that needed a person has been answered.
        </EmptyState>
      ) : (
        <div className="wrap">
          <table className="tbl">
            <caption className="sr-only">Other files paused for a human decision</caption>
            <tbody>
              {others.map((item) => {
                const href = `/batches/${batchId}/files/${item.loanRef}`;
                return (
                  <ClickableRow key={item.loanRef} href={href}>
                    <td className="m">
                      <Link href={href}>{item.loanRef}</Link>
                    </td>
                    <td className="v-hold">{interruptLabels[item.type]}</td>
                    <td className="m">{waitLabel(item.waitedSeconds)}</td>
                  </ClickableRow>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
