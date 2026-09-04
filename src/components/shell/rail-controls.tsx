"use client";

import { useRef, useSyncExternalStore } from "react";

import {
  clampRail,
  persist,
  RAIL_COOKIE,
  RAIL_DEFAULT,
  RAIL_MAX,
  RAIL_MIN,
} from "@/lib/prefs";

/**
 * The rail's width and collapsed state live on the document, written back to a
 * cookie so the server renders the right width in the first byte. Same pattern as
 * the theme: the attribute changes immediately so the interaction is instant, and
 * the cookie is what survives a reload.
 */
function subscribe(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-rail"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): boolean {
  return document.documentElement.dataset.rail === "collapsed";
}

/**
 * The server knows the collapsed state from the cookie, and the client reads it off
 * the document — so the initial value is passed in rather than guessed. Guessing
 * `false` renders an expanded rail into a collapsed document and flips at hydration.
 */
export function useRailCollapsed(initial: boolean): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => initial);
}

function currentWidth(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--p-rail");
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? RAIL_DEFAULT : parsed;
}

function setWidth(width: number, save: boolean) {
  const next = clampRail(width);
  document.documentElement.style.setProperty("--p-rail", `${next}px`);
  if (save) persist(RAIL_COOKIE, String(next));
}

export function toggleRail() {
  const root = document.documentElement;
  const collapsing = root.dataset.rail !== "collapsed";
  if (collapsing) {
    root.dataset.rail = "collapsed";
    persist(RAIL_COOKIE, "collapsed");
  } else {
    delete root.dataset.rail;
    persist(RAIL_COOKIE, String(currentWidth()));
  }
}

/**
 * The drag edge. `role="separator"` with arrow-key support, because a resize that
 * only works with a pointer is a resize half the people using this cannot reach.
 */
export function RailHandle({ collapsed: initial }: { collapsed: boolean }) {
  const collapsed = useRailCollapsed(initial);
  const dragging = useRef(false);

  if (collapsed) return null;

  return (
    <div
      className="rail-handle"
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize the sidebar"
      aria-valuenow={undefined}
      tabIndex={0}
      onPointerDown={(event) => {
        dragging.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        document.body.style.cursor = "col-resize";
      }}
      onPointerMove={(event) => {
        if (!dragging.current) return;
        // The rail starts at the viewport edge, so the pointer's x is the width.
        setWidth(event.clientX, false);
      }}
      onPointerUp={(event) => {
        if (!dragging.current) return;
        dragging.current = false;
        event.currentTarget.releasePointerCapture(event.pointerId);
        document.body.style.cursor = "";
        setWidth(currentWidth(), true);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          setWidth(currentWidth() - 16, true);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          setWidth(currentWidth() + 16, true);
        }
        if (event.key === "Home") {
          event.preventDefault();
          setWidth(RAIL_MIN, true);
        }
        if (event.key === "End") {
          event.preventDefault();
          setWidth(RAIL_MAX, true);
        }
      }}
      onDoubleClick={() => setWidth(RAIL_DEFAULT, true)}
      title="Drag to resize · double-click to reset"
    />
  );
}
