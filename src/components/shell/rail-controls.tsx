"use client";

import { useRef, useState, useSyncExternalStore } from "react";

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

function readWidth(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--p-rail");
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? RAIL_DEFAULT : parsed;
}

/**
 * The rail's left edge is the viewport's, so its width is wherever its right edge
 * sits. Carrying the offset from the grab point keeps that edge under the cursor
 * for the whole gesture; without it the edge snaps to the cursor on the first move,
 * jumping by however far into the handle you happened to press.
 */
export function widthFromDrag(clientX: number, grabOffset: number): number {
  return clampRail(clientX + grabOffset);
}

/** During a drag this only touches CSS; the cookie is written once on release. */
function paintWidth(width: number): number {
  const next = clampRail(width);
  document.documentElement.style.setProperty("--p-rail", `${next}px`);
  return next;
}

/**
 * 08 §4a · below 1024px the rail is a sheet (phone) or an overlay on the 56px icon
 * column (tablet). Open is a document attribute for the same reason collapsed is:
 * CSS reads it with no React state to hydrate. It is not persisted — a sheet left
 * open across a reload would cover the page the reader asked for.
 */
export const COMPACT_QUERY = "(max-width: 1023px)";

function subscribeSheet(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-sheet"],
  });
  return () => observer.disconnect();
}

export function useSheetOpen(): boolean {
  return useSyncExternalStore(
    subscribeSheet,
    () => document.documentElement.dataset.sheet === "open",
    () => false,
  );
}

export function setSheet(open: boolean) {
  const root = document.documentElement;
  if (open) root.dataset.sheet = "open";
  else delete root.dataset.sheet;
}

function subscribeCompact(onStoreChange: () => void) {
  const media = window.matchMedia(COMPACT_QUERY);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

/** True below the desktop tier. The server renders desktop and the client corrects. */
export function useCompact(): boolean {
  return useSyncExternalStore(
    subscribeCompact,
    () => window.matchMedia(COMPACT_QUERY).matches,
    () => false,
  );
}

export function toggleRail() {
  if (window.matchMedia(COMPACT_QUERY).matches) {
    setSheet(document.documentElement.dataset.sheet !== "open");
    return;
  }
  const root = document.documentElement;
  const collapsing = root.dataset.rail !== "collapsed";
  if (collapsing) {
    root.dataset.rail = "collapsed";
    persist(RAIL_COOKIE, "collapsed");
  } else {
    delete root.dataset.rail;
    persist(RAIL_COOKIE, String(readWidth()));
  }
}

/**
 * The drag edge. A `separator` with its range exposed and arrow-key, Home and End
 * support, because a resize that only works with a pointer is a resize half the
 * people using this cannot reach.
 */
export function RailHandle({
  collapsed: initialCollapsed,
  width: initialWidth,
}: {
  collapsed: boolean;
  width: number;
}) {
  const collapsed = useRailCollapsed(initialCollapsed);
  const [width, setWidth] = useState(initialWidth);
  const dragging = useRef(false);
  const grabOffset = useRef(0);

  if (collapsed) return null;

  /** Paint, remember for the accessible value, and persist. */
  function commit(next: number) {
    const applied = paintWidth(next);
    setWidth(applied);
    persist(RAIL_COOKIE, String(applied));
  }

  function endDrag() {
    if (!dragging.current) return;
    dragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    // Committing here rather than in pointerup: this fires for a cancelled
    // gesture too, and a drag that ended in a cancel used to lose the width.
    commit(readWidth());
  }

  return (
    <div
      className="rail-handle"
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize the sidebar"
      aria-valuenow={width}
      aria-valuemin={RAIL_MIN}
      aria-valuemax={RAIL_MAX}
      tabIndex={0}
      onPointerDown={(event) => {
        dragging.current = true;
        grabOffset.current = readWidth() - event.clientX;
        event.currentTarget.setPointerCapture(event.pointerId);
        // Without this the drag selects the page text, which steals the gesture.
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
        // A div only takes focus from a click implicitly; ask for it, so the arrow
        // keys work straight after a click rather than only after tabbing.
        event.currentTarget.focus();
      }}
      onPointerMove={(event) => {
        if (!dragging.current) return;
        paintWidth(widthFromDrag(event.clientX, grabOffset.current));
      }}
      onPointerUp={endDrag}
      onLostPointerCapture={endDrag}
      onKeyDown={(event) => {
        const step = event.shiftKey ? 48 : 16;
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          commit(readWidth() - step);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          commit(readWidth() + step);
        }
        if (event.key === "Home") {
          event.preventDefault();
          commit(RAIL_MIN);
        }
        if (event.key === "End") {
          event.preventDefault();
          commit(RAIL_MAX);
        }
      }}
      onDoubleClick={() => commit(RAIL_DEFAULT)}
      title="Drag to resize · double-click to reset"
    />
  );
}
