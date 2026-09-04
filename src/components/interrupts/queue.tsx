"use client";

import Link from "next/link";

import { ClickableRow } from "@/components/clickable-row";
import { EmptyState } from "@/components/empty-state";
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
          <Link className="btn" href={batchHref}>
            Open the batch
          </Link>
        }
      >
        All {heldInterrupts.length} files that needed a person have been answered, and
        each one wrote a case to the corpus on its way out.
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
        Sorted by wait time within its routing class, not by a priority score — a score
        would need tuning and would be gamed. The third column is computed from the
        policy cards: most conflicts do not move the decision, and saying so is what
        keeps the queue moving.
        {answered > 0
          ? ` ${answered} answered this session, each one now a labelled case.`
          : null}
      </p>
    </>
  );
}
