import Link from "next/link";

import { AttemptCard } from "@/components/attempts/attempt-card";
import { ClickableRow } from "@/components/clickable-row";
import { HeldQueue } from "@/components/interrupts/queue";
import { Metric } from "@/components/metric";
import { SectionTabs } from "@/components/section-tabs";
import { autonomyLabel, batches, countFiles, currentBatch } from "@/lib/data/batches";
import { attempts, attemptVerdict } from "@/lib/data/attempts";
import { ledger, verdictTone } from "@/lib/data/experiments";
import { heldInterrupts, waitLabel } from "@/lib/data/interrupts";
import { recentReviews, verifyStats } from "@/lib/data/verify";
import { queueOrder } from "@/lib/domain/interrupt";
import { toneClass } from "@/lib/rich-text";

/**
 * Overview owns "the current state" (07 §Surface map), which is why batches and
 * blind review live here as sections rather than as their own rail groups. Both are
 * state you check, not places you navigate to and stay in.
 */
type Section = "queue" | "batches" | "verify" | "ledger" | "attempts";

const SECTIONS: Section[] = ["queue", "batches", "verify", "ledger", "attempts"];

function isSection(value: string | undefined): value is Section {
  return SECTIONS.includes(value as Section);
}

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const { section } = await searchParams;
  const active: Section = isSection(section) ? section : "queue";

  const held = countFiles(currentBatch, "held");
  const batchHref = `/batches/${currentBatch.id}`;
  // 03 §Routing · wait time within a routing class, not a priority score.
  const queue = queueOrder(heldInterrupts);
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
          A batch is a thread and its files are turns inside it. Opening one lands on
          the held filter, because that is the only view with anything waiting on a
          person — the other {countFiles(currentBatch, "cleared")} files in the current
          batch cleared on their own.
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
          The reviewer is not told which files are sampled. That blindness is the point:
          the queue only ever shows you files where the run knew it was unsure, so it is
          structurally unable to catch a file the run got wrong confidently. This is the
          only control that sees those.
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
                    <td className={toneClass[verdictTone[row.verdict]]}>
                      {row.verdict}
                    </td>
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
          Evals have ground truth so they report accuracy. Batches don’t, so they report
          autonomy and lean on blind review for accuracy. Nothing is edited after it
          lands, including the crash and the discard.
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
          Two attempts are open: one grading, one drafted and unspent. The drafted one
          would remove three of every four conflicting-extraction stops, which is also
          exactly the change the autonomy guardrail exists to police.
        </p>
      </>
  );

  return (
    <>
      <h1>Overview</h1>
      <p className="lede">
        One batch running on bundle {currentBatch.bundle}. {held} files are waiting on a
        person.
      </p>

      {/* Every figure here resolves to an entry in 06 and carries its provenance
          from the dictionary rather than from a hand-written string. */}
      <div className="strip3">
        <Metric
          id="cost_per_run"
          context="production"
          value="$2.19"
          detail="$237 today · up $0.07 on 0.12.0"
        />
        <Metric
          id="sampled_accuracy"
          context="production"
          value="95.1%"
          n="70 fields"
          detail="the only production accuracy figure"
        />
        <Metric
          id="files_in_batch"
          context="production"
          value={String(currentBatch.files.length)}
          detail="graded runs are counted separately"
        />
      </div>

      <div className="strip2">
        <Metric
          id="autonomy_rate"
          context="production"
          size="small"
          tone="keep"
          value={autonomyLabel(currentBatch)}
          detail="cleared with no human · was 79%"
        />
        <Metric
          id="held_count"
          context="production"
          size="small"
          tone="hold"
          value={String(held)}
          detail={`oldest has waited ${waitLabel(queue[0].waitedSeconds)}`}
        />
      </div>

      <p className="takeaway" style={{ borderLeftColor: "var(--p-hold)" }}>
        What this doesn’t tell you: 95.1% rests on 70 fields from five blind reviews.
        That is enough to catch a systematic error and nowhere near enough to carry an
        interval. The graded figure from the corpus reads 96.4% ±1.2, and it is not a
        production measurement — live files are messier than the set.
      </p>

      <SectionTabs
        label="Overview sections"
        param="section"
        initial={active}
        tabs={[
          {
            key: "queue",
            label: "Waiting on you",
            count: held,
            panel: <HeldQueue batchHref={batchHref} />,
            action: (
              <Link className="btn sm" href={batchHref}>
                Open the batch
              </Link>
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
              <Link className="btn sm" href="/verify">
                Open blind review
              </Link>
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
              <Link className="btn sm" href="/attempts">
                All attempts
              </Link>
            ),
          },
        ]}
      />





    </>
  );
}
