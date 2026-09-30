"use client";

import Link from "next/link";

import { ClickableRow } from "@/components/clickable-row";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  loanTabForFilter,
  type Batch,
  type BatchFile,
  type BatchFilter,
} from "@/lib/data/batches";
import { useResolved } from "@/lib/store/resolved";

function milestoneFor(file: BatchFile): string {
  if (file.state === "held") return file.interruptLabel ?? "Held";
  if (file.state === "running") return "In review";
  if (file.state === "crashed") return "Crashed";
  return "Submitted";
}

function stageClass(file: BatchFile): string {
  if (file.state === "held") return "v-hold";
  if (file.state === "running") return "v-none";
  if (file.state === "crashed") return "v-dis";
  return file.interruptCount > 0 ? "" : "v-keep";
}

/**
 * Figma Loans table · Loan / Milestone / Stage / Scope / Updated.
 * Client-side so files answered this session drop out of Open.
 */
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
  const tab = loanTabForFilter(filter);

  // Held files answered this session leave Open (and Pipeline still lists them
  // as cleared only after a reload of mock data — session drop is Open-only).
  const visible =
    tab === "open"
      ? rows.filter((file) => file.state !== "held" || !answeredRefs.has(file.id))
      : rows;
  const answered =
    tab === "open" ? rows.filter((file) => file.state === "held").length - visible.filter((file) => file.state === "held").length : 0;

  if (visible.length === 0 && tab === "open") {
    return (
      <EmptyState
        tone="keep"
        icon={
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4}>
            <path d="M3 8.5 6.5 12 13 4.5" />
          </svg>
        }
        heading="Nothing open"
        action={
          <Button asChild variant="outline">
            <Link href={`/batches/${batch.id}?filter=pipeline`}>See pipeline</Link>
          </Button>
        }
      >
        All open files have been answered — each wrote a labelled corpus case.
      </EmptyState>
    );
  }

  return (
    <>
      <div className="loans-table wrap scrollY">
        <table className="tbl loans-tbl">
          <caption className="sr-only">
            Active loans in {batch.id}, {tab}
          </caption>
          <thead>
            <tr>
              <th>Loan</th>
              <th>Milestone</th>
              <th>Stage</th>
              <th>Scope</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((file) => {
              const href =
                file.state === "held"
                  ? `/batches/${batch.id}/files/${file.id}`
                  : file.state === "cleared"
                    ? `/decisions/${file.id}`
                    : undefined;
              const loanLabel = file.borrower ?? file.id;

              const cells = (
                <>
                  <td>
                    <div className="loans-loan">
                      {href ? (
                        <Link href={href} className="loans-loan-name">
                          {loanLabel}
                        </Link>
                      ) : (
                        <span className="loans-loan-name">{loanLabel}</span>
                      )}
                      <span className="loans-loan-id mono">{file.id}</span>
                    </div>
                  </td>
                  <td>{milestoneFor(file)}</td>
                  <td className={stageClass(file)}>{file.state}</td>
                  <td className="nc">{file.product ?? "—"}</td>
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
          {answered} answered this session — each a labelled corpus case.
        </p>
      ) : null}
    </>
  );
}
