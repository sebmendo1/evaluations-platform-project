import type { ReactNode } from "react";

export const paint = {
  ink: "var(--p-ink)",
  ink2: "var(--p-ink-2)",
  ink3: "var(--p-ink-3)",
  line: "var(--p-line)",
  line2: "var(--p-line-2)",
  keep: "var(--p-keep)",
  discard: "var(--p-discard)",
  hold: "var(--p-hold)",
  accent: "var(--p-accent)",
  panel: "var(--p-panel)",
  paper: "var(--p-paper)",
} as const;

export function Txt({
  x,
  y,
  children,
  fill = paint.ink2,
  size = 11.5,
  mono = false,
  anchor = "start",
  weight = 400,
}: {
  x: number;
  y: number;
  children: ReactNode;
  fill?: string;
  size?: number;
  mono?: boolean;
  anchor?: "start" | "middle" | "end";
  weight?: number;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      style={{
        fill,
        fontSize: `${size}px`,
        fontFamily: mono ? "var(--p-mono)" : "var(--p-sans)",
        fontWeight: weight,
      }}
    >
      {children}
    </text>
  );
}

export function Rule({
  x1,
  y1,
  x2,
  y2,
  stroke = paint.line,
  width = 1,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke?: string;
  width?: number;
}) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2} style={{ stroke, strokeWidth: width }} />
  );
}

export function Bar({
  x,
  y,
  w,
  h,
  fill,
  rx = 2,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  rx?: number;
}) {
  return (
    <rect x={x} y={y} width={Math.max(0, w)} height={Math.max(0, h)} rx={rx} style={{ fill }} />
  );
}

export function Dot({
  cx,
  cy,
  r,
  fill,
  stroke,
}: {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  stroke?: string;
}) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      style={stroke ? { fill, stroke, strokeWidth: 2 } : { fill }}
    />
  );
}
