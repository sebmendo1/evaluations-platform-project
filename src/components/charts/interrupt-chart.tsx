import { interruptMix } from "@/lib/data/reports";

import { Bar, Rule, Txt, paint } from "./primitives";

const W = 690;
const L = 176;
const R = 150;
const ROW = 36;
const MAX = 80;
const PW = W - L - R;
const H = interruptMix.length * ROW + 34;

/** Interrupt volume against median resolution time. Bars over two minutes
 *  switch colour, because volume and human cost point in opposite directions. */
export function InterruptChart() {
  const bodyHeight = interruptMix.length * ROW;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Interrupt volume and median resolution time by type"
    >
      {[0, 20, 40, 60, 80].map((tick) => {
        const x = L + (tick / MAX) * PW;
        return (
          <g key={tick}>
            <Rule x1={x} y1={8} x2={x} y2={bodyHeight + 8} />
            <Txt x={x} y={H - 6} anchor="middle" fill={paint.ink3} size={9.5} mono>
              {tick}
            </Txt>
          </g>
        );
      })}

      {interruptMix.map((item, index) => {
        const y = 8 + index * ROW;
        const fill = item.seconds > 120 ? paint.hold : paint.accent;
        const width = (item.count / MAX) * PW;

        return (
          <g key={item.key}>
            <Txt x={L - 9} y={y + 20} anchor="end" mono fill={paint.ink} size={11.5}>
              {item.key}
            </Txt>
            <Bar x={L} y={y + 9} w={width} h={15} fill={fill} />
            <Txt x={L + width + 7} y={y + 21} mono fill={paint.ink} size={11.5}>
              {item.count}
            </Txt>
            <Txt x={W - R + 68} y={y + 21} anchor="end" mono fill={fill} size={11.5}>
              {item.median}
            </Txt>
            <Txt x={W - R + 74} y={y + 21} fill={paint.ink3} size={10.5}>
              median
            </Txt>
          </g>
        );
      })}
    </svg>
  );
}
