import { notFound } from "next/navigation";

import { ActionBox, Turn } from "@/components/blocks";
import { AttemptStatus } from "@/components/attempts/attempt-card";
import { Crumbs } from "@/components/crumbs";
import { Rich } from "@/components/rich-text";
import { attempts, attemptVerdict, getAttempt } from "@/lib/data/attempts";
import { experimentCrumbs } from "@/lib/crumbs";
import { stepLabel, stepsLabel, step } from "@/lib/data/procedure";
import { BASELINE } from "@/lib/domain/constants";
import type { RichText } from "@/lib/rich-text";

type Params = { attemptSlug: string };

export async function generateStaticParams() {
  return attempts.map((attempt) => ({ attemptSlug: attempt.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { attemptSlug } = await params;
  return { title: getAttempt(attemptSlug)?.title ?? "Attempt" };
}

function Paras({ paras }: { paras: RichText[] }) {
  return (
    <>
      {paras.map((para, index) => (
        <p key={index} style={index > 0 ? { marginTop: "1em" } : undefined}>
          <Rich parts={para} />
        </p>
      ))}
    </>
  );
}

export default async function AttemptPage({ params }: { params: Promise<Params> }) {
  const { attemptSlug } = await params;
  const attempt = getAttempt(attemptSlug);

  if (!attempt) {
    notFound();
  }

  const computed = attemptVerdict(attempt);
  const touched = [...new Set(attempt.changes.flatMap((c) => c.steps))].sort(
    (a, b) => a - b,
  );

  return (
    <>
      <Crumbs
        segments={experimentCrumbs({
          attemptSlug: attempt.slug,
          section: "procedure",
        })}
      />

      <div className="kicker">
        <h1>{attempt.title}</h1>
        <span className="eyebrow">
          {attempt.from} → {attempt.bundle}
        </span>
      </div>
      <p className="lede">{attempt.summary}</p>

      {/* What the reviewer needs before the transcript: where it sits, what it
          touched, what it cost, and what it did to the queue. */}
      <div className="wrap" style={{ marginTop: "16px" }}>
        <table className="tbl">
          <caption className="sr-only">Attempt at a glance</caption>
          <tbody>
            <tr>
              <td>Status</td>
              <td>
                <AttemptStatus attempt={attempt} />
                {attempt.promoted ? " · in production" : null}
              </td>
            </tr>
            <tr>
              <td>Procedure touched</td>
              <td>{stepsLabel(touched)}</td>
            </tr>
            <tr>
              <td>Tested against</td>
              <td>
                {attempt.corpus} ·{" "}
                <span className="mono">
                  {attempt.runsGraded} of {attempt.runsPlanned} runs
                </span>
                , {attempt.grader}
              </td>
            </tr>
            <tr>
              <td>Evidence</td>
              <td className="m">
                {attempt.result
                  ? `${attempt.result.accuracy.toFixed(1)}% ±${attempt.result.interval.toFixed(1)} against ${BASELINE.accuracy}% ±${BASELINE.interval} baseline`
                  : "—"}
              </td>
            </tr>
            <tr>
              <td>Spent</td>
              <td className="m">
                {attempt.result
                  ? `${attempt.result.cost} · ${attempt.result.wallMinutes}m`
                  : "nothing yet"}
              </td>
            </tr>
            <tr>
              <td>Owner</td>
              <td className="m">{attempt.owner}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="sec" id="procedure">
        <div className="sechead">
          <h2>What changed in the procedure</h2>
          <span className="h">before and after, by step</span>
        </div>
        {attempt.changes.map((change, index) => (
          <div className="gcard" key={index}>
            <div className="gh">
              <span className="gn">
                {change.steps.length === 0
                  ? "No procedure change"
                  : change.steps.map((n) => stepLabel(n)).join(" · ")}
              </span>
            </div>
            {change.steps.length > 0 ? (
              <p style={{ color: "var(--p-ink-3)" }}>
                {change.steps.map((n) => step(n).work).join(" ")}
              </p>
            ) : null}
            <div className="beforeafter">
              <div className="ba-row">
                <span className="ba-k">Was</span>
                <span>{change.before}</span>
              </div>
              <div className="ba-row ba-now">
                <span className="ba-k">Now</span>
                <span>{change.after}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="sec" id="queue">
        <div className="sechead">
          <h2>What it did to the queue</h2>
          <span className="h">the reviewer’s side of the loop</span>
        </div>
        <p className="takeaway">{attempt.queueEffect}</p>
      </div>

      <div className="sec" id="thread">
        <div className="sechead">
          <h2>Thread</h2>
          <span className="h">
            {computed === "pending"
              ? "no verdict until every run is in"
              : `verdict computed as ${computed}`}
          </span>
        </div>
        {attempt.turns.map((turn, index) => (
          <Turn who={turn.who} first={index === 0} key={`${turn.who}-${index}`}>
            {turn.kind === "prompt" ? (
              <div className="prompt">
                <Paras paras={turn.paras} />
              </div>
            ) : null}
            {turn.kind === "user" ? (
              <div className="msg u">
                <Paras paras={turn.paras} />
              </div>
            ) : null}
            {turn.kind === "message" ? (
              <>
                <div className="msg">
                  <Paras paras={turn.paras} />
                </div>
                {turn.action ? (
                  <ActionBox buttons={turn.action.buttons}>
                    <Rich parts={turn.action.text} />
                  </ActionBox>
                ) : null}
              </>
            ) : null}
          </Turn>
        ))}
      </div>
    </>
  );
}
