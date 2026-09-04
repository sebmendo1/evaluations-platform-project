import Link from "next/link";
import { notFound } from "next/navigation";

import { Metric } from "@/components/metric";
import { Crumbs } from "@/components/crumbs";
import { activeLoanCrumbs, batchContaining } from "@/lib/crumbs";
import {
  chainFor,
  citationCoverage,
  getDecision,
  sampleDecisionRefs,
} from "@/lib/data/decisions";
import { step } from "@/lib/data/procedure";

type Params = { loanRef: string };

export async function generateStaticParams() {
  return sampleDecisionRefs.map((loanRef) => ({ loanRef }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { loanRef } = await params;
  return { title: `${loanRef.toUpperCase()} — audit chain` };
}

/**
 * 05 §3 · the audit chain, resolving from any decision rather than one worked
 * example. Down to a page in a document, up to the experiment that authorised the
 * bundle. INV-9.
 */
export default async function DecisionPage({ params }: { params: Promise<Params> }) {
  const { loanRef } = await params;
  const record = getDecision(loanRef);

  if (!record) {
    notFound();
  }

  const chain = chainFor(record);
  const coverage = citationCoverage(record.fields);
  const batch = batchContaining(record.decision.loanRef);

  return (
    <>
      {batch ? (
        <Crumbs
          segments={activeLoanCrumbs({
            batchId: batch.id,
            filter: "cleared",
            loanRef: record.decision.loanRef,
          })}
        />
      ) : (
        <div className="crumb">
          <Link href="/">Overview</Link> ›{" "}
          <Link href="/governance#g-audit">governance</Link> › {record.decision.loanRef}
        </div>
      )}

      <div className="kicker">
        <h1 className="mono">{record.decision.loanRef}</h1>
        <span className="eyebrow">audit chain</span>
      </div>
      <p className="lede">
        {record.decision.outcome} · {record.decision.lineSupportable}. Every field below
        resolves down to a page in a document or to a named formula, and the bundle
        resolves up to the experiment that authorised it.
      </p>

      <div className="strip2" style={{ maxWidth: "520px" }}>
        <Metric
          id="citation_coverage"
          context="production"
          size="small"
          tone={coverage.incident ? "hold" : "keep"}
          value={`${(coverage.coverage * 100).toFixed(1)}%`}
          detail={`${coverage.cited} of ${coverage.eligible} extractable fields`}
        />
        <div className="small">
          <div className="lab">Bundle</div>
          <div className="val mono">{chain.bundle}</div>
          <div className="sub">stamped on this decision · INV-9</div>
        </div>
      </div>

      {coverage.incident ? (
        <p className="takeaway" style={{ borderLeftColor: "var(--p-discard)" }}>
          Citation coverage is below the {(0.99 * 100).toFixed(0)}% floor. `05 §3` is
          explicit that a decline here is a correctness incident rather than a reporting
          issue — a field nobody can trace is a defect, not a low-confidence value.
        </p>
      ) : (
        <p className="impact">
          {coverage.computedFields} of the {coverage.total} fields are computed, and those
          resolve to their inputs and a named formula rather than to a page. That is the
          stated exception behind this figure, not a gap in it.
        </p>
      )}

      <div className="sec">
        <div className="sechead">
          <h2>Down to the evidence</h2>
          <span className="h">every recorded field · INV-1</span>
        </div>
        <div className="wrap scroll">
          <table className="tbl">
            <caption className="sr-only">
              Recorded fields with their provenance and checker status
            </caption>
            <thead>
              <tr>
                <th>field</th>
                <th>value</th>
                <th>step</th>
                <th>resolves to</th>
                <th>checker</th>
              </tr>
            </thead>
            <tbody>
              {chain.fields.map((field) => (
                <tr key={field.name}>
                  <td className="m">{field.name}</td>
                  <td className="m">{field.value}</td>
                  <td>{step(field.step).name}</td>
                  <td
                    className={
                      field.provenance.kind === "stated" ? "nc v-dis" : "nc"
                    }
                  >
                    {field.citationText}
                  </td>
                  <td
                    className={
                      field.checkerStatus === "agreed" ? "v-keep" : "v-none"
                    }
                  >
                    {field.checkerStatus.replace(/_/g, " ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {record.corrected ? (
          <p className="impact">
            <span className="mono">InvestmentAccounts</span> carries{" "}
            <span className="mono">stated</span> provenance because a person corrected it
            in blind review — the run had read a prior-quarter page and nothing flagged
            it. That is what makes this chain resolve to a person rather than only to a
            document.
          </p>
        ) : null}
      </div>

      <div className="sec">
        <div className="sechead">
          <h2>Up to the authorisation</h2>
          <span className="h">INV-9 · the chain a reviewer arrives for</span>
        </div>
        <div className="wrap">
          <div style={{ padding: "14px" }} className="audit">
            <div>
              decision <b>{record.decision.loanRef} · {record.decision.outcome} {record.decision.lineSupportable}</b>
            </div>
            <div>
              {"\u00a0"}└ bundle <b>{chain.bundle}</b> · signed s.mendo
            </div>
            {chain.attempt ? (
              <>
                <div>
                  {"\u00a0".repeat(4)}└ promoted by attempt <b>{chain.attempt.title}</b>
                </div>
                {chain.evidence ? (
                  <div>
                    {"\u00a0".repeat(7)}└ evidence <b>{chain.evidence}</b>
                  </div>
                ) : null}
                <div>
                  {"\u00a0".repeat(7)}└ against baseline <b>92.4% ±2.0, n 5</b>
                </div>
              </>
            ) : (
              <div>
                {"\u00a0".repeat(4)}└ <span className="v-dis">no promoting experiment on record</span>
              </div>
            )}
          </div>
        </div>
        {chain.attempt ? (
          <div className="actions">
            <Link className="btn" href={`/attempts/${chain.attempt.slug}`}>
              Open the attempt
            </Link>
            <Link className="btn" href="/governance?compare=1">
              See what that bundle changed
            </Link>
          </div>
        ) : null}
        <p className="takeaway">
          This is the examination artifact. A reviewer who was not in the room can start
          from a decision, reach the page a value came from, and reach the experiment that
          authorised the agent which produced it — without asking anyone a question.
        </p>
      </div>
    </>
  );
}
