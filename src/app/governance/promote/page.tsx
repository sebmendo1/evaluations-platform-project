import Link from "next/link";

import { getVersion } from "@/lib/data/governance";
import { BASELINE } from "@/lib/domain/constants";
import { evaluateGate, gatePasses } from "@/lib/domain/promotion";

export const metadata = {
  title: "Promotion gate",
};

const CURRENT = {
  accuracy: 96.4,
  interval: 1.2,
  fieldsGraded: 1800,
  n: 12,
  status: "complete" as const,
};

/**
 * 05 §4 · every failing condition stated individually, because "a single 'cannot
 * promote' is not actionable".
 *
 * The second scenario is the one worth reading: a bundle that earns `keep` and
 * still cannot go live, because autonomy rose while sampled accuracy fell.
 */
export default async function PromotePage({
  searchParams,
}: {
  searchParams: Promise<{ v?: string; scenario?: string }>;
}) {
  const query = await searchParams;
  const bundle = getVersion(query.v ?? "0.12.0");
  const guardrail = query.scenario === "guardrail";

  const conditions = evaluateGate({
    bundle,
    result: CURRENT,
    baseline: BASELINE,
    // The draft source-precedence change is exactly the shape INV-4 polices.
    autonomyDelta: guardrail ? 7.2 : 7.2,
    sampledAccuracyDelta: guardrail ? -1.4 : 1.1,
    modelRiskReviewedAt: bundle.v === "0.12.0" ? "Sep 3, 11:40 · d.nguyen" : null,
    signedBy: bundle.signedBy,
  });

  const allowed = gatePasses(conditions);
  const failing = conditions.filter((condition) => !condition.passed);

  return (
    <div className="gwrap">
      <div className="crumb">
        <Link href="/">Overview</Link> ›{" "}
        <Link href="/governance">governance</Link> › promotion gate
      </div>

      <div className="kicker">
        <h1>Promotion gate</h1>
        <span className="eyebrow mono">{bundle.v}</span>
      </div>
      <p className="lede">
        Seven conditions, checked individually. A bundle moves from evaluated to live
        only when all of them hold.
      </p>

      <div className="vswitch">
        <Link
          className={guardrail ? "vpill" : "vpill on"}
          href={`/governance/promote?v=${bundle.v}`}
        >
          As measured
        </Link>
        <Link
          className={guardrail ? "vpill on" : "vpill"}
          href={`/governance/promote?v=${bundle.v}&scenario=guardrail`}
        >
          If sampled accuracy had fallen
        </Link>
      </div>

      <div
        className={allowed ? "gateverdict pass" : "gateverdict fail"}
        role="status"
      >
        <span className="gateverdict-h">
          {allowed
            ? "All seven conditions hold — this bundle can be promoted"
            : `Blocked on ${failing.length} of 7 conditions`}
        </span>
        {!allowed ? (
          <p>
            {failing.map((condition) => condition.requirement).join(". ")}. Each is stated
            in full below.
          </p>
        ) : null}
      </div>

      <div className="gatelist">
        {conditions.map((condition) => (
          <div
            className={condition.passed ? "gaterow pass" : "gaterow fail"}
            key={condition.id}
          >
            <span className="gaterow-mark" aria-hidden="true">
              {condition.passed ? "✓" : "✕"}
            </span>
            <span className="gaterow-text">
              <span className="gaterow-req">
                {condition.requirement}
                <span className="gaterow-cite mono">{condition.cites}</span>
              </span>
              <span className="gaterow-detail">{condition.detail}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="actions">
        <button className="btn pri" type="button" disabled={!allowed}>
          {allowed ? "Promote to production" : "Cannot promote"}
        </button>
        <Link className="btn" href="/governance?compare=1">
          Review what changed
        </Link>
      </div>

      <p className="takeaway">
        {guardrail
          ? "This is the scenario the guardrail exists for. The verdict is keep, the interval separates, every skill is present and the bundle is signed — and it still cannot go live, because the autonomy gain came with an accuracy loss. Every interrupt removed to raise autonomy is a case where the run now guesses instead of asking."
          : "The gate is enforced here rather than described in a policy memo. Switch to the second scenario to see a bundle that earns a keep verdict and is still refused."}
      </p>
    </div>
  );
}
