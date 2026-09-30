import Link from "next/link";
import { Suspense } from "react";

import { AttemptCard } from "@/components/attempts/attempt-card";
import { ChartBlock } from "@/components/blocks";
import { AreaSeriesChart } from "@/components/charts/area-series-chart";
import { ClickableRow } from "@/components/clickable-row";
import { HeldQueue } from "@/components/interrupts/queue";
import { WideMeasure } from "@/components/measure";
import { Metric } from "@/components/metric";
import { OverviewRangePills } from "@/components/overview/range-pills";
import { SectionTabs } from "@/components/section-tabs";
import { Button } from "@/components/ui/button";
import { autonomyLabel, batches, countFiles, currentBatch } from "@/lib/data/batches";
import { attempts, attemptVerdict } from "@/lib/data/attempts";
import { ledger, verdictTone } from "@/lib/data/experiments";
import {
  isOverviewRange,
  overviewPeriod,
  type OverviewRange,
} from "@/lib/data/overview";
import { recentReviews, verifyStats } from "@/lib/data/verify";
import { toneClass } from "@/lib/rich-text";

/**
 * Overview · Figma period instrument first (range, three KPIs, two area charts),
 * then workspace sections. Spec: 07 §Overview.
 */
type Section = "queue" | "batches" | "verify" | "ledger" | "attempts";

const SECTIONS: Section[] = ["queue", "batches", "verify", "ledger", "attempts"];

