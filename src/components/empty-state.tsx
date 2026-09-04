import type { ReactNode } from "react";

/**
 * The zero state. 00 §Design rules — "The queue is an inbox with a completion
 * state, not a monitor. If a screen has no zero state, it is the wrong screen."
 */
export function EmptyState({
  icon,
  heading,
  children,
  action,
  tone = "neutral",
}: {
  icon: ReactNode;
  heading: string;
  children: ReactNode;
  action?: ReactNode;
  tone?: "neutral" | "keep";
}) {
  return (
    <div className="emptystate">
      <span className={tone === "keep" ? "emptystate-tile keep" : "emptystate-tile"}>
        {icon}
      </span>
      <p className="emptystate-heading">{heading}</p>
      <p className="emptystate-body">{children}</p>
      {action ? <div className="emptystate-action">{action}</div> : null}
    </div>
  );
}
