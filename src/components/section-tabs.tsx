"use client";

import { useState, type ReactNode } from "react";

/**
 * Switching a view is not fetching data.
 *
 * These panels are all server-rendered on the first request, so changing tab is a
 * show/hide rather than a navigation — no round trip, no loading state, no flash of
 * something else on the way. The URL still updates through `history.replaceState`,
 * so a section stays linkable and survives a reload, which is what
 * `07 §Overview` asks for.
 */
export type TabPanel = {
  key: string;
  label: string;
  count?: number | string;
  panel: ReactNode;
  action?: ReactNode;
};

export function SectionTabs({
  tabs,
  initial,
  param,
  label,
}: {
  tabs: TabPanel[];
  initial: string;
  /** The search param this nav owns, e.g. `section` or `view`. */
  param: string;
  label: string;
}) {
  const [active, setActive] = useState(
    tabs.some((tab) => tab.key === initial) ? initial : tabs[0].key,
  );

  function select(key: string) {
    setActive(key);
    // Update the address bar without asking the server for anything.
    const url = new URL(window.location.href);
    if (key === tabs[0].key) url.searchParams.delete(param);
    else url.searchParams.set(param, key);
    window.history.replaceState(null, "", url);
  }

  const current = tabs.find((tab) => tab.key === active) ?? tabs[0];

  return (
    <>
      <div className="sectionnav">
        <div className="sectionnav-tabs" role="tablist" aria-label={label}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              id={`tab-${param}-${tab.key}`}
              aria-selected={active === tab.key}
              aria-controls={`panel-${param}-${tab.key}`}
              className={active === tab.key ? "pilltab on" : "pilltab"}
              onClick={() => select(tab.key)}
            >
              {tab.label}
              {tab.count !== undefined ? (
                <span className="pilltab-count">{tab.count}</span>
              ) : null}
            </button>
          ))}
        </div>
        {current.action ? (
          <div className="sectionnav-actions">{current.action}</div>
        ) : null}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.key}
          role="tabpanel"
          id={`panel-${param}-${tab.key}`}
          aria-labelledby={`tab-${param}-${tab.key}`}
          hidden={tab.key !== active}
        >
          {tab.panel}
        </div>
      ))}
    </>
  );
}
