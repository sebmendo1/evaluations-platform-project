"use client";

import Image from "next/image";

import { toggleRail, useCompact, useRailCollapsed, useSheetOpen } from "./rail-controls";

/**
 * The Chase mark, rendered from the supplied asset in `public/brand`.
 *
 * 09 §12 · "Official logo assets (never redrawn)" — the octagon and the wordmark are
 * registered trademarks, so this only ever renders a file. The product dropdown
 * sits beside it (`07 §Two products`); Loan Originator is the Agent hero brand.
 * This button only collapses the rail. See public/brand/README.md.
 */
export function ChaseLogo({ collapsed: initial }: { collapsed: boolean }) {
  const railCollapsed = useRailCollapsed(initial);
  const compact = useCompact();
  const sheetOpen = useSheetOpen();
  // 08 §4a · below 1024px the mark opens the rail over the page instead.
  const collapsed = compact ? !sheetOpen : railCollapsed;

  return (
    <button
      type="button"
      className="brandmark"
      onClick={toggleRail}
      aria-expanded={!collapsed}
      aria-label={collapsed ? "Expand the sidebar" : "Collapse the sidebar"}
      title={collapsed ? "Expand the sidebar" : "Collapse the sidebar"}
    >
      <Image
        src="/brand/chase-octagon.svg"
        alt=""
        width={22}
        height={22}
        priority
        className="brandmark-mark"
      />
    </button>
  );
}
