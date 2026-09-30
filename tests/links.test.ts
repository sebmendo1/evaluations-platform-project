import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { attempts } from "@/lib/data/attempts";
import { batches } from "@/lib/data/batches";
import { experimentRows, ledger } from "@/lib/data/experiments";

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(name) ? [path] : [];
  });
}

const sources = sourceFiles("src").map((path) => ({
  path,
  text: readFileSync(path, "utf8"),
}));

const attemptSlugs = new Set(attempts.map((attempt) => attempt.slug));
const batchIds = new Set(batches.map((batch) => batch.id));

/**
 * A hand-written href to a dynamic route is a string that the type system cannot
 * check, so a slug rename leaves a dead link behind that nothing complains about
 * until someone clicks it. Four of these survived the rename of the attempt slugs
 * out of coding language and into loan-origination language.
 */
describe("every hand-written link to a dynamic route resolves", () => {
  it("links only to attempt slugs that exist", () => {
    const dead: string[] = [];
    for (const { path, text } of sources) {
      for (const [, slug] of text.matchAll(/["`]\/attempts\/([a-z0-9-]+)/g)) {
        if (!attemptSlugs.has(slug)) dead.push(`${path}: /attempts/${slug}`);
      }
    }
    expect(dead).toEqual([]);
  });

  it("links only to batches that exist", () => {
    const dead: string[] = [];
    for (const { path, text } of sources) {
      for (const [, id] of text.matchAll(/["`]\/batches\/([a-z0-9-]+)/g)) {
        if (!batchIds.has(id)) dead.push(`${path}: /batches/${id}`);
      }
    }
    expect(dead).toEqual([]);
  });

  it("gives every ledger and experiment row that claims an attempt a resolvable one", () => {
    // These are the surfaces that link out most, and 04 treats each entry as
    // traceable to the change it recorded.
    const hrefs = [...ledger, ...experimentRows]
      .map((row) => row.href)
      .filter((href): href is string => Boolean(href?.startsWith("/attempts/")));

    expect(hrefs.length).toBeGreaterThan(0);
    expect(
      hrefs.filter((href) => !attemptSlugs.has(href.replace("/attempts/", ""))),
    ).toEqual([]);
  });
});

describe("the attempt slugs stay in loan-origination language", () => {
  it("names no model, and no bare step number", () => {
    // The rename existed to stop the rail reading like a coding agent's task list.
    const offenders = [...attemptSlugs].filter((slug) =>
      /(opus|sonnet|gpt|claude|model-\d|step-\d)/.test(slug),
    );
    expect(offenders).toEqual([]);
  });
});
