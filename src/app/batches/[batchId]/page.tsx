import Link from "next/link";
import { notFound } from "next/navigation";

import { BatchTable } from "@/components/interrupts/batch-table";
import { WideMeasure } from "@/components/measure";
import {
  filterFiles,
  getBatch,
  isBatchFilter,
  loanTabForFilter,
  loanTabs,
  type LoanTab,
} from "@/lib/data/batches";

type Params = { batchId: string };
type Search = { filter?: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { batchId } = await params;
  return { title: getBatch(batchId) ? "Active loans" : "Loans" };
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

  // Figma Loans · default Pipeline; legacy ?filter=held|running still selects Open.
  const activeFilter = isBatchFilter(filter) ? filter : "pipeline";
  const activeTab: LoanTab = loanTabForFilter(activeFilter);
  const rows = filterFiles(batch, activeFilter);
  const tabs = loanTabs(batch);

  return (
    <>
      <WideMeasure />
      <h1>Active loans</h1>

      <div className="loans-tabs" role="tablist" aria-label="Loan filters">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            role="tab"
            aria-selected={tab.key === activeTab}
            className={tab.key === activeTab ? "loans-tab on" : "loans-tab"}
            href={`/batches/${batch.id}?filter=${tab.key}`}
          >
            {tab.label} ({tab.count})
          </Link>
        ))}
      </div>

      <BatchTable batch={batch} rows={rows} filter={activeFilter} />
    </>
  );
}
