import { Rule, Txt, paint } from "./primitives";

export type AreaSeriesPoint = {
  label: string;
  value: number;
};

/**
 * Figma Overview · filled area over a period. Used when the range has enough
 * daily points to read as a period instrument (06 · Chart selection: change
 * over many periods). Not an accuracy trend.
 */
export function AreaSeriesChart({
  points,
  min,
  max,
  formatTick,
  ariaLabel,
  stroke,
  fill,
}: {
  points: AreaSeriesPoint[];
  min: number;
  max: number;
  formatTick: (value: number) => string;
  ariaLabel: string;
  stroke: string;
  fill: string;
}) {
  const W = 690;
  const L = 48;
  const R = 28;
  const TOP = 20;
  const BOTTOM = 48;
  const H = 220;
  const PW = W - L - R;
  const PH = H - TOP - BOTTOM;
  const span = Math.max(max - min, 0.0001);
  const last = Math.max(points.length - 1, 1);

  const x = (index: number) => L + (index / last) * PW;
  const y = (value: number) => TOP + PH - ((value - min) / span) * PH;

  const line = points
    .map((point, index) => `${x(index).toFixed(1)},${y(point.value).toFixed(1)}`)
    .join(" ");
  const area = points.length
    ? `M ${x(0).toFixed(1)} ${y(points[0].value).toFixed(1)} ${points
        .slice(1)
        .map((point, index) => `L ${x(index + 1).toFixed(1)} ${y(point.value).toFixed(1)}`)
        .join(" ")} L ${x(points.length - 1).toFixed(1)} ${(TOP + PH).toFixed(1)} L ${x(0).toFixed(1)} ${(TOP + PH).toFixed(1)} Z`
    : "";

  const ticks = [min, min + span / 2, max];
  const labelEvery = points.length > 10 ? 4 : points.length > 7 ? 2 : 1;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel}>
      {ticks.map((tick) => (
        <g key={tick}>
          <Rule x1={L} y1={y(tick)} x2={W - R} y2={y(tick)} />
          <Txt x={L - 8} y={y(tick) + 4} anchor="end" fill={paint.ink3} size={9.5} mono>
            {formatTick(tick)}
          </Txt>
        </g>
      ))}

      {area ? <path d={area} style={{ fill, stroke: "none" }} /> : null}
      {line ? (
        <polyline points={line} style={{ fill: "none", stroke, strokeWidth: 2 }} />
      ) : null}

      {points.map((point, index) =>
        index % labelEvery === 0 || index === points.length - 1 ? (
          <Txt
            key={`${point.label}-${index}`}
            x={x(index)}
            y={H - 18}
            anchor="middle"
            fill={paint.ink3}
            size={9.5}
          >
            {point.label}
          </Txt>
        ) : null,
      )}
    </svg>
  );
}
