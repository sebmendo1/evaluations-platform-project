"use client";

import Image from "next/image";

import { toggleRail, useRailCollapsed } from "./rail-controls";

/**
 * The Chase mark, rendered from the supplied asset in `public/brand`.
 *
 * 09 §12 · "Official logo assets (never redrawn)" — the octagon and the wordmark are
 * registered trademarks, so this only ever renders a file, and the label beside it is
 * the product name rather than the wordmark. See public/brand/README.md.
 *
 * Clicking it collapses the rail to the mark alone. It used to link home; Overview is
 * one row below and does that, so the click is spent on the thing only this element
 * can do.
 */
export function ChaseLogo({ collapsed: initial }: { collapsed: boolean }) {
  const collapsed = useRailCollapsed(initial);

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
        src="/brand/chase-octagon.png"
        alt=""
        width={22}
        height={22}
        priority
        className="brandmark-mark"
      />
      <span className="brandmark-name brandtype">Evaluations</span>
    </button>
  );
}
