import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|css)$/.test(entry)) out.push(full);
  }
  return out;
}

const files = walk("src").map((path) => ({ path, text: readFileSync(path, "utf8") }));
const tokens = files.find((f) => f.path.endsWith("globals.css"))?.text ?? "";
const notebook = files.find((f) => f.path.endsWith("notebook.css"))?.text ?? "";
const charts = files.filter((f) => f.path.includes("components/charts"));

describe("08 §1 · the palette resolves through the --p- token set", () => {
  it("declares the canonical tokens with the prefix", () => {
    for (const token of ["ink", "ink-2", "ink-3", "paper", "panel", "line", "accent"]) {
      expect(tokens, `--p-${token} missing`).toContain(`--p-${token}:`);
    }
  });

  it("carries the verdict triad", () => {
    for (const token of ["keep", "discard", "hold"]) {
      expect(tokens).toContain(`--p-${token}:`);
      expect(tokens).toContain(`--p-${token}-bg:`);
    }
  });

  it("defines every token in both themes", () => {
    // The dark selector also appears in @custom-variant near the top, so slice on
    // the declaration block rather than the first occurrence.
    const darkAt = tokens.indexOf('[data-theme="dark"] {');
    const light = tokens.slice(tokens.indexOf(":root {"), darkAt);
    const dark = tokens.slice(darkAt);
    for (const token of ["ink", "paper", "panel", "line", "accent", "keep", "discard", "hold"]) {
      expect(light, `light --p-${token}`).toContain(`--p-${token}:`);
      expect(dark, `dark --p-${token}`).toContain(`--p-${token}:`);
    }
  });

  it("uses no literal hex outside the token declarations", () => {
    // A component reaching for a hex bypasses the re-skin guarantee in 08 §1.
    const offenders: string[] = [];
    for (const file of files) {
      if (file.path.endsWith("globals.css")) continue;
      for (const match of file.text.matchAll(/#[0-9a-fA-F]{6}\b/g)) {
        offenders.push(`${file.path} ${match[0]}`);
      }
    }
    // #fff on a filled Chase-blue button is the one permitted literal: 09 §6
    // specifies a white label, and there is no paper-on-accent token.
    expect(offenders.filter((o) => !o.includes("#fff"))).toEqual([]);
  });
});

describe("09 §2 · Chase governs the brand tokens", () => {
  it("uses Chase blue and navy rather than the earlier indigo", () => {
    expect(tokens).toContain("#117aca");
    expect(tokens).toContain("#004b87");
    expect(tokens).not.toContain("#2456c9");
  });

  it("uses Chase's warm near-black for ink", () => {
    expect(tokens).toContain("#211e1e");
  });

  it("loads Open Sans as the sans face", () => {
    const layout = files.find((f) => f.path.endsWith("app/layout.tsx"))?.text ?? "";
    expect(layout).toContain("Open_Sans");
    expect(tokens).toContain("--font-open-sans");
  });
});

describe("08 §2 · type scale", () => {
  it("sets axis ticks at 9.5px in every chart", () => {
    // An axis tick is a gridline label: anchored, and set in the tertiary ink the
    // scale reserves for captions and axes. A highlighted data label is neither,
    // and 08 §2 allows it 12px.
    for (const chart of charts) {
      const ticks = chart.text.match(
        /anchor="(middle|end)"[^>]*fill=\{paint\.ink3\}[^>]*size=\{(\d+(\.\d+)?)\}/g,
      );
      if (!ticks) continue;
      for (const tick of ticks) {
        const size = Number(tick.match(/size=\{(\d+(\.\d+)?)\}/)?.[1]);
        expect(size, `${chart.path} tick at ${size}px`).toBeLessThanOrEqual(9.5);
      }
    }
  });
});

describe("08 §3 · geometry", () => {
  it("gives code chips a 4px radius", () => {
    const block = notebook.slice(notebook.indexOf(".tchip {"));
    expect(block.slice(0, 200)).toMatch(/border-radius:\s*4px/);
  });

  it("gives callouts and option lists an 8px radius", () => {
    for (const selector of [".callout {", ".opts {"]) {
      const block = notebook.slice(notebook.indexOf(selector));
      expect(block.slice(0, 220), selector).toMatch(/border-radius:\s*8px/);
    }
  });

  it("has no shadow, blur or elevation anywhere", () => {
    const offenders = files.filter(
      (file) =>
        /box-shadow\s*:/.test(file.text) ||
        /filter\s*:\s*blur/.test(file.text) ||
        /backdrop-filter/.test(file.text),
    );
    expect(offenders.map((f) => f.path)).toEqual([]);
  });

  it("opens the column: 880px measure, section gap 40, body 28/32", () => {
    expect(tokens).toContain("--p-measure: 880px");
    expect(tokens).toContain("--p-space-section: 40px");
    expect(tokens).toContain("--p-space-body-y: 28px");
    expect(tokens).toContain("--p-space-body-x: 32px");
  });

  it("renders metric tiles as gapped cards, not a packed strip", () => {
    const block = notebook.slice(notebook.indexOf(".strip3 {"), notebook.indexOf(".big {"));
    expect(block).toMatch(/gap:\s*12px/);
    expect(block).not.toMatch(/overflow:\s*hidden/);
    expect(block).not.toMatch(/border:\s*1px solid/);
  });

  it("gives table cells at least 14px vertical padding", () => {
    const block = notebook.slice(notebook.indexOf(".tbl td {"), notebook.indexOf(".tbl td {") + 180);
    expect(block).toMatch(/padding:\s*14px 16px/);
  });

  it("gives the composer radius 12 and an 88px-tall input", () => {
    const card = notebook.slice(
      notebook.indexOf(".composer-card {"),
      notebook.indexOf(".composer-card {") + 220,
    );
    expect(card).toMatch(/border-radius:\s*12px/);
    const input = notebook.slice(
      notebook.indexOf(".composer-input {"),
      notebook.indexOf(".composer-input {") + 280,
    );
    expect(input).toMatch(/min-height:\s*88px/);
  });

  it("keeps primary nav rows compact at 6px vertical padding", () => {
    const navAt = notebook.indexOf("\n  .nav {");
    const block = notebook.slice(navAt, navAt + 280);
    expect(block).toMatch(/padding:\s*6px 12px/);
    const collapsed = notebook.slice(
      notebook.indexOf("[data-rail=\"collapsed\"] .nav {"),
      notebook.indexOf("[data-rail=\"collapsed\"] .nav {") + 180,
    );
    expect(collapsed).toMatch(/padding:\s*6px 0/);
  });

  it("gives the crumb-menu a hairline panel and no shadow", () => {
    const at = notebook.indexOf(".crumb-menu {");
    const block = notebook.slice(at, at + 360);
    expect(block).toMatch(/border:\s*1px solid var\(--p-line\)/);
    expect(block).toMatch(/border-radius:\s*6px/);
    expect(block).not.toMatch(/box-shadow/);
  });
});

describe("08 §6 · every chart carries a takeaway", () => {
  it("ChartBlock renders a takeaway slot and each caller supplies one", () => {
    const blocks = files.find((f) => f.path.endsWith("components/blocks.tsx"))?.text ?? "";
    expect(blocks).toContain("takeaway");

    for (const page of ["experiments/page.tsx", "reports/page.tsx"]) {
      const text = files.find((f) => f.path.endsWith(page))?.text ?? "";
      const chartBlocks = (text.match(/<ChartBlock/g) ?? []).length;
      const takeaways = (text.match(/takeaway=/g) ?? []).length;
      expect(takeaways, `${page} has ${chartBlocks} charts`).toBe(chartBlocks);
    }
  });
});

describe("08 §7 · every surface reporting a metric says what it doesn't tell you", () => {
  const surfaces = [
    "app/page.tsx",
    "app/reports/page.tsx",
    "app/verify/page.tsx",
    "app/experiments/page.tsx",
  ];

  it("carries the caveat on each", () => {
    for (const surface of surfaces) {
      const text = files.find((f) => f.path.endsWith(surface))?.text ?? "";
      expect(text, `${surface} needs a "what this doesn't tell you"`).toMatch(
        /doesn’t tell you|doesn't tell you/,
      );
    }
  });
});

describe("09 §10 · accessibility floor applies to internal builds too", () => {
  const layout = files.find((f) => f.path.endsWith("app/layout.tsx"))?.text ?? "";

  it("has a skip link pointing at a main landmark", () => {
    expect(layout).toContain("skip-link");
    expect(layout).toContain('href="#main"');
    expect(layout).toMatch(/<main[^>]*id="main"/);
  });
});

describe("08 §7 · loading states show an artefact, never a spinner", () => {
  const loadingFiles = files.filter((f) => /app\/.*loading\.tsx$/.test(f.path));

  it("does not put a loading state on a fast navigation", () => {
    // 08 §7 is about long-running agent work exposing an artefact. Every route here
    // reads local data, so a route-level loading state only ever flashed irrelevant
    // content on the way to content — worse than showing the previous page.
    expect(loadingFiles.map((f) => f.path)).toEqual([]);
  });

  it("keeps the artefact component for work that is genuinely slow", () => {
    const artefact = files.find((f) => f.path.endsWith("loading-artefact.tsx"));
    expect(artefact, "the component stays available").toBeDefined();
    expect(artefact?.text).toContain("worklog");
  });

  it("switches a view without asking the server, so nothing can flash", () => {
    const tabs = files.find((f) => f.path.endsWith("section-tabs.tsx"))?.text ?? "";
    // Panels are rendered up front and shown or hidden; the URL is synced without a
    // navigation.
    expect(tabs).toContain("history.replaceState");
    expect(tabs).toMatch(/hidden=\{tab\.key !== active\}/);
    expect(tabs).not.toContain("router.push");
  });

  it("no CSS animation or keyframes exists anywhere — nothing spins", () => {
    const offenders = files.filter((file) => {
      if (/@keyframes/.test(file.text)) return true;
      // `animation: none` in the reduced-motion block is the opposite of a spinner.
      const declarations = file.text.match(/\banimation\s*:\s*[^;]+/g) ?? [];
      return declarations.some((d) => !/:\s*none/.test(d));
    });
    expect(offenders.map((f) => f.path)).toEqual([]);
  });

  it("the artefact component renders no placeholder bars", () => {
    const artefact =
      files.find((f) => f.path.endsWith("loading-artefact.tsx"))?.text ?? "";
    expect(artefact).toContain("worklog");
    // Strip comments first: the file quotes the spec's own "a bare spinner is
    // never acceptable", which is a statement of the rule rather than a breach.
    const code = artefact.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    expect(code).not.toMatch(/skeleton|shimmer|pulse|spin/i);
  });
});
