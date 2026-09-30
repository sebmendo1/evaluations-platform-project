"use client";

import { useState, type ReactNode } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Switching a view is not fetching data.
 *
 * These panels are all server-rendered on the first request, so changing tab is a
 * show/hide rather than a navigation — no round trip, no loading state, no flash of
 * something else on the way. The URL still updates through `history.replaceState`,
 * so a section stays linkable and survives a reload, which is what
 * `07 §Overview` asks for.
 *
 * Structure is shadcn Tabs (08 §5a); the pill look stays the Astro skin via
 * `.pilltab` / `data-state=active`.
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
    <Tabs value={active} onValueChange={select} className="gap-0">
      <div className="sectionnav">
        <TabsList
          variant="line"
          aria-label={label}
          className="sectionnav-tabs h-auto w-auto gap-0.5 rounded-none bg-transparent p-0"
        >
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              id={`tab-${param}-${tab.key}`}
              className="pilltab h-auto flex-none rounded-[20px] border border-transparent bg-transparent px-3 py-1.5 text-[13px] font-normal text-ink-2 after:hidden hover:bg-panel hover:text-ink data-active:border-line data-active:bg-panel-2 data-active:font-medium data-active:text-ink dark:data-active:border-line dark:data-active:bg-panel-2 dark:data-active:text-ink"
            >
              {tab.label}
              {tab.count !== undefined ? (
                <span className="pilltab-count">{tab.count}</span>
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>
        {current.action ? (
          <div className="sectionnav-actions">{current.action}</div>
        ) : null}
      </div>

      {tabs.map((tab) => (
        <TabsContent
          key={tab.key}
          value={tab.key}
          forceMount
          /* forceMount keeps every panel in the tree; hidden is the show/hide
             the old SectionTabs used — Radix alone does not set it when forced. */
          hidden={tab.key !== active}
          id={`panel-${param}-${tab.key}`}
          aria-labelledby={`tab-${param}-${tab.key}`}
          className="mt-0 outline-none"
        >
          {tab.panel}
        </TabsContent>
      ))}
    </Tabs>
  );
}
