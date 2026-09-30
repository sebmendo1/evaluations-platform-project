"use client";

import Link from "next/link";

import { ClickableRow } from "@/components/clickable-row";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { heldInterrupts, interruptLabels, waitLabel } from "@/lib/data/interrupts";
import { queueOrder } from "@/lib/domain/interrupt";
import { useResolved } from "@/lib/store/resolved";

/**
 * 00 §Design rules — "The queue is an inbox with a completion state, not a
 * monitor." Answering all seven empties it, which is the state the design is for.
 */
export function HeldQueue({ batchHref }: { batchHref: string }) {
  const resolved = useResolved();
  const queue = queueOrder(
    heldInterrupts.filter((item) => resolved[item.id] === undefined),
  );
  const answered = heldInterrupts.length - queue.length;

  if (queue.length === 0) {
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
          <Button asChild variant="outline">
            <Link href={batchHref}>Open the batch</Link>
          </Button>
        }
      >
        All {heldInterrupts.length} held files answered — each wrote a corpus case.
      </EmptyState>
    );
  }

  return (
    <>
      <div className="wrap">
        <table className="tbl">
          <caption className="sr-only">Files paused for a human decision</caption>
          <tbody>
            {queue.map((interrupt) => {
              const href = `${batchHref}/files/${interrupt.loanRef}`;
              return (
                <ClickableRow key={interrupt.loanRef} href={href}>
                  <td className="m">
                    <Link href={href}>{interrupt.loanRef}</Link>
                  </td>
                  <td className="v-hold">{interruptLabels[interrupt.type]}</td>
                  <td className="nc">
                    {interrupt.impact.outcomeChanges
                      ? "Changes the outcome"
                      : "Outcome unchanged either way"}
                  </td>
                  <td className="m">{waitLabel(interrupt.waitedSeconds)}</td>
                </ClickableRow>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="impact">
        Wait time within routing class. Outcome column from policy cards.
        {answered > 0 ? ` ${answered} answered this session.` : null}
      </p>
    </>
  );
}
