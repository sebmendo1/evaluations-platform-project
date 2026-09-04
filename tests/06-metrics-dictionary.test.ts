import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  assertContext,
  forbiddenMetrics,
  metric,
  metrics,
  type MetricId,
} from "@/lib/metrics";

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|css)$/.test(entry)) out.push(full);
  }
  return out;
}

const sources = walk("src").map((path) => ({ path, text: readFileSync(path, "utf8") }));

describe("06 · every displayed metric is defined in the dictionary", () => {
  it("each entry carries a definition", () => {
    for (const [id, def] of Object.entries(metrics)) {
      expect(def.definition, `${id} has no definition`).toBeTruthy();
      expect(def.id).toBe(id);
    }
  });

  it("throws for a metric that is not in the dictionary", () => {
    expect(() => metric("invented" as MetricId)).toThrow(/not in the dictionary/);
  });
});

describe("00 · INV-10 · production has no ground truth", () => {
  it("a graded figure cannot render in a production context", () => {
    expect(() => assertContext("graded_accuracy", "production")).toThrow(/INV-10/);
    expect(() => assertContext("interval", "production")).toThrow(/INV-10/);
  });

  it("a sampled figure cannot render in a lab context", () => {
    expect(() => assertContext("sampled_accuracy", "lab")).toThrow(/INV-10/);
  });

  it("permits the figures defined for both", () => {
    expect(() => assertContext("cost_per_run", "production")).not.toThrow();
    expect(() => assertContext("cost_per_run", "lab")).not.toThrow();
  });

  it("labels graded and sampled distinctly, since they share a word", () => {
    expect(metric("graded_accuracy").provenance).toBe("graded");
    expect(metric("sampled_accuracy").provenance).toBe("sampled");
  });

  it("requires sampled_accuracy to state its n", () => {
    expect(metric("sampled_accuracy").needsN).toBe(true);
  });
});

describe("06 §Metrics deliberately absent", () => {
  it("none of the forbidden metrics exists anywhere in the codebase", () => {
    for (const name of forbiddenMetrics) {
      const offenders = sources.filter(
        (file) =>
          // The dictionary itself names them so the omissions are legible.
          !file.path.endsWith("metrics.ts") && file.text.includes(name),
      );
      expect(offenders.map((f) => f.path), `${name} should not exist`).toEqual([]);
    }
  });

  it("no composite score is defined", () => {
    const ids = Object.keys(metrics);
    expect(ids).not.toContain("quality_score");
    expect(ids).not.toContain("confidence_score");
  });
});

describe("06 §resolution_time must never be pooled", () => {
  it("the dictionary marks it per-type only", () => {
    expect(metric("resolution_time").perTypeOnly).toBe(true);
  });

  it("the reports surface does not rank reviewers by a single median", () => {
    const reports = sources.find((f) => f.path.endsWith("reports/page.tsx"));
    expect(reports).toBeDefined();
    // A "median time" column in the reviewer table is the shape 06 forbids.
    expect(reports?.text).not.toMatch(/<th>median time<\/th>/);
  });
});

describe("08 §8 · mechanical anti-patterns", () => {
  it("no shadow, blur or elevation anywhere", () => {
    const offenders = sources.filter(
      (file) =>
        /box-shadow\s*:/.test(file.text) ||
        /filter\s*:\s*blur/.test(file.text) ||
        /backdrop-filter/.test(file.text),
    );
    expect(offenders.map((f) => f.path)).toEqual([]);
  });

  /** Every CSS rule as { selector, body }, so a weight is attributed correctly. */
  function cssRules(text: string) {
    return [...text.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
      selector: match[1].trim().split("\n").pop()?.trim() ?? "",
      body: match[2],
    }));
  }

  it("no font-weight above 500 outside the brand lockup", () => {
    // 08 §2 caps the console at 500. The one exception is `.brandtype`: a brand
    // lockup is brand rather than console chrome, and 09 §3 sets brand type at 600.
    // Recorded in 08 §9.
    const offenders: string[] = [];
    for (const file of sources) {
      for (const rule of cssRules(file.text)) {
        const weight = rule.body.match(/font-weight:\s*(\d{3})/);
        if (weight && Number(weight[1]) > 500 && rule.selector !== ".brandtype") {
          offenders.push(`${file.path} · ${rule.selector} (${weight[1]})`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("the brand lockup is the only 600, and that weight is actually loaded", () => {
    const css = sources.find((f) => f.path.endsWith("notebook.css"))?.text ?? "";
    const sixHundreds = cssRules(css)
      .filter((rule) => /font-weight:\s*600/.test(rule.body))
      .map((rule) => rule.selector);
    expect(sixHundreds).toEqual([".brandtype"]);

    // A weight that is declared but not loaded gets synthesised by the browser,
    // which looks worse than the weight below it.
    const layout = sources.find((f) => f.path.endsWith("app/layout.tsx"))?.text ?? "";
    expect(layout).toMatch(/weight:\s*\["400",\s*"500",\s*"600"\]/);
  });

  it("hero and kpi metric values set in the mono face", () => {
    const css = sources.find((f) => f.path.endsWith("notebook.css"))?.text ?? "";
    // The rule exists so a reader can tell a machine-produced value from prose.
    for (const selector of [".big .val", ".small .val", ".kpi .val"]) {
      const block = css.slice(css.indexOf(selector));
      expect(block.slice(0, 220), `${selector} should be mono`).toMatch(
        /font-family:\s*var\(--p-mono\)/,
      );
    }
  });
});
