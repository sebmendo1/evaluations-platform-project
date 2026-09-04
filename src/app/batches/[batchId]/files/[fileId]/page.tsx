import { notFound } from "next/navigation";

import { StatusRow } from "@/components/blocks";
import { Crumbs } from "@/components/crumbs";
import { InterruptResolver } from "@/components/interrupts/resolver";
import { OtherHeldFiles } from "@/components/interrupts/other-held";
import { batches, getBatch } from "@/lib/data/batches";
import { getInterrupt, interruptLabels, toneFor, waitLabel } from "@/lib/data/interrupts";
import { stepLabel } from "@/lib/data/procedure";
import { activeLoanCrumbs } from "@/lib/crumbs";
import { exemptFromThirtySecondRule } from "@/lib/domain/interrupt";

type Params = { batchId: string; fileId: string };

export async function generateStaticParams() {
  return batches.flatMap((batch) =>
    batch.files
      .filter((file) => file.state === "held")
      .map((file) => ({ batchId: batch.id, fileId: file.id })),
  );
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { fileId } = await params;
  const interrupt = getInterrupt(fileId);
  return {
    title: interrupt
      ? `${interrupt.loanRef} — ${interruptLabels[interrupt.type]}`
      : "File",
  };
}

export default async function FilePage({ params }: { params: Promise<Params> }) {
  const { batchId, fileId } = await params;
  const batch = getBatch(batchId);
  const interrupt = getInterrupt(fileId);

  if (!batch || !interrupt) {
    notFound();
  }

  const position = batch.files.findIndex((entry) => entry.id === interrupt.loanRef) + 1;
  const exempt = exemptFromThirtySecondRule(interrupt.type);

  return (
    <>
      <Crumbs
        segments={activeLoanCrumbs({
          batchId: batch.id,
          filter: "held",
          loanRef: interrupt.loanRef,
          section: "pause",
        })}
      />

      <div className="kicker">
        <h1 className="mono">{interrupt.loanRef}</h1>
        <span className="lede" style={{ marginTop: 0 }}>
          {stepLabel(interrupt.step)}
        </span>
      </div>
      <p className="lede">
        {interrupt.borrower} · {interrupt.product} · {interrupt.amount} ·{" "}
        <span className="mono">{interrupt.spend}</span> spent
      </p>

      <StatusRow
        items={[
          {
            lab: "state",
            val: "held",
            sub: `file ${position} of ${batch.files.length}`,
          },
          {
            lab: "interrupt",
            val: interrupt.type,
            sub: interruptLabels[interrupt.type],
          },
          { lab: "waiting", val: waitLabel(interrupt.waitedSeconds) },
        ]}
      />

      <div className="turn" id="pause">
        <div className="who">astro · paused</div>
        <div className={`callout ${toneFor(interrupt.type)}`} style={{ marginTop: 0 }}>
          <div className="type">{interrupt.type}</div>
          <div className="q">{interrupt.question}</div>
        </div>

        <InterruptResolver interrupt={interrupt} />

        <div className="trace">
          Everything above came from the run — no document reading required.{" "}
          {exempt
            ? "This type is deliberately exempt from the thirty-second rule: it is genuine deliberation, not an under-specified question."
            : "If answering this needs the loan folder, the payload is incomplete and that is a spec defect rather than a training issue."}
        </div>
      </div>

      <div id="waiting">
        <OtherHeldFiles batchId={batch.id} currentRef={interrupt.loanRef} />
      </div>
    </>
  );
}
