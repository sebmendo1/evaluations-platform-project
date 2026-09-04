import type { Evidence, ImpactStatement } from "@/lib/domain/interrupt";

/** 03 §Common shape · an extracted value with its page, never document text. */
export function EvidenceList({ evidence }: { evidence: Evidence[] }) {
  return (
    <div className="evidence">
      <div className="evidence-h">What the run already has</div>
      {evidence.map((item, index) => (
        <div className="evidence-row" key={`${item.label}-${item.page}-${index}`}>
          <span className="evidence-src">
            {item.label} <span className="mono">pg {item.page}</span>
          </span>
          <span className="evidence-val mono">{item.excerpt}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * 03 §Common shape — `outcome_changes` is the triage signal and is computed from
 * the policy cards, so it renders as a stated fact rather than a hedge.
 */
export function Impact({ impact }: { impact: ImpactStatement }) {
  return (
    <div className={impact.outcomeChanges ? "impactbox moves" : "impactbox"}>
      <div className="impactbox-h">
        {impact.outcomeChanges
          ? "This changes the outcome"
          : "The outcome is unchanged either way"}
      </div>
      <p>{impact.narrative}</p>
    </div>
  );
}

export function OptionRow({
  value,
  source,
  cta,
  quiet,
  selected,
  disabled,
  onPick,
}: {
  value: string;
  source: string;
  cta?: string;
  quiet?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      className={quiet ? "opt quiet" : "opt"}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onPick}
    >
      <span className="v">{value}</span>
      <span className="src">{source}</span>
      {cta ? <span className="pick">{selected ? "Selected" : cta}</span> : null}
    </button>
  );
}

export function Resolved({
  text,
  tone = "keep",
}: {
  text: string;
  tone?: "keep" | "discard";
}) {
  return (
    <div
      className="verdictline"
      role="status"
      style={{
        background: tone === "keep" ? "var(--p-keep-bg)" : "var(--p-discard-bg)",
        color: tone === "keep" ? "var(--p-keep)" : "var(--p-discard)",
      }}
    >
      {text}
    </div>
  );
}

export function Blocked({ reason }: { reason: string }) {
  return (
    <div className="blocked" role="note">
      <span className="blocked-h">Not yours to resolve</span>
      <p>{reason}</p>
    </div>
  );
}

export function Problem({ text }: { text: string }) {
  return (
    <p className="impact" style={{ color: "var(--p-discard)" }} role="alert">
      {text}
    </p>
  );
}
