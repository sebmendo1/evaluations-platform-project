# 08 · Visual language

> Owner: design lead. Status: **binding**. Last reviewed: 2026-04-07.
>
> This is the visual constitution. `00` is the behavioural one. Together they are
> the two documents a screen cannot contradict. Token values that are Chase-
> specific live in [`09-chase-brand.md`](09-chase-brand.md); this file is the
> grammar those tokens sit inside.

A reader should be able to tell, from a screenshot with the logo cropped out,
that this is a working surface and not a pitch. Warm paper. Ink. Rules. The
chrome of a console, the temperature of a notebook. Nothing here is decoration.

---

## 1. The two families

| Family | Face | Role |
| --- | --- | --- |
| **Editorial** | Source Serif 4 | Human-authored prose. Page titles, takeaways, the sentence under a chart, captions, empty-state copy. |
| **Numeric** | Source Code Pro | Anything a machine produced or a human typed into a field. Numbers, ids, timestamps, loan refs, bundle hashes, code, the contents of a table cell. |

Source Serif 4 is the voice. Source Code Pro is the evidence. Mixing them in one
phrase is a bug: a page title that contains a loan ref sets the ref in numeric,
the rest in editorial. A takeaway that cites a rate does the same. Never the
other way around — a number is never set in serif.

Weights: regular and medium only. Medium (`500`) is the ceiling. There is no
bold, no black, no light. Italic is reserved for captions and for the word
*sampled* when it appears next to an accuracy figure (INV-10).

---

## 2. Colour is state, never decoration

The palette is small and every value has a job.

| Token | Value | Job |
| --- | --- | --- |
| `--paper` | `#f7f4ee` | Page ground. |
| `--ink` | `#1c1917` | Body text, rules, axes. |
| `--ink-muted` | `#57534e` | Meta, captions, axis ticks, secondary labels. |
| `--rule` | `#d6d3d1` | Hairlines, table rules, plot frames. |
| `--held` | `#b45309` | Held state. The only warm accent that is not error. |
| `--clear` | `#0f766e` | Cleared, promoted, the good direction of a delta. |
| `--warn` | `#b91c1c` | Discarded, failed, mandatory, the bad direction of a delta. |
| `--info` | `#1d4ed8` | Informational callouts, in-progress, links. |

No gradient. No shadow. No opacity below `0.4` except for a plot's confidence
band, which sits at `0.18` fill against the same hue as its stroke. A colour
that does not map to a state is not on the page.

Hover and focus reuse `--ink` at reduced weight, not a new hue. Selection in a
table is a `1px` `--ink` rule on the row, not a fill.

Dark mode is out of scope for v1. The paper is the point.

---

## 3. Type scale

A short scale, tightly leaded. Pages are dense because the work is dense; padding
is not a substitute for hierarchy.

| Role | Size | Face | Leading | Tracking |
| --- | --- | --- | --- | --- |
| Display | `32 / 36` | editorial | 1.125 | `-0.02em` |
| Page title | `22 / 28` | editorial | 1.27 | `-0.015em` |
| Takeaway | `16 / 24` | editorial | 1.5 | `0` |
| Body | `14 / 22` | editorial | 1.57 | `0` |
| Label | `12 / 16` | numeric | 1.33 | `0.04em` |
| Meta | `11 / 16` | numeric | 1.45 | `0.06em` |
| Tabular | `12 / 16` | numeric | 1.33 | `0` |

Labels and meta are always uppercase, always numeric, always tracked. A label
that wraps is a label that should have been shorter.

---

## 4. Layout

### Canvas

The page is a column, `max-width: 1120px`, centred, with `24px` of side gutter
on desktop and `16px` on the phone. It does not go edge-to-edge. The paper shows
around it.

### Header

A single hairline header, `48px` tall. Left: mark, product name in editorial at
page-title size, environment chip. Right: role switcher. No search. No avatar.
No waffle. The header does not scroll away.

