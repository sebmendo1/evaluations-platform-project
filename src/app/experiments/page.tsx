import Link from "next/link";

import { ChartBlock, KpiGrid } from "@/components/blocks";
import { Crumbs } from "@/components/crumbs";
import { experimentCrumbs } from "@/lib/crumbs";
import { CiPlot } from "@/components/charts/ci-plot";
import { GapChart } from "@/components/charts/gap-chart";
import { ClickableRow } from "@/components/clickable-row";
import { MiniRunner } from "@/components/experiments/mini-runner";
import {
  experimentKpis,
  experimentRows,
  fieldFailures,
  verdictTone,
} from "@/lib/data/experiments";
import { toneClass } from "@/lib/rich-text";

export const metadata = {
  title: "Experiments",
};

export default function ExperimentsPage() {
  return (
    <>
      <Crumbs segments={experimentCrumbs({ view: "index" })} />
      {/* 07 §Surface map · Experiments owns the runner, so its entry point is the
          primary action of this surface rather than a global one in the rail. */}
      <div className="kicker">
        <h1>Experiments</h1>
        <span className="h" style={{ marginLeft: "auto" }}>
          <Link className="btn pri" href="/experiments/new">
            New experiment
          </Link>
        </span>
      </div>
      <p className="lede" style={{ maxWidth: "76ch" }}>
        Six bundles, 41 graded runs, one verdict that separated from baseline.
      </p>

      <KpiGrid items={experimentKpis} />

      <ChartBlock
        title="Accuracy with confidence intervals"
        caption="each bar is one bundle · whiskers are the 95% interval"
        keys={[
          { color: "var(--p-panel)", label: "shaded band is the baseline interval" },
          { color: "var(--p-keep)", label: "separates above" },
          { color: "var(--p-discard)", label: "separates below" },
          { color: "var(--p-hold)", label: "overlaps baseline" },
        ]}
        takeaway="This replaces a trend line on purpose. With five runs the interval is roughly ±2 points, so 0.10.0 and 0.11.0 sit inside the baseline band and mean nothing — a line chart would have drawn them as progress. Only 0.12.0 clears the band, and it needed 12 runs to get there."
      >
        <CiPlot />
      </ChartBlock>

      <ChartBlock
        title="Graded against sampled"
        caption="the lab number is consistently optimistic"
        keys={[
          { color: "var(--p-accent)", label: "graded, against ground truth" },
          { color: "var(--p-hold)", label: "sampled, from blind production review" },
        ]}
        takeaway="The gap runs 1.2 to 1.7 points and hasn’t closed. Live files are messier than the corpus, so a graded gain should be discounted before anyone promises it to a stakeholder. If this gap ever widened sharply it would mean the corpus had drifted away from production."
      >
        <GapChart />
      </ChartBlock>

      <div className="sec">
        <div className="sechead">
          <h2>All experiments</h2>
          <span className="h">append-only</span>
        </div>
        <div className="wrap scroll">
          <table className="tbl">
            <caption className="sr-only">Every graded experiment, newest first</caption>
            <thead>
              <tr>
                <th>bundle</th>
                <th>hypothesis</th>
                <th>accuracy</th>
                <th>runs</th>
                <th>cost</th>
                <th>separates</th>
                <th>verdict</th>
              </tr>
            </thead>
            <tbody>
              {experimentRows.map((row) => {
                const cells = (
                  <>
                    <td className="m">
                      {row.href ? <Link href={row.href}>{row.bundle}</Link> : row.bundle}
                    </td>
                    <td className="nc">{row.hypothesis}</td>
                    <td className="m">{row.accuracy}</td>
                    <td className="m">{row.runs}</td>
                    <td className="m">{row.cost}</td>
                    <td className={toneClass[row.separatesTone]}>{row.separates}</td>
                    <td className={toneClass[verdictTone[row.verdict]]}>{row.verdict}</td>
                  </>
                );

                return row.href ? (
                  <ClickableRow key={row.bundle} href={row.href} selected={row.current}>
                    {cells}
                  </ClickableRow>
                ) : (
                  <tr key={row.bundle}>{cells}</tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="sec">
        <div className="sechead">
          <h2>Field failures across bundles</h2>
          <span className="h">out of 150 fields per run</span>
        </div>
        <div className="wrap scroll">
          <table className="tbl">
            <caption className="sr-only">Field failure counts by bundle</caption>
            <thead>
              <tr>
                <th>field</th>
                <th>0.9.2</th>
                <th>0.10.0</th>
                <th>0.11.0</th>
                <th>0.12.0</th>
                <th>Δ</th>
                <th className="nc">reading</th>
              </tr>
            </thead>
            <tbody>
              {fieldFailures.map((row) => {
                // Movement across the four bundles, which is the column that says
                // whether a change did anything.
                const delta =
                  Number(row.counts[row.counts.length - 1]) - Number(row.counts[0]);
                return (
                  <tr key={row.field}>
                    <td className="m">{row.field}</td>
                    {row.counts.map((count, index) => (
                      <td
                        className={
                          row.improved && index === row.counts.length - 1
                            ? "m v-keep"
                            : "m"
                        }
                        key={`${row.field}-${index}`}
                      >
                        {count}
                      </td>
                    ))}
                    <td className={delta < 0 ? "m v-keep" : "m v-none"}>
                      {delta === 0 ? "—" : delta}
                    </td>
                    <td className="nc">{row.reading}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="takeaway">
          InvestmentAccounts hasn’t moved across four bundles because no bundle change can
          fix it — the statement isn’t in the folder. That row is an intake problem wearing
          an accuracy costume, and it’s the clearest case for spending the next attempt
          somewhere else.
        </p>
      </div>

      <div className="sec">
        <div className="sechead">
          <h2>Run one</h2>
        </div>
        <MiniRunner />
      </div>

      {/* 08 §7 · every page that reports a metric earns one of these. */}
      <div className="sec">
        <div className="sechead">
          <h2>What this doesn’t tell you</h2>
        </div>
        <p className="takeaway" style={{ borderLeftColor: "var(--p-hold)" }}>
          Every accuracy figure on this page is graded against a labelled corpus, which
          means it is a lab measurement and optimistic by the 1.2 to 1.7 points the gap
          chart shows. None of it is evidence about production; that only comes from blind
          review.
        </p>
        <p className="takeaway" style={{ borderLeftColor: "var(--p-hold)" }}>
          Four of the six bundles rest on five runs, which buys an interval near ±2 — wide
          enough that a real two-point improvement would still read inconclusive. Reading
          those rows as “no effect” is as wrong as reading them as progress. They mean the
          experiment was too small to say.
        </p>
      </div>
    </>
  );
}
