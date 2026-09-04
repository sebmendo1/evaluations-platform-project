import { assertContext, metric, type MetricId } from "@/lib/metrics";

/**
 * 06 §Rule of provenance — "Every metric renders with its provenance in the same
 * visual unit as the number. Not in a tooltip, not in a footnote."
 *
 * The label comes from the dictionary rather than the caller, which is what
 * `06 §Acceptance` means by "enforced in the component". Rendering a lab metric in
 * a production context throws.
 */
export function Metric({
  id,
  value,
  context,
  detail,
  n,
  size = "big",
  tone,
}: {
  id: MetricId;
  value: string;
  context: "lab" | "production";
  /** Extra prose beneath, for the figures that need more than a label. */
  detail?: string;
  /** Required where the dictionary marks the metric as needing its n. */
  n?: string;
  size?: "big" | "small" | "kpi";
  tone?: "keep" | "hold";
}) {
  const def = metric(id);
  assertContext(id, context);

  if (def.needsN && !n) {
    throw new Error(
      `06 · ${id} must render with the n it rests on; where n is small the limitation goes on the page`,
    );
  }

  const provenance = [def.provenance, n].filter(Boolean).join(" · ");
  const className = [size, tone === "keep" ? "good" : "", tone === "hold" ? "warn" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      <div className="lab">{def.label}</div>
      {/* 08 §2 · a machine-produced value sets in the mono face at every size. */}
      <div className="val mono">{value}</div>
      <div className="sub">
        {provenance ? <span className="metric-prov">{provenance}</span> : null}
        {provenance && detail ? " · " : null}
        {detail}
      </div>
    </div>
  );
}
