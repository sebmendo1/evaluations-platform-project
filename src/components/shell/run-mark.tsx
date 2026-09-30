"use client";

import { Loader } from "@/components/motion/loader";
import type { RailLoanState } from "@/lib/rail-model";

const spoken: Record<RailLoanState, string> = {
  working: "agent working",
  held: "held",
  idle: "",
};

/**
 * 08 §7 · A running run is marked, not loaded. The dot matrix is the one animation
 * in the system and only ever means an agent is working this row now; every other
 * row gets a still dot in its state colour. The mark is hidden from assistive
 * technology and the state is spoken as text instead, so a rail of running loans
 * is not a rail of live regions.
 */
export function RunMark({ state }: { state: RailLoanState }) {
  return (
    <span className={`runmark runmark-${state}`}>
      <span className="runmark-glyph" aria-hidden="true">
        {state === "working" ? (
          <Loader
            variant="dot-matrix"
            size={11}
            speed={1.2}
            decorative
            className="runmark-matrix"
          />
        ) : (
          <span className="runmark-dot" />
        )}
      </span>
      {spoken[state] ? <span className="sr-only">{spoken[state]}, </span> : null}
    </span>
  );
}
