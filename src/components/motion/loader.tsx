"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASE_IN_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type LoaderVariant = "spinner" | "dots" | "bars" | "dot-matrix" | "dither" | "ascii" | "ascii-line" | "ascii-braille" | "ascii-blocks" | "ascii-bounce" | "morph" | "comet" | "scramble" | "metaballs" | "newton" | "helix" | "percent";

export interface LoaderProps {
  variant?: LoaderVariant;
  size?: number;
  speed?: number;
  label?: string;
  decorative?: boolean;
  className?: string;
}

const REDUCED = {
  animate: { opacity: [1, 0.4, 1] },
  transition: { duration: 1.4, ease: EASE_IN_OUT, repeat: Infinity },
};

/** Minimal loader for production deploy; full variants live in Origin. */
export function Loader({
  variant = "spinner",
  size = 32,
  speed = 1,
  label = "Loading",
  decorative = false,
  className,
}: LoaderProps) {
  const reduce = useReducedMotion() ?? false;
  const n = 3;
  const gap = size * 0.12;
  const cell = (size - gap * (n - 1)) / n;

  return (
    <span
      role={decorative ? undefined : "status"}
      aria-label={decorative ? undefined : label}
      className={cn("inline-flex items-center justify-center text-foreground", className)}
    >
      <span className="grid" style={{ gridTemplateColumns: `repeat(${n}, ${cell}px)`, gap }}>
        {Array.from({ length: n * n }, (_, i) => (
          <motion.span
            key={i}
            className="rounded-[1px] bg-current"
            style={{ width: cell, height: cell }}
            animate={reduce ? REDUCED.animate : { opacity: [0.15, 1, 0.15] }}
            transition={{
              duration: speed,
              ease: EASE_IN_OUT,
              repeat: Infinity,
              delay: ((i % n) + Math.floor(i / n)) * speed * 0.08,
            }}
          />
        ))}
      </span>
      {decorative ? null : <span className="sr-only">{label}</span>}
    </span>
  );
}
