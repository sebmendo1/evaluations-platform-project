import Link from "next/link";
import { notFound } from "next/navigation";

import { BatchTable } from "@/components/interrupts/batch-table";
import { Crumbs } from "@/components/crumbs";
import {
  autonomyLabel,
  batchFilters,
  countClearedWithInterrupt,
  countFiles,
  filterFiles,
  getBatch,
  isBatchFilter,
} from "@/lib/data/batches";
import { activeLoanCrumbs } from "@/lib/crumbs";

type Params = { batchId: string };
type Search = { filter?: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { batchId } = await params;
  return { title: getBatch(batchId)?.id ?? "Batch" };
}

export default async function BatchPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { batchId } = await params;
  const { filter } = await searchParams;
  const batch = getBatch(batchId);

  if (!batch) {
    notFound();
  }

  const filters = batchFilters(batch);
  const active = isBatchFilter(filter) ? filter : filters[0].key;
  const rows = filterFiles(batch, active);

  const clearedWithInterrupt = countClearedWithInterrupt(batch);
  const clearedClean = countFiles(batch, "cleared") - clearedWithInterrupt;

  const segments = [
    { key: "clean", count: clearedClean, colour: "var(--p-keep)", label: "cleared, no human" },
    {
      key: "touched",
      count: clearedWithInterrupt,
      colour: "var(--p-line-2)",
      label: "cleared after a person",
    },
    { key: "running", count: countFiles(batch, "running"), colour: "var(--p-accent)", label: "running" },
    { key: "held", count: countFiles(batch, "held"), colour: "var(--p-hold)", label: "waiting on you" },
  ].filter((segment) => segment.count > 0);

  return (
    <>
      <Crumbs
        segments={activeLoanCrumbs({ batchId: batch.id, filter: active })}
      />
      <h1>{batch.id}</h1>
      <p className="lede">{batch.lede}</p>

      <div className="bars">
        {segments.map((segment) => (
          <i key={segment.key} style={{ flex: segment.count, background: segment.colour }} />
        ))}
      </div>
      <div className="legend">
        {segments.map((segment) => (
          <span key={segment.key}>
            <span className="dot" style={{ background: segment.colour }} />
            <b>{segment.count}</b> {segment.label}
          </span>
        ))}
        <span style={{ color: "var(--p-ink-3)" }}>
          <b>{autonomyLabel(batch)}</b> autonomy · <b>{batch.spend}</b> spent ·{" "}
          <b>{batch.perRun}</b> per run
        </span>
      </div>
      <p className="impact">
        Autonomy is {autonomyLabel(batch)} because {clearedClean} of the{" "}
        {countFiles(batch, "cleared")} cleared files finished with no interrupt. The{" "}
        {clearedWithInterrupt} that stopped for a person still cleared — they are the
        difference between this number and 100%.
      </p>

      <div className="filters">
        {filters.map((item) => (
          <Link
            key={item.key}
            className={active === item.key ? "chip on" : "chip"}
            href={`/batches/${batch.id}?filter=${item.key}`}
            aria-current={active === item.key ? "true" : undefined}
          >
            {item.label} · {item.count}
          </Link>
        ))}
      </div>

      <BatchTable batch={batch} rows={rows} filter={active} />

      <p className="impact">
        {batch.state === "running"
          ? "Held files sort by wait time within their routing class. Opening one drops you into its transcript at the point the run paused."
          : "This batch is closed. Every file reached a decision, and the interrupt-bearing clears are what separate 79% autonomy from 100%."}
      </p>
    </>
  );
}
