import Link from "next/link";

import { ChartBlock, KpiGrid } from "@/components/blocks";
import { AutonomyChart } from "@/components/charts/autonomy-chart";
import { CostChart } from "@/components/charts/cost-chart";
import { InterruptChart } from "@/components/charts/interrupt-chart";
import { TtcChart } from "@/components/charts/ttc-chart";
import {
  complianceKpis,
  humanMinutesPerFile,
  reportKpis,
  reviewerActivity,
  ruleSummary,
} from "@/lib/data/reports";

export const metadata = {
  title: "Reports",
};

export default function ReportsPage() {
  const rule = ruleSummary();

  return (
    <>
      <div className="crumb">
        <Link href="/">Overview</Link> › reports
      </div>
      <div className="kicker">
        <h1>Reports</h1>
        <span className="eyebrow">Aug 25 – Sep 3 · 10 batches · 1,004 files</span>
      </div>
      <p className="lede" style={{ maxWidth: "76ch" }}>
        Agent performance across the last ten batches. Everything here is measured in
        production, not in the lab.
      </p>

      <KpiGrid items={reportKpis} />

      {/* 01 §2 · `loaded_rate_per_minute` and `manual_baseline_minutes` are marked
          [INPUT] and are to be treated as wrong until Finance and Ops supply them.
          So the saved-hours figure above is a model, and this says so next to it
          rather than in a footnote. */}
      <div className="unsourced">
        <span className="unsourced-h">Two inputs behind these are unsourced</span>
        <p>
          Hours saved rests on a manual baseline of about 25 minutes a file, which is an
          assumption rather than a time study, and on a loaded rate Finance has not yet
          supplied. Until both land in writing, read the hours as the shape of the model
          and not as a measurement — and do not carry the figure outside this page.
        </p>
        <p>
          What is measured: {reportKpis[0].val} files, {reportKpis[1].val} autonomy,{" "}
          {reportKpis[3].val} of inference per file, and{" "}
          <span className="mono">{humanMinutesPerFile.toFixed(1)}m</span> of human time
          per file — the last of which is the expensive half and the one worth optimising
          first.
        </p>
      </div>

      <ChartBlock
        title="Autonomy over the period"
        caption="share of files cleared with no human"
        takeaway="Two step changes, both at a bundle deploy. 0.11.0 bought about 3 points and 0.12.0 bought 5. The flat stretch from Aug 26 to 28 is worth noting — nothing shipped that week, and autonomy drifted rather than held, which usually means the incoming file mix changed rather than the agent."
      >
        <AutonomyChart />
      </ChartBlock>

      <ChartBlock
        title="Where the human time goes"
        caption="214 interrupts · volume against median resolution"
        keys={[
          { color: "var(--p-accent)", label: "resolves in under two minutes" },
          { color: "var(--p-hold)", label: "takes longer" },
        ]}
        takeaway="Volume and cost point in opposite directions. Conflicting extractions are 36% of interrupts and 41 seconds each — about 53 minutes of human time in ten days. Policy judgments are 12% of interrupts but four minutes each, and they need a senior reviewer. Cutting the biggest bar saves the least time; the case for automating conflicting extractions is the volume, not the burden."
      >
        <InterruptChart />
      </ChartBlock>

      <ChartBlock
        title="Cost by step"
        caption="of $2.19 per file"
        takeaway="Income orchestration and DTI are 48% of the spend between them, which follows from step 3 fanning out to nine calculators and step 4 now handing the checker a second copy of the obligation lines. Step 7 costs nine cents and closed a failure mode that had been open since 0.9.2 — the cheapest change in the ledger."
      >
        <CostChart />
      </ChartBlock>

      <ChartBlock
        title="Time to clear"
        caption="93 completed files in the current batch"
        takeaway="Tight and single-peaked, which is the shape you want — it means the procedure runs the same way on most files. The five files past 30 minutes were all self-employment income, where step 3 fans out furthest. There is no long tail of stuck files because stuck files become interrupts instead."
      >
        <TtcChart />
      </ChartBlock>

      {/* 03 §Metrics · the interrupt spec's own health metric. A rising rate means
          the payloads are degrading, which is a spec defect rather than a training
          issue — so it is reported rather than buried. */}
      <div className="sec">
        <div className="sechead">
          <h2>The thirty-second rule</h2>
          <span className="h">the interrupt spec’s own health metric</span>
        </div>
        <div className="rulelist">
          {rule.checks.map((check) => (
            <div
              className={
                check.exempt
                  ? "rulerow exempt"
                  : check.meetsPilotGate
                    ? "rulerow"
                    : "rulerow breach"
              }
              key={check.key}
            >
              <span className="rulerow-key mono">{check.key}</span>
              <span className="rulerow-median mono">{check.median}</span>
              <span className="rulerow-state">
                {check.exempt
                  ? "exempt · genuine deliberation"
                  : check.meetsTarget
                    ? "meets the 30s target"
                    : check.meetsPilotGate
                      ? "over target, inside the 90s pilot gate"
                      : "over the pilot gate"}
              </span>
            </div>
          ))}
        </div>
        <p className="takeaway" style={{ borderLeftColor: "var(--p-hold)" }}>
          None of the {rule.nonExempt} non-exempt types is under thirty seconds, and{" "}
          {rule.clearingPilotGate} of {rule.nonExempt} clear the ninety-second pilot gate.
          That puts{" "}
          <span className="mono">{Math.round(rule.volumeBreaching * 100)}%</span> of
          interrupt volume in a type that misses the target. The rule exists because a
          reviewer who has to read documents is doing the job the agent was supposed to
          do, so a breach is a payload defect rather than a slow reviewer.
        </p>
        <p className="takeaway">
          Worth flagging against the spec rather than around it:{" "}
          <span className="mono">03</span> exempts exactly one type, which leaves four
          non-exempt, but its acceptance criteria say “the three non-exempt types”. The
          fourth — <span className="mono">mandatory_escalation</span>, senior-only and
          3m 20s — reads like it was meant to be exempt alongside deliberation. Filed as
          an open question rather than resolved here.
        </p>
      </div>

      <div className="sec">
        <div className="sechead">
          <h2>Reviewer activity</h2>
          <span className="h">who resolved what</span>
        </div>
        {/* 06 §resolution_time must never be pooled. There is deliberately no
            median column here: it varies by an order of magnitude across types, so
            a single figure per person ranks the queue they happened to draw. The
            per-type medians live in the interrupt chart above. */}
        <div className="wrap scroll">
          <table className="tbl">
            <caption className="sr-only">
              Interrupts resolved per reviewer, without a pooled time
            </caption>
            <thead>
              <tr>
                <th>reviewer</th>
                <th>resolved</th>
                <th>corrections filed</th>
                <th className="nc">mix handled</th>
              </tr>
            </thead>
            <tbody>
              {reviewerActivity.map((row) => (
                <tr key={row.reviewer}>
                  <td className="m">{row.reviewer}</td>
                  <td className={row.waiting ? "m v-hold" : "m"}>{row.resolved}</td>
                  <td className="m">{row.corrections}</td>
                  <td className="nc">{row.mix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="takeaway">
          There is no median-time column, and its absence is the point. Resolution time
          runs from 41 seconds to four minutes depending on the interrupt type, so a
          single figure per person measures which queue they drew rather than how they
          work — a.silva takes the judgment calls, which are four minutes each by nature.
          Compare within a type or not at all.
        </p>
      </div>

      <div className="sec">
        <div className="sechead">
          <h2>Compliance</h2>
          <span className="h">every adverse action in the period</span>
        </div>
        <KpiGrid items={complianceKpis} />
        <p className="takeaway">
          The last two are the ones an examiner will ask for. Every adverse-action reason
          issued in the period resolves to a recorded finding, and every finding resolves to
          a page in a document — except the six computed fields, which resolve to the inputs
          and the formula instead.
        </p>
      </div>

      <div className="sec">
        <div className="sechead">
          <h2>What this doesn’t tell you</h2>
        </div>
        <p className="takeaway" style={{ borderLeftColor: "var(--p-hold)" }}>
          Sampled accuracy rests on 70 fields from five files. That is enough to catch a
          systematic error and nowhere near enough to put a confidence interval on. At the
          current draw rate it takes about three weeks to reach a number worth quoting
          outside this page, and until then 95.1% should be read as a direction rather than a
          measurement.
        </p>
      </div>
    </>
  );
}
