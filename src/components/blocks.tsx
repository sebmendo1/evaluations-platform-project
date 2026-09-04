import type { ReactNode } from "react";
import Link from "next/link";

export type Kpi = { lab: string; val: string; sub: string };

export function Turn({
  who,
  first,
  children,
}: {
  who: string;
  first?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="turn" style={first ? { marginTop: 0 } : undefined}>
      <div className="who">{who}</div>
      {children}
    </div>
  );
}

export function ActionBox({
  children,
  buttons,
}: {
  children: ReactNode;
  buttons: { label: string; href?: string; primary?: boolean }[];
}) {
  return (
    <div className="actbox">
      <div className="t">{children}</div>
      <div className="r">
        {buttons.map((button) =>
          button.href ? (
            <Link
              key={button.label}
              href={button.href}
              className={button.primary ? "y" : undefined}
            >
              {button.label}
            </Link>
          ) : (
            <button
              key={button.label}
              type="button"
              className={button.primary ? "y" : undefined}
            >
              {button.label}
            </button>
          ),
        )}
      </div>
    </div>
  );
}

export function KpiGrid({ items }: { items: Kpi[] }) {
  return (
    <div className="kpis">
      {items.map((item) => (
        <div className="kpi" key={item.lab}>
          <div className="lab">{item.lab}</div>
          <div className="val mono">{item.val}</div>
          <div className="sub">{item.sub}</div>
        </div>
      ))}
    </div>
  );
}

export function StatusRow({
  items,
}: {
  items: { lab: string; val: string; sub?: string }[];
}) {
  return (
    <div className="status-row">
      {items.map((item) => (
        <div className="status-card" key={item.lab}>
          <div className="lab">{item.lab}</div>
          <div className="val mono">{item.val}</div>
          {item.sub ? <div className="sub">{item.sub}</div> : null}
        </div>
      ))}
    </div>
  );
}

export function ChartBlock({
  title,
  caption,
  keys,
  takeaway,
  children,
}: {
  title: string;
  caption: string;
  keys?: { color: string; label: string }[];
  takeaway?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="sec">
      <div className="chartwrap">
        <div className="chead">
          <h3>{title}</h3>
          <span className="cs">{caption}</span>
        </div>
        {children}
        {keys ? (
          <div className="ckey">
            {keys.map((key) => (
              <span key={key.label}>
                <span className="dot" style={{ background: key.color }} />
                {key.label}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      {takeaway ? <p className="takeaway">{takeaway}</p> : null}
    </div>
  );
}
