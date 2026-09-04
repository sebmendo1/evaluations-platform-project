import { gradedVsSampled } from "@/lib/data/experiments";

import { Dot, Rule, Txt, paint } from "./primitives";

const W = 690;
const L = 62;
const R = 170;
const ROW = 40;
const LO = 88;
const HI = 98;
const PW = W - L - R;
const H = gradedVsSampled.length * ROW + 48;

const x = (value: number) => L + ((value - LO) / (HI - LO)) * PW;

/** Graded accuracy joined to blind sampled accuracy — the gap is the point. */
export function GapChart() {
  const bodyHeight = gradedVsSampled.length * ROW;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Graded accuracy compared with sampled production accuracy by bundle"
    >
      {[88, 90, 92, 94, 96, 98].map((tick) => (
        <g key={tick}>
          <Rule x1={x(tick)} y1={20} x2={x(tick)} y2={20 + bodyHeight} />
          <Txt x={x(tick)} y={H - 8} anchor="middle" fill={paint.ink3} size={9.5} mono>
            {tick}%
          </Txt>
        </g>
      ))}

      {gradedVsSampled.map((row, index) => {
        const y = 20 + index * ROW + ROW / 2;
        return (
          <g key={row.v}>
            <Txt x={L - 8} y={y + 4} anchor="end" mono fill={paint.ink} size={12}>
              {row.v}
            </Txt>
            <Rule
              x1={x(row.sampled)}
              y1={y}
              x2={x(row.graded)}
              y2={y}
              stroke={paint.line2}
              width={1.5}
            />
            <Dot cx={x(row.graded)} cy={y} r={4.5} fill={paint.accent} />
            <Dot cx={x(row.sampled)} cy={y} r={4.5} fill={paint.hold} />
            <Txt x={W - R + 10} y={y + 4} mono fill={paint.accent} size={11.5}>
              {row.graded.toFixed(1)}
            </Txt>
            <Txt x={W - R + 52} y={y + 4} mono fill={paint.hold} size={11.5}>
              {row.sampled.toFixed(1)}
            </Txt>
            <Txt x={W - R + 96} y={y + 4} mono fill={paint.ink3} size={11}>
              −{(row.graded - row.sampled).toFixed(1)} pt
            </Txt>
          </g>
        );
      })}
    </svg>
  );
}
