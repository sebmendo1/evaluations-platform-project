/**
 * Device preferences, carried in cookies so the server can render the correct
 * theme in the first byte.
 *
 * The earlier approach was a blocking inline script that read localStorage before
 * paint. React 19 strips a raw script rendered inside a component — wherever it
 * sits in the tree — and next/script's beforeInteractive strategy emits nothing
 * inline under Turbopack, so neither survived. A cookie needs no script at all:
 * `data-theme` is correct before the document reaches the browser, which is
 * strictly better than restoring it afterwards.
 */

import { defaultRole, isRole, type Role } from "./domain/roles";

export const THEME_COOKIE = "astro-theme";
export const ROLE_COOKIE = "astro-role";
export const RAIL_COOKIE = "astro-rail";

/** A year. These are device preferences, not sessions. */
const MAX_AGE = 60 * 60 * 24 * 365;

export type Theme = "light" | "dark";

/** 09 §11 · light is the brand expression, so it is the default. */
export const defaultTheme: Theme = "light";

export function isTheme(value: string | undefined): value is Theme {
  return value === "light" || value === "dark";
}

export function readTheme(value: string | undefined): Theme {
  return isTheme(value) ? value : defaultTheme;
}

export function readRole(value: string | undefined): Role {
  return isRole(value) ? value : defaultRole;
}

/**
 * Rail width, or `collapsed`.
 *
 * 08 §4 sets 238px as the default. The bounds keep a resized rail usable: below the
 * minimum the attempt titles stop being readable, and above the maximum the rail
 * starts competing with the centre column it exists to navigate.
 */
export const RAIL_DEFAULT = 238;
export const RAIL_MIN = 190;
export const RAIL_MAX = 360;
export const RAIL_COLLAPSED = 56;

export type RailState = { collapsed: boolean; width: number };

export function readRail(value: string | undefined): RailState {
  if (value === "collapsed") return { collapsed: true, width: RAIL_DEFAULT };
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(parsed)) return { collapsed: false, width: RAIL_DEFAULT };
  return { collapsed: false, width: clampRail(parsed) };
}

export function clampRail(width: number) {
  return Math.min(RAIL_MAX, Math.max(RAIL_MIN, Math.round(width)));
}

/** Written from the client so a choice applies without a round trip. */
export function persist(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${MAX_AGE}; samesite=lax`;
}
