import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { widthFromDrag } from "@/components/shell/rail-controls";
import {
  clampRail,
  RAIL_DEFAULT,
  RAIL_MAX,
  RAIL_MIN,
  readRail,
} from "@/lib/prefs";

const controls = readFileSync("src/components/shell/rail-controls.tsx", "utf8");
const css = readFileSync("src/app/notebook.css", "utf8");

describe("rail width round-trips through the cookie", () => {
  it("reads a saved width back unchanged", () => {
    expect(readRail("300")).toEqual({ collapsed: false, width: 300 });
  });

  it("clamps a width outside the usable range rather than trusting it", () => {
    // Below the minimum the attempt titles stop being readable; above the maximum
    // the rail competes with the column it exists to navigate.
    expect(readRail("9999").width).toBe(RAIL_MAX);
    expect(readRail("10").width).toBe(RAIL_MIN);
    expect(clampRail(0)).toBe(RAIL_MIN);
    expect(clampRail(10_000)).toBe(RAIL_MAX);
  });

  it("falls back to the default on a missing or malformed cookie", () => {
    expect(readRail(undefined)).toEqual({ collapsed: false, width: RAIL_DEFAULT });
    expect(readRail("banana")).toEqual({ collapsed: false, width: RAIL_DEFAULT });
  });

  it("reads the collapsed sentinel without losing the default width", () => {
    expect(readRail("collapsed")).toEqual({ collapsed: true, width: RAIL_DEFAULT });
  });
});

describe("a drag moves the edge by how far the cursor moved", () => {
  // The handle is 10px, so where inside it you press decides the offset. Reading
  // clientX as the width outright made the edge snap to the cursor on the first
  // move, jumping by up to the width of the handle before tracking anything.
  it("keeps the edge under the cursor from wherever it was grabbed", () => {
    // Rail 238 wide, pressed 6px in from its edge: offset is +6 for the gesture.
    const grabOffset = 238 - 232;
    expect(widthFromDrag(232, grabOffset)).toBe(238);
    expect(widthFromDrag(232 + 80, grabOffset)).toBe(318);
    expect(widthFromDrag(232 - 40, grabOffset)).toBe(198);
  });

  it("moves left as readily as right", () => {
    // A leftward drag reported ending wider than it started, so this is explicit.
    const start = widthFromDrag(300, 0);
    expect(widthFromDrag(240, 0)).toBeLessThan(start);
  });

  it("does not move the edge at all when the cursor does not", () => {
    for (const offset of [0, 4, 9, -3]) {
      expect(widthFromDrag(300 - offset, offset)).toBe(300);
    }
  });

  it("stays inside the usable range however far the cursor goes", () => {
    expect(widthFromDrag(4000, 0)).toBe(RAIL_MAX);
    expect(widthFromDrag(-500, 0)).toBe(RAIL_MIN);
  });
});

/**
 * These three lock in the fixes behind the drag-persistence bug. A pointer drag is
 * the one interaction a browser agent could not reliably simulate here, so the
 * behaviour is asserted structurally instead of left resting on the keyboard path
 * happening to share a helper.
 */
describe("the drag commits, and cannot be stolen by a text selection", () => {
  it("commits on lostpointercapture, not only on pointerup", () => {
    // pointerup alone was the bug: a gesture interrupted by a text selection never
    // fired it, so a resize that looked fine was silently never saved.
    expect(controls).toContain("onLostPointerCapture={endDrag}");
    expect(controls).toContain("onPointerUp={endDrag}");
    expect(controls).toMatch(/function endDrag\(\)[\s\S]*?persist|function endDrag\(\)[\s\S]*?commit\(/);
  });

  it("suppresses selection for the duration of the drag and restores it after", () => {
    expect(controls).toMatch(/document\.body\.style\.userSelect = "none"/);
    expect(controls).toMatch(/document\.body\.style\.userSelect = ""/);
    expect(css).toMatch(/\.rail-handle \{[^}]*user-select: none/);
  });

  it("takes focus on pointerdown so the arrow keys work after a click", () => {
    expect(controls).toMatch(/event\.currentTarget\.focus\(\)/);
  });

  it("gives the pointer a target big enough to hit, inside the rail's clip", () => {
    // The handle was 5px hung at right: -2px inside a rail that hides its overflow,
    // so 2px were clipped away and the pointer landed on the text behind the 3px
    // that survived. Keyboard resize still worked, which is what hid it.
    const rail = css.match(/\n {2}\.rail \{([^}]*)\}/)?.[1] ?? "";
    const handle = css.match(/\n {2}\.rail-handle \{([^}]*)\}/)?.[1] ?? "";
    expect(handle).not.toBe("");

    const width = Number(handle.match(/width: (\d+)px/)?.[1]);
    expect(width).toBeGreaterThanOrEqual(8);

    // Any negative inline-end offset is clipped while the rail hides overflow.
    if (/overflow: hidden/.test(rail)) {
      expect(handle).not.toMatch(/right: -/);
    }
  });

  it("marks :focus and not only :focus-visible, so a click shows the handle is live", () => {
    // :focus-visible never matches a mouse click, which is why the focused handle
    // looked inert.
    expect(css).toMatch(/\.rail-handle:focus::after/);
  });
});

/**
 * Every preference is written by the client but read by the server, so the first
 * byte already carries the right theme and rail. That is what removes the flash an
 * inline script would have caused, and it only holds while the root layout keeps
 * reading the jar.
 */
describe("preferences resolve server-side, in the first byte", () => {
  const layout = readFileSync("src/app/layout.tsx", "utf8");

  it("reads all three cookies out of the request", () => {
    expect(layout).toContain("await cookies()");
    for (const cookie of ["THEME_COOKIE", "ROLE_COOKIE", "RAIL_COOKIE"]) {
      expect(layout, cookie).toContain(`jar.get(${cookie})?.value`);
    }
  });

  it("paints them onto the document element rather than waiting for hydration", () => {
    expect(layout).toContain("data-theme={theme}");
    expect(layout).toContain("data-role={role}");
    expect(layout).toContain('data-rail={rail_\.collapsed ? "collapsed" : undefined}');
    expect(layout).toMatch(/"--p-rail": `\$\{rail_\.width\}px`/);
  });

  it("hands the server's view of the rail to the components that could disagree", () => {
    // Without this the collapsed rail hydrates from a client guess and the brand
    // mark reports the wrong aria-expanded.
    expect(layout).toMatch(/<Rail[^>]*collapsed=\{rail_\.collapsed\}[^>]*width=\{rail_\.width\}/);
  });
});

describe("the resize is reachable without a pointer", () => {
  it("exposes its range as a separator", () => {
    for (const attr of [
      'role="separator"',
      'aria-orientation="vertical"',
      "aria-valuenow={width}",
      "aria-valuemin={RAIL_MIN}",
      "aria-valuemax={RAIL_MAX}",
    ]) {
      expect(controls, attr).toContain(attr);
    }
  });

  it("handles both arrows, Home, End and a larger shifted step", () => {
    for (const key of ["ArrowLeft", "ArrowRight", "Home", "End"]) {
      expect(controls, key).toContain(`"${key}"`);
    }
    expect(controls).toMatch(/event\.shiftKey \?/);
  });

  it("has no drag edge to focus when the rail is collapsed", () => {
    expect(controls).toMatch(/if \(collapsed\) return null;/);
  });
});
