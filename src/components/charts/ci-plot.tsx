import { bundleIntervals, verdictTone } from "@/lib/data/experiments";

import { Bar, Dot, Rule, Txt, paint } from "./primitives";

const W = 690;
const L = 62;
const R = 126;
const ROW = 38;
const LO = 85;
const HI = 100;
const PW = W - L - R;
const H = bundleIntervals.length * ROW + 52;

const toneFill = {
  keep: paint.keep,
  discard: paint.discard,
  hold: paint.hold,
  none: paint.ink3,
} as const;

const x = (value: number) => L + ((value - LO) / (HI - LO)) * PW;

/** Accuracy with a 95% interval per bundle, against the shaded baseline band. */
export function CiPlot() {
  const baseline = bundleIntervals[0];
  const bandLeft = x(baseline.mean - baseline.err);
  const bandRight = x(baseline.mean + baseline.err);
  const bodyHeight = bundleIntervals.length * ROW;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Accuracy with confidence intervals by bundle"
    >
      <Bar x={bandLeft} y={28} w={bandRight - bandLeft} h={bodyHeight} fill={paint.panel} rx={0} />
      <Txt x={bandRight + 4} y={22} fill={paint.ink3} size={10.5}>
        baseline band
      </Txt>

      {[85, 90, 95, 100].map((tick) => (
        <g key={tick}>
          <Rule x1={x(tick)} y1={28} x2={x(tick)} y2={28 + bodyHeight} />
          <Txt x={x(tick)} y={H - 8} anchor="middle" fill={paint.ink3} size={9.5} mono>
            {tick}%
          </Txt>
        </g>
      ))}

      {bundleIntervals.map((bundle, index) => {
        const y = 28 + index * ROW + ROW / 2;
        const fill = toneFill[verdictTone[bundle.verdict]];
        const left = x(bundle.mean - bundle.err);
        const right = x(bundle.mean + bundle.err);

        return (
          <g key={bundle.v}>
            <Txt x={L - 8} y={y + 4} anchor="end" mono fill={paint.ink} size={12}>
              {bundle.v}
            </Txt>
            <Rule x1={left} y1={y} x2={right} y2={y} stroke={fill} width={2} />
            <Rule x1={left} y1={y - 4} x2={left} y2={y + 4} stroke={fill} width={2} />
            <Rule x1={right} y1={y - 4} x2={right} y2={y + 4} stroke={fill} width={2} />
            <Dot cx={x(bundle.mean)} cy={y} r={4} fill={fill} />
            <Txt x={W - R + 10} y={y + 4} mono fill={paint.ink} size={12}>
              {bundle.mean.toFixed(1)}%
            </Txt>
            <Txt x={W - R + 58} y={y + 4} mono fill={paint.ink3} size={11}>
              n {bundle.n}
            </Txt>
            <Txt x={W - R + 92} y={y + 4} fill={fill} size={11}>
              {bundle.verdict}
            </Txt>
          </g>
        );
      })}
    </svg>
  );
}
