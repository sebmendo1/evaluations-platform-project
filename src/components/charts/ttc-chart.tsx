import { timeToClear } from "@/lib/data/reports";

import { Bar, Rule, Txt, paint } from "./primitives";

const W = 690;
const L = 40;
const R = 20;
const TOP = 22;
const BOTTOM = 42;
const H = 240;
const MAX = 32;
const PW = W - L - R;
const PH = H - TOP - BOTTOM;
const BW = PW / timeToClear.length;
const MODE_INDEX = 2;

/** Distribution of time to clear across the batch's completed files. */
export function TtcChart() {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Distribution of time to clear across 93 completed files"
    >
      {[0, 8, 16, 24, 32].map((tick) => {
        const y = TOP + PH - (tick / MAX) * PH;
        return (
          <g key={tick}>
            <Rule x1={L} y1={y} x2={W - R} y2={y} />
            <Txt x={L - 7} y={y + 4} anchor="end" fill={paint.ink3} size={9.5} mono>
              {tick}
            </Txt>
          </g>
        );
      })}

      {timeToClear.map((item, index) => {
        const height = (item.count / MAX) * PH;
        const x = L + index * BW + BW * 0.18;
        const width = BW * 0.64;

        return (
          <g key={item.bucket}>
            <Bar
              x={x}
              y={TOP + PH - height}
              w={width}
              h={height}
              fill={index === MODE_INDEX ? paint.accent : paint.line2}
            />
            <Txt
              x={x + width / 2}
              y={TOP + PH - height - 5}
              anchor="middle"
              fill={paint.ink2}
              size={11}
              mono
            >
              {item.count}
            </Txt>
            <Txt x={x + width / 2} y={H - 20} anchor="middle" fill={paint.ink3} size={9.5} mono>
              {item.bucket}
            </Txt>
          </g>
        );
      })}

      <Rule x1={L} y1={TOP + PH} x2={W - R} y2={TOP + PH} stroke={paint.line2} />
    </svg>
  );
}
