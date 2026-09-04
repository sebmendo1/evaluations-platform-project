import { stepCosts } from "@/lib/data/reports";

import { Bar, Rule, Txt, paint } from "./primitives";

const W = 690;
const L = 176;
const R = 64;
const ROW = 30;
const MAX = 0.65;
const PW = W - L - R;
const H = stepCosts.length * ROW + 32;

/** Cost per step of the eight-step review. Steps at or above $0.40 are highlighted. */
export function CostChart() {
  const bodyHeight = stepCosts.length * ROW;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Cost per step of the eight-step review"
    >
      {[0, 0.2, 0.4, 0.6].map((tick) => {
        const x = L + (tick / MAX) * PW;
        return (
          <g key={tick}>
            <Rule x1={x} y1={8} x2={x} y2={bodyHeight + 8} />
            <Txt x={x} y={H - 8} anchor="middle" fill={paint.ink3} size={9.5} mono>
              ${tick.toFixed(2)}
            </Txt>
          </g>
        );
      })}

      {stepCosts.map((item, index) => {
        const y = 8 + index * ROW;
        const big = item.cost >= 0.4;
        const width = (item.cost / MAX) * PW;

        return (
          <g key={item.step}>
            <Txt x={L - 9} y={y + 19} anchor="end" fill={paint.ink} size={11.5}>
              {item.step}
            </Txt>
            <Bar x={L} y={y + 8} w={width} h={14} fill={big ? paint.accent : paint.line2} />
            <Txt
              x={L + width + 7}
              y={y + 19}
              mono
              fill={big ? paint.ink : paint.ink2}
              size={11.5}
            >
              ${item.cost.toFixed(2)}
            </Txt>
          </g>
        );
      })}
    </svg>
  );
}
