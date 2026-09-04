"use client";

/**
 * The session's resolutions and the cases they produced.
 *
 * 02 · Contracts assigns the Resolution → Case write to a write path with a
 * non-nullable foreign key. This prototype has no backend, so the guarded
 * constructor in `domain/resolution.ts` enforces the contract and this store
 * holds the result for the session. The conformance matrix records the real write
 * path as deferred.
 *
 * Backed by localStorage and read through useSyncExternalStore, so every surface
 * sees the same set without a provider and without a setState in an effect —
 * which is what lets the queue actually reach the zero state 07 calls the design
 * target.
 */

import { useSyncExternalStore } from "react";

import type { Case, Resolution } from "../domain/resolution";

const KEY = "astro-resolutions";
const EVENT = "astro-resolutions-change";

export type ResolvedEntry = {
  resolution: Resolution;
  case: Case;
  /** Rendered summary of what the reviewer chose, for the resolved banner. */
  outcome: string;
};

type Snapshot = Record<string, ResolvedEntry>;

const EMPTY: Snapshot = {};

let cache: Snapshot | null = null;
let cacheRaw: string | null = null;

function read(): Snapshot {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw === null) return EMPTY;
  // useSyncExternalStore requires a stable reference between unchanged reads.
  if (raw === cacheRaw && cache !== null) return cache;
  try {
    cache = JSON.parse(raw) as Snapshot;
    cacheRaw = raw;
    return cache;
  } catch {
    return EMPTY;
  }
}

function write(next: Snapshot) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Nothing to do; the session simply won't remember.
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function useResolved(): Snapshot {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function useIsResolved(interruptId: string): ResolvedEntry | undefined {
  return useResolved()[interruptId];
}

export function recordResolution(entry: ResolvedEntry) {
  const current = read();
  write({ ...current, [entry.resolution.interruptId]: entry });
}

export function clearResolutions() {
  write({});
}

/** Cases written this session, newest first. Used to show the corpus growing. */
export function casesFrom(snapshot: Snapshot): Case[] {
  return Object.values(snapshot)
    .map((entry) => entry.case)
    .sort((a, b) => b.labelledAt.localeCompare(a.labelledAt));
}