### Grid

Primary surfaces use a 12-column grid at `16px` gutters. The default split is
8 / 4 — the work on the left, the supporting column on the right. On the phone
the supporting column stacks below, it does not hide.

### Density

| Token | Value |
| --- | --- |
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-5` | `24px` |
| `--space-6` | `32px` |
| `--space-8` | `48px` |

Vertical rhythm is `--space-5` between sections, `--space-3` between a heading
and its body, `--space-2` between stacked rows of a table. Do not invent a
`20px` gap because a mockup had one.

### Rules, not cards

Surfaces are separated by `1px` `--rule` hairlines, not by cards-on-a-field.
There is no border-radius above `2px` (used only on the environment chip and on
focus rings). There are no drop shadows. A "card" in this product is a region
with a hairline above it and a label on the hairline.

---

## 5. Motion

Motion is rare and mechanical.

| Token | Value | Use |
| --- | --- | --- |
| `--ease` | `cubic-bezier(0.2, 0, 0, 1)` | Every transition. |
| `--duration-fast` | `120ms` | Hover, focus, tooltip. |
| `--duration` | `200ms` | Panel open, tab switch. |

No bounce. No spring. No staggered reveal of a list. Numbers that update do so
without counting up. A chart that redraws does so in one frame, it does not
morph. The one exception is the confidence band of an interval plot, which may
cross-fade at `--duration` when the underlying sample changes.

Reduced motion (`prefers-reduced-motion: reduce`) snaps every transition to
`0ms`. This is not a progressive-enhancement extra; it is a condition of the
language.

---

## 6. Charts

Charts are arguments, not decoration. Every chart on a surface answers one
question, in this order of preference:

1. Interval plot (median and 95% band) — default whenever `n` is small or the
   claim is a comparison.
2. Bar, always labelled, never a legend-only encoding.
3. Sparkline, only for a series whose `n` is large enough that a trend is the
   honest shape.

A pie, a donut, a stacked-to-100% bar, a 3-d anything: not in the language.

### Anatomy of an interval plot

- Frame is a `1px` `--rule` hairline, no fill.
- Axis ticks in meta type, `--ink-muted`.
- Median as a `2px` `--ink` stroke. Band as `--ink` at `0.18` fill, no stroke.
- Comparison series (control vs treatment, before vs after) use `--ink` at full
  and `--ink-muted` at 60% — not two hues.
- A held or failed point uses `--held` or `--warn` as the stroke, and is called
  out in the takeaway rather than by a tooltip.

Every chart carries a takeaway in editorial body, immediately under the figure,
set as a sentence, not a caption. The takeaway is the claim; the chart is the
evidence. A chart without a takeaway is unfinished.

A chart that reports a rate also reports `n` and the window, in meta type, on
the same row as the takeaway. If the rate is an accuracy figure in a production
context, the word *sampled* sits next to it in italic editorial (INV-10).

---

## 7. Tables

Tables are the densest surface in the product and the one most likely to be
restyled into a dashboard widget. They are not.

- `12px` numeric throughout the body. Editorial only in a notes column.
- Header row is meta type, uppercase, `--ink-muted`, a hairline beneath.
- Numeric columns right-aligned. Identifiers (`loan_ref`, `run_id`, bundle hash)
  left-aligned and wrapping is forbidden — they truncate with an ellipsis and
  the full value is in the `title`.
- Row height `32px`. Compact, not cramped. A row that needs two lines is a row
  that belongs on a detail surface, not in the list.
- The last column is the state chip (held / in-progress / cleared / discarded),
  not an overflow menu.
- There is no zebra striping. Hover is a `1px` `--ink` left rule, not a fill.
- Empty cells are an em-dash in `--ink-muted`, never blank, never `N/A`.

---

## 8. State chips

A closed vocabulary, drawn from [`02-domain-model.md`](02-domain-model.md).

| State | Chip |
| --- | --- |
| `in-progress` | `--ink` on `--paper`, `1px` `--rule` border |
| `held` | `--held` on `--paper`, `1px` `--held` border |
| `cleared` | `--clear` on `--paper`, `1px` `--clear` border |
| `discarded` | `--warn` on `--paper`, `1px` `--warn` border |
| `promoted` | `--clear` on `--paper`, hairline |
| `inconclusive` | `--ink-muted` on `--paper`, hairline |
| `mandatory` | `--warn` on `--paper`, `1px` `--warn` border |

Chips are `11px` meta, uppercase, tracked, `2px` padding on the y, `6px` on the
x, `2px` radius. They never contain an icon. They never use a fill darker than
the paper — the border and the type carry the state, so a colour-blind reading
still parses.

---

## 9. The environment chip

Top right of the header, adjacent to the role switcher. Three values, closed:

| Value | Treatment |
| --- | --- |
| `notebook` | `--ink` border, no fill |
| `staging` | `--held` border, `--held` type |
| `production` | `--warn` border, `--warn` type |

The production chip is the loudest object in the header on purpose. A viewer who
misses it has missed the most important fact on the page.

---

## 10. Empty, held, error

Three states that are not the happy path, each with a prescribed shape.

**Empty.** Editorial body, one sentence, no illustration. "No files in the queue."
The sentence says what would be here. It does not apologise and it does not
upsell.

**Held.** The held treatment from §8, plus the interrupt type in meta, plus the
waiting-on name if there is one. A held row is a row a person can act on; it is
never greyed out.

**Error.** `--warn` type, editorial body, the error as the agent wrote it (so:
numeric face, because the agent wrote it). No stack trace on a working surface.
The stack lives in the attempt's raw output, behind a disclosure.

---

## 11. Density over chrome

If a control does not change the number on the page, it is not on the page.
Filters that a role cannot use are absent, not disabled. Toolbars that wrap a
table of twelve rows are a smell. Pagination of a queue that fits on one screen
is a smell.

The test: print the surface in black and white. If the structure holds —
hierarchy from type, grouping from rules, state from chips — it is in language.
If it relies on a colour fill or a drop shadow to make sense, it is not.

---

## 12. What this forbids

A short list, because the failures are specific:

- Inter, Roboto, system-ui, or any geometric sans as body or display.
- A dark theme, a high-contrast theme, or a theme switcher.
- Cards with fill, radius, and shadow as the unit of layout.
- A sidebar icon rail.
- Toast notifications.
- Skeleton loaders (the page is either ready or it is held).
- Count-up number animations.
- A chart without a takeaway.
- A trend line through fewer than 30 points.
- Accuracy in a production context without the word *sampled*.
- A status chip whose colour is the only encoding.
- More than one primary action on a working surface.

---

## 13. Acceptance criteria

**AC-08.1** GIVEN any working surface WHEN it is rendered THEN the only type
families on the page are Source Serif 4 and Source Code Pro.

**AC-08.2** GIVEN a chart WHEN it is shown THEN a takeaway sentence sits
immediately under it, in editorial body.

**AC-08.3** GIVEN an accuracy figure on a production surface WHEN it is shown
THEN the word *sampled* appears next to it in italic editorial.

**AC-08.4** GIVEN `prefers-reduced-motion: reduce` WHEN any transition would
fire THEN it is `0ms`.

**AC-08.5** GIVEN a table WHEN a numeric column is rendered THEN it is
right-aligned, in numeric face, at `12px`.

**AC-08.6** GIVEN the header WHEN it is shown THEN it contains the environment
chip and no search, avatar, or waffle.

**AC-08.7** GIVEN a state chip WHEN it is shown THEN its encoding is border-plus-
type, never a filled pill.

**AC-08.8** GIVEN any surface WHEN inspected THEN there is no `box-shadow`, no
gradient, and no border-radius above `2px` except on the environment chip and
focus rings.
