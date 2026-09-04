---
name: astro-design
description: >
  The Astro visual language — a warm-paper, mono-heavy console aesthetic for
  agent-evaluation and underwriting-review interfaces. Use when designing or
  building any Astro screen (overview, batch, file, attempt, verify, experiments,
  governance, reports), when adding a component to an existing Astro board, when
  choosing colours/type/spacing for this product, or when writing the copy that
  sits next to a number or a chart. Also use when asked for "the Astro look",
  "the paper aesthetic", or to restyle something into this system.
---

# Astro design

A console for judging machine work. It should read like an instrument, not a
dashboard: warm paper, hairline rules, monospace wherever a machine produced the
value, and prose that tells you what the number does *not* prove.

**The full spec is [`specs/08-visual-language.md`](../../../specs/08-visual-language.md).**
Read it before building a screen. Brand tokens are governed by
[`specs/09-chase-brand.md`](../../../specs/09-chase-brand.md), which wins on hue,
typeface and accessibility — see `08 §9` for the resolved table.

Implementation lives in [`src/app/globals.css`](../../../src/app/globals.css)
(tokens) and [`src/app/notebook.css`](../../../src/app/notebook.css) (structure).

## The rules that change what gets built

These are the ones worth loading into working memory. Everything else is in `08`.

1. **Interval plot, never a trend line, whenever n is small.** Five runs gives
   roughly ±2 points; a line chart draws noise as progress. Shade the baseline
   band and let the reader see which intervals clear it. This is a spec decision
   with history — the original overview led with a rising line over three
   statistically indistinguishable runs.
2. **Monospace for anything a machine produced** — versions, ids, counts, money,
   percentages, paths, axis ticks, enum labels like `conflicting_extraction`. At
   every size, including hero metrics. The face is how a reader tells a
   machine-produced value from a human-authored one.
3. **Never bold.** 500 is the heaviest weight in the system.
4. **No shadows, no blur, no elevation, anywhere.** 1px hairlines only. Depth is a
   sunken fill.
5. **Colour is state, never decoration.** Chrome is monochrome. The accent budget
   goes to verdicts, diffs, and the one selected metric. The verdict triad is
   `keep` / `discard` / `hold` and maps one-to-one onto `04 §2` verdicts and
   `02 · RunState`.
6. **A 2px left accent border means "selected".** It is the only heavier weight
   and it has exactly one meaning.
7. **Every chart carries a takeaway** in prose beneath it, stating what it means
   and, where true, what it doesn't.
8. **Every page reporting a metric earns a "What this doesn't tell you."**
9. **Impact before action.** Next to any choice, say what it changes: "DTI moves
   41.2% to 41.6%. Both sit under the 43% threshold, so the outcome is unchanged."
10. **Show the work.** Long-running work exposes a live artefact — worklog, diff,
    progress count. A bare spinner is never acceptable.
11. **Failures stay visible.** The crash row and the discard row are the ledger's
    most useful entries.
12. **Never rank reviewers by median resolution time.** It varies by an order of
    magnitude across interrupt types, so it measures the queue rather than the
    person. Compare only within a type.

## Layout skeleton

```
rail 238 default (190–360, 56 collapsed)
main — body 28/32, centred, max-width 880px
no top bar · no side panel · no global composer
rail stacks below 820px
```

The previous 800 / 18 / 22 measure packed the column. Spacing, not elevation, is
what opened it — see [`design.md`](../../../design.md) and `08 §3`.

## Voice

Sentence case everywhere. Machine concepts in mono snake_case. No exclamation
marks, no "Oops", no encouragement. Name the trade-off when two metrics pull
against each other, and offer to block the verdict rather than celebrate it.

## Anti-patterns

A trend line through three points · any shadow · bold text · colour for emphasis
rather than state · a number without its interval or an interval without its n ·
ranking reviewers by pooled resolution time · percentages, money, versions or ids
in the sans face · a spinner where an artefact would fit.
