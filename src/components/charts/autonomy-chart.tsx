import { autonomyDeploys, autonomyLabels, autonomySeries } from "@/lib/data/reports";

import { Dot, Rule, Txt, paint } from "./primitives";

const W = 690;
const L = 42;
const R = 24;
const TOP = 24;
const BOTTOM = 42;
const H = 260;
const PW = W - L - R;
const PH = H - TOP - BOTTOM;
const LO = 65;
const HI = 90;

const x = (index: number) => L + (index / (autonomySeries.length - 1)) * PW;
const y = (value: number) => TOP + PH - ((value - LO) / (HI - LO)) * PH;

/** Autonomy per batch with a marker wherever a bundle went live. */
export function AutonomyChart() {
  const last = autonomySeries.length - 1;
  const points = autonomySeries.map((value, index) => `${x(index)},${y(value)}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Autonomy rate over ten batches with bundle deploy markers"
    >
      {[65, 70, 75, 80, 85, 90].map((tick) => (
        <g key={tick}>
          <Rule x1={L} y1={y(tick)} x2={W - R} y2={y(tick)} />
          <Txt x={L - 7} y={y(tick) + 4} anchor="end" fill={paint.ink3} size={9.5} mono>
            {tick}%
          </Txt>
        </g>
      ))}

      <polyline points={points} style={{ fill: "none", stroke: paint.keep, strokeWidth: 2 }} />

      {autonomySeries.map((value, index) => {
        const deploy = autonomyDeploys[index];
        const showLabel = index % 2 === 0 || index === last;

        return (
          <g key={`${index}-${value}`}>
            {deploy ? (
              <>
                <Rule
                  x1={x(index)}
                  y1={TOP}
                  x2={x(index)}
                  y2={TOP + PH}
                  stroke={paint.line2}
                />
                <Txt x={x(index) + 4} y={TOP + 9} fill={paint.accent} size={10.5} mono>
                  {deploy}
                </Txt>
              </>
            ) : null}
            <Dot
              cx={x(index)}
              cy={y(value)}
              r={3.5}
              fill={index === last ? paint.keep : paint.paper}
              stroke={paint.keep}
            />
            {showLabel ? (
              <Txt x={x(index)} y={H - 20} anchor="middle" fill={paint.ink3} size={9.5}>
                {autonomyLabels[index]}
              </Txt>
            ) : null}
          </g>
        );
      })}

      <Txt
        x={x(last)}
        y={y(autonomySeries[last]) - 11}
        anchor="end"
        fill={paint.keep}
        size={12}
        mono
        weight={500}
      >
        {autonomySeries[last]}%
      </Txt>
    </svg>
  );
}