function isSection(value: string | undefined): value is Section {
  return SECTIONS.includes(value as Section);
}

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; range?: string }>;
}) {
  const { section, range: rangeParam } = await searchParams;
  const active: Section = isSection(section) ? section : "queue";
  const range: OverviewRange = isOverviewRange(rangeParam) ? rangeParam : "7d";
  const period = overviewPeriod(range);

  const held = countFiles(currentBatch, "held");
  const batchHref = `/batches/${currentBatch.id}`;
  const openAttempts = attempts.filter((a) => attemptVerdict(a) === "pending");

  const batchesPanel = (
    <>
      <div className="wrap scroll">
        <table className="tbl">
          <caption className="sr-only">Batches in this workspace</caption>
          <thead>
            <tr>
              <th>batch</th>
              <th>bundle</th>
              <th>state</th>
              <th>files</th>
              <th>autonomy</th>
              <th>held</th>
              <th>spent</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((batch) => {
              const heldHere = countFiles(batch, "held");
              return (
                <ClickableRow
                  key={batch.id}
                  href={`/batches/${batch.id}`}
                  selected={batch.state === "running"}
                >
                  <td className="m">
                    <Link href={`/batches/${batch.id}`}>{batch.id}</Link>
                  </td>
                  <td className="m">{batch.bundle}</td>
                  <td className={batch.state === "running" ? "v-none" : "v-keep"}>
                    {batch.state}
                  </td>
                  <td className="m">{batch.files.length}</td>
                  <td className="m">{autonomyLabel(batch)}</td>
                  <td className={heldHere > 0 ? "m v-hold" : "m"}>
                    {heldHere > 0 ? heldHere : "—"}
                  </td>
                  <td className="m">{batch.spend}</td>
                </ClickableRow>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="impact">
        Opens on held — {countFiles(currentBatch, "cleared")} cleared alone in the
        current batch.
      </p>
    </>
  );

  const verifyPanel = (
    <>
      <div className="strip2" style={{ maxWidth: "520px" }}>
        <Metric
          id="sampled_accuracy"
          context="production"
          size="small"
          value={verifyStats.sampledAccuracy}
          n="70 fields"
          detail={verifyStats.sampledDetail}
        />
        <div className="small warn">
          <div className="lab">Open reviews</div>
          <div className="val mono">{verifyStats.openReviews}</div>
          <div className="sub">{verifyStats.openDetail}</div>
        </div>
      </div>
      <div className="wrap" style={{ marginTop: "12px" }}>
        <table className="tbl">
          <caption className="sr-only">Recently drawn blind reviews</caption>
          <tbody>
            {recentReviews.map((review) => (
              <tr key={review.id}>
                <td className="m">{review.id}</td>
                <td>{review.detail}</td>
                <td className={toneClass[review.tone]}>{review.result}</td>
                <td>{review.by}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="impact">
        Blind to which files are sampled — the only control that catches confident
        errors the queue never sees.
      </p>
    </>
  );

  const ledgerPanel = (
    <>
      <div className="wrap scroll">
        <table className="tbl">
          <caption className="sr-only">
            Every batch and eval in one append-only log
          </caption>
          <thead>
            <tr>
              <th>entry</th>
              <th>kind</th>
              <th>metric</th>
              <th>runs</th>
              <th>cost</th>
              <th>verdict</th>
              <th className="nc">note</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map((row) => {
              const cells = (
                <>
                  <td className="m">
                    {row.href ? <Link href={row.href}>{row.entry}</Link> : row.entry}
                  </td>
                  <td>{row.kind}</td>
                  <td className="m">{row.metric}</td>
                  <td>{row.runs}</td>
                  <td className="m">{row.cost}</td>
                  <td className={toneClass[verdictTone[row.verdict]]}>{row.verdict}</td>
                  <td className="nc">{row.note}</td>
                </>
              );

              return row.href ? (
                <ClickableRow key={row.entry} href={row.href} selected={row.current}>
                  {cells}
                </ClickableRow>
              ) : (
                <tr key={row.entry}>{cells}</tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="impact">
        Evals report accuracy; batches report autonomy. Append-only — crash and
        discard stay.
      </p>
    </>
  );

  const attemptsPanel = (
    <>
      <div className="ograid">
        {openAttempts.map((attempt) => (
          <AttemptCard attempt={attempt} key={attempt.slug} />
        ))}
      </div>
      <p className="impact">
        Two open — one grading, one drafted. Draft cuts three of four conflicting
        extractions; INV-4 still applies.
      </p>
    </>
  );

  return (
    <>
      <WideMeasure />
      <h1>Overview</h1>

      <Suspense
        fallback={
          <div className="ov-range">
            <span className="ov-range-label">{period.rangeLabel}</span>
          </div>
        }
      >
        <OverviewRangePills rangeLabel={period.rangeLabel} initial={range} />
      </Suspense>

      {/* Figma · three soft tiles. Dictionary ids only (06). */}
      <div className="ov-kpis">
        <Metric id="autonomy_rate" context="production" value={period.autonomy} />
        <Metric id="cost_per_run" context="production" value={period.cost} />
        <Metric id="turns_per_run" context="production" value={period.turns} />
      </div>

      <div className="ov-charts">
        <ChartBlock
          title="Autonomy"
          caption="Share of files cleared with no human"
          takeaway="Rising through the window — still no substitute for sampled accuracy on the blind-review tab."
        >
          <AreaSeriesChart
            points={period.points.map((point) => ({
              label: point.label,
              value: point.autonomy,
            }))}
            min={0}
            max={100}
            formatTick={(value) => (value === 0 ? "0" : `${value}%`)}
            ariaLabel={`Autonomy over ${period.rangeLabel}`}
            stroke="var(--p-keep)"
            fill="color-mix(in srgb, var(--p-keep) 28%, transparent)"
          />
        </ChartBlock>

        <ChartBlock
          title="Cost per run"
          caption="Inference cost per completed run"
          takeaway="Cost drifts with the period average; the tile above is the latest day, not the chart peak."
        >
          <AreaSeriesChart
            points={period.points.map((point) => ({
              label: point.label,
              value: point.cost,
            }))}
            min={0}
            max={3}
            formatTick={(value) => `$${value.toFixed(0)}`}
            ariaLabel={`Cost per run over ${period.rangeLabel}`}
            stroke="var(--p-discard)"
            fill="color-mix(in srgb, var(--p-discard) 22%, transparent)"
          />
        </ChartBlock>
      </div>

      {/* INV-4 / INV-10 · autonomy above sits next to a sampled accuracy limit. */}
      <p className="takeaway" style={{ borderLeftColor: "var(--p-hold)" }}>
        What this doesn’t tell you: sampled accuracy is 95.1% on 70 fields — enough
        to catch a systematic miss, not an interval. Graded corpus is 96.4% ±1.2
        (lab).
      </p>

      <SectionTabs
        label="Overview sections"
        param="section"
        initial={active}
        tabs={[
          {
            key: "queue",
            label: "Held",
            count: held,
            panel: <HeldQueue batchHref={batchHref} />,
            action: (
              <Button asChild variant="outline" size="sm">
                <Link href={batchHref}>Open the batch</Link>
              </Button>
            ),
          },
          {
            key: "batches",
            label: "Batches",
            count: batches.length,
            panel: batchesPanel,
          },
          {
            key: "verify",
            label: "Blind review",
            count: verifyStats.openReviews,
            panel: verifyPanel,
            action: (
              <Button asChild variant="outline" size="sm">
                <Link href="/verify">Open blind review</Link>
              </Button>
            ),
          },
          {
            key: "ledger",
            label: "Ledger",
            count: ledger.length,
            panel: ledgerPanel,
          },
          {
            key: "attempts",
            label: "Attempts",
            count: openAttempts.length,
            panel: attemptsPanel,
            action: (
              <Button asChild variant="outline" size="sm">
                <Link href="/attempts">All attempts</Link>
              </Button>
            ),
          },
        ]}
      />
    </>
  );
}
