# 08 · Visual language

The Astro look. A console for judging machine work — it should read like an
instrument, not a dashboard: warm paper, hairline rules, monospace wherever a
machine produced the value, and prose that tells you what the number does *not*
prove.

Status: draft for review · Depends on: `06-metrics.md`, `09-chase-brand.md`

> **This spec yields to `09-chase-brand.md` on brand tokens.** Where the two
> disagree on hue, typeface or weight, Chase governs and this document is
> remapped. See §9. Structure, density and voice in this file are not brand
    expression and are not overridden.

Also published as a skill at `.cursor/skills/astro-design/SKILL.md`, which points
here rather than restating it.

---

## 1. Palette

Canonical set — **paper**. Prefix `--p-`.

| Token | Light | Dark | Role |
|---|---|---|---|
| `ink` | `#16171A` | `#E8E8E6` | primary text |
| `ink-2` | `#5A5C63` | `#9A9CA3` | secondary text |
| `ink-3` | `#8A8C93` | `#6C6E75` | tertiary, captions, axis |
| `paper` | `#FBFBFA` | `#0E0F11` | page ground |
| `panel` | `#F4F4F2` | `#16181B` | rail, side, user bubbles |
| `panel-2` | `#EDEDEA` | `#1D1F23` | hover |
| `line` | `#E2E2DE` | `#26282C` | hairline — the only separator |
| `line-2` | `#CFCFC9` | `#33363B` | control edge, blockquote rule |
| `accent` | `#2456C9` | `#6E9BF5` | links, selection, in-progress |
| `accent-bg` | `#EAEFFB` | `#16223B` | callouts, action boxes |
| `keep` | `#1F7A4D` | `#5BBF8C` | verdict: keep · cleared · agreed |
| `discard` | `#B4342E` | `#E8776F` | verdict: discard · failed · corrected |
| `hold` | `#A8710F` | `#D9A140` | verdict: inconclusive · waiting · held |
| `*-bg` | tinted | tinted | row and callout fills for each verdict |

Two earlier skins exist in the same skeleton and may be requested by name:
**warm** (`--` prefix, `#FCFCFB` ground, emerald accent) and **cool** (`--d-`
prefix, `#FBFBFC` ground, blue-primary). Structure, type scale and geometry are
identical across all three — a re-skin is a token remap and nothing else. If a
re-skin needs layout surgery, the component is wrong.

**Colour is state, never decoration.** Chrome is monochrome. The accent budget
goes to verdicts, diffs, and the one selected metric. Nothing else earns colour.

The verdict triad maps one-to-one onto `04 §2` verdicts and `02 · RunState`, and
must not be reused for anything else:

| Colour | Verdict | Run state | Review |
|---|---|---|---|
| `keep` | `keep` | `cleared` | agreed |
| `discard` | `discard` | `crashed` | corrected |
| `hold` | `inconclusive` | `held` | open |
| `accent` | — | `running` | — |

## 2. Type

- **Inter** (or system sans) for interface and prose.
- **JetBrains Mono** for anything a machine produced: versions, IDs, counts,
  money, percentages, file paths, log lines, axis ticks, tool names, enum labels
  like `conflicting_extraction`.

| Size / weight | Use |
|---|---|
| 20 / 500, `-0.02em` | page title |
| 16 / 500, `-0.01em` | section heading |
| 13.5 / 500 | card title |
| 13.5 / 400, lh 1.6 | conversation message |
| 13 / 400 | body, form values |
| 12.5 / 400 | table cell, impact note |
| 12 / 400 | label, crumb, link |
| 11.5 / 400 | caption, side note |
| 11 / 400 mono | eyebrow, `who` line, badge |
| 10.5 / 400 mono | log line, source citation |
| 9.5 / 400 mono | axis tick |

Never bold. 500 is the heaviest weight in the system.

**The mono rule is not stylistic.** A percentage, a sum of money, a version or an
id set in the sans face is an anti-pattern (§8) because the face is how a reader
tells a machine-produced value from a human-authored one. This applies to hero
metrics at display size, not only to table cells.

## 3. Geometry

- Radius: `4` code chips · `6` buttons, inputs · `8` opt lists, callouts ·
  `9` small cards, metric tiles · `10` table wrappers · `12` composer, message
  bubbles · `20`+ pills.
- **1px hairlines only. No shadows, no blur, no elevation — anywhere.** Depth is
  a sunken fill, never a drop shadow. Cursor’s lift is the spatial reference, not
  a licence to add a shadow — see [`design.md`](../design.md).
- A **2px left border in an accent** is the only heavier weight, and it means
  exactly one thing: *this one is selected*. Used on nav rows, KPI tiles, diff
  blocks.
- Spacing: `4 6 8 12 16 20 24 32 40 48`. Section gap 40. Body padding `28 32`.
  Metric tiles are separate rounded cards with a 12px gap, not one packed strip.
  Table cells are at least 14px vertical padding. The composer’s input is at least
  88px tall. Turn gap 36. Evidence and option rows 12–14px vertical. Primary nav
  rows in the rail are 6px vertical padding so they stay compact against Active
  loans.

## 4. Layout skeleton

```
┌────────────┬─────────────────────────────────────┐
│ rail       │ main (fluid)                           │
│ 238 default │  body 28/32, centred, max-width 880px │
│ 190–360 ⇔  │                                        │
│ 56 collapsed│                                       │
│ brand top  │                                        │
│ Active loans│                                       │
│ settings ⌄ │                                        │
└────────────┴─────────────────────────────────────┘
```

**The rail resizes and collapses.** 238px is the default, draggable between 190 and
360: below the minimum the borrower names stop being readable, above it the rail
starts competing with the column it exists to navigate. The width lives in a cookie
alongside the theme, so a resized rail is already the right width in the first byte
rather than snapping after hydration.

Clicking the brand mark collapses the rail to 56px — the mark alone, with the primary
nav as icons. It used to link home; Overview is one row below and does that, so the
click is spent on the thing only that element can do. Collapsed, the labels move to
screen-reader-only rather than being removed, so the nav is still announced while it
is only icons on screen, and the selected marker moves from the left edge to the right
so it does not sit under the icon.

The drag edge is a `separator` with arrow-key, Home and End support. A resize that
only works with a pointer is a resize half the people using this cannot reach.

- **No top bar.** An earlier revision carried a 41px bar holding the brand, the
  bundle context and a clock. It was removed: the brand belongs at the head of the
  rail, the bundle version is already a rail badge and the subject of Governance,
  and a static clock is decoration. The rail and side panel stick to the viewport
  top.
- Rail, top to bottom: the Chase mark beside the product name, primary nav, the
  labelled **Active loans** list, then a utility slot holding Settings. Batches,
  production and verification live on Overview — they are current state, not
  places. Utility sits at the foot because it is somewhere you go, not somewhere
  you work. The mark carries the brand; the label beside it is the product name,
  never a redrawn wordmark.
- **The rail holds navigation, not actions.** An earlier revision put a global
  "new attempt" button at its head. Starting an experiment is owned by the
  Experiments surface under `07 §Surface map`, so its entry point is the primary
  action of that surface. Contextual entry points elsewhere — the action box in Ask,
  the side panel's failures tab — are justified by what the reader is looking at;
  a global one is not.
- Primary buttons are filled Chase blue per `09 §6`. An action is one of the three
  things `09 §1` permits colour for, alongside the brand and a status, which is why
  it does not breach the monochrome-chrome rule in §1 above.
- **Main is centred on a fixed measure**, `--measure: 880px`, not fluid to the
  viewport. The extra width is gutter: at 880px the 690px chart viewBox still
  renders at natural size inside the body's 32px padding, and prose stays readable
  on a wide display. This is the console's answer to `09 §4`'s centred content with
  generous gutters. The previous 800 / 18 / 22 measure packed the column; Cursor's
  organisation is the reason it opened, not a reason to stretch with the viewport.
- **No side panel.** An earlier revision carried a sticky 312px right-hand panel with
  four tabs of mono `pre` blocks: the ledger, field failure rates, sampled reviews, and
  a bundle summary. All four restated content that has a fuller home elsewhere — the
  ledger is an Overview section, the failure matrix is on Experiments, sampled reviews
  are on Overview and Verify, and the bundle is the subject of Governance. It was 312px
  of persistent chrome showing a lower-fidelity copy of a click away, and `white-space:
  pre` in a fixed column clipped its own verdict labels. Removed.
  - What it uniquely held was the governance section nav, which `05 §6` requires. That
    moved into the flow as a sticky anchor nav above the sections it navigates.
  - The one detail worth salvaging was the Δ column on field failures, which says
    whether a change moved anything. It is now a column in the Experiments matrix.
- **No global composer.** Conversation lives on the Ask surface only; see
  `07 §Conversation is a surface, not an affordance`.
- Rail stacks below 820px.

**The general rule this produced:** persistent chrome must earn its width by holding
something that exists nowhere else. A panel that summarises the rest of the app
competes with it, and the summary is always the worse copy.

## 5. Component vocabulary

- **strip3 / strip2** — hero metrics as independent tiles with a 12px gap, not one
  packed strip. Three big (34px value); two small (20px) below. Each tile is a
  bordered card with 20/22 padding. Provenance stays in the same visual unit.
- **status-row** — two or three run-state tiles (not metrics): small label, mono
  value, optional caption. Used on a held file and on an Ask action proposal. Same
  geometry as the metric tiles; they must not enter the `06` dictionary.
- **callout** — tinted block, mono type label + 14.5px question, 16/18 padding.
  One per pause.
- **opts** — bordered list of resolutions: mono value, source citation,
  `Use this` on the right, 14/16 row padding. Last option is always a quiet escape
  hatch.
- **recdiff** — mono key/value rows for a record or a disagreement.
- **turn** — `who` line (mono 11) + message. User messages get a full-measure
  panel bubble (14/18 padding, radius 12); agent messages are bare. Turns
  separated by 36px of space. On Ask, the composer docks without a hairline above
  it — space does that work.
- **actbox** — accent-bordered proposal with two buttons, one filled.
- **frow** — verification field row: name, mono value, source, action pair.
  Tinted `keep-bg` when agreed, `discard-bg` when corrected.
- **ledger** — append-only table. Batches and evals in one log.
- **sectionnav** — a page title over a control row: counted pill tabs left, the
  surface's actions right. Selection is a filled pill, never a hue, so the accent
  budget stays with verdicts. Counts sit in mono beside the label.
- **crumb-menu** — the breadcrumb trail on Active loans and Experiments (`07
  §Breadcrumbs`). Each segment that has children is a disclosure: the label is the
  link, a caret opens a paper panel of the pages underneath. 1px hairline, radius 6,
  no shadow. The selected row uses the 2px left accent. Machine ids in the menu stay
  mono. One disclosure open at a time.
- **acard** — one attempt, rendered identically on the board, in the list and in
  the rail: title, one-sentence summary, the procedure steps it touches, its
  bundle, and its evidence. Restrained on purpose — an attempt is an object, not a
  status badge.
- **beforeafter** — a two-row block stating what the run used to do and what it
  does now. The "now" row is tinted `keep-bg`. This replaces a file diff wherever
  the reader is an underwriter rather than a reviewer of the artifact.
- **emptystate** — a centred icon tile, a heading, and one sentence. Every queue
  surface has one, because `00 §Design rules` makes the completion state the design
  target.
- **takeaway** — left-ruled paragraph under every chart. Mandatory.

## 6. Charts

Hand-built SVG, no library. `--line` gridlines, mono ticks, one accent per
series, values labelled directly rather than in a legend where possible.

- **Use an interval plot, not a trend line**, whenever n is small. Five runs
  gives roughly ±2 points; a line chart would draw noise as progress. Show the
  baseline band shaded and let the reader see which intervals clear it.
- Pair the lab number with the production number when both exist; the gap is
  usually the story.
- Bars: highlight the one bar that carries the argument, grey the rest.
- Chart chrome: title and muted caption sit *inside* the chart card. The plot has
  20/24 padding and enough vertical room that axes are not flush with the rule.
  The takeaway stays a sibling under the card, not a caption inside it.
- Every chart gets a `takeaway` that says what it means — and, where true, what
  it doesn't.

This section is normative over `06 §Chart selection`, which it implements.

## 7. Voice

This is the part most easily lost.

- **State the limitation next to the number.** "95.1% sampled, and only 70 fields
  reviewed so far. I wouldn't claim the production gain yet."
- **Every page that reports a metric earns a "What this doesn't tell you."**
- **Show the work.** Long-running agent work exposes a live artefact — worklog,
  diff, test report, progress count. A bare spinner is never acceptable.
  *The emphasis is on long-running.* This rule is about a run that takes forty
  minutes, not a view that takes forty milliseconds. A loading state on a fast
  navigation shows the reader something irrelevant on the way to the thing they asked
  for, which is worse than showing them the page they were already on. Switching a
  view should not ask the server at all: render the panels up front and show or hide
  them, syncing the URL without a navigation so the view stays linkable.
- **Failures stay visible.** The crash row and the discard row are the ledger's
  most useful entries. Never hide them.
- **Impact before action.** Next to any choice, say what it changes: "DTI moves
  41.2% to 41.6%. Both sit under the 43% threshold, so the outcome is unchanged."
- **Write for the reader of the surface.** An underwriter reading an attempt needs
  the step that changed and what it did to their queue; a model-risk reviewer
  reading Governance needs the artifact. File paths, diff counts, command lines and
  tool grants belong in the second place and not the first. "Gave the checker each
  obligation line so it can rebuild the payment" and "`skills/step-4.md +6 −2`"
  describe the same change to different people.
- Sentence case everywhere. Machine concepts in mono snake_case. No exclamation
  marks, no "Oops", no encouragement.
- Name the trade-off when two metrics pull against each other, and offer to block
  the verdict rather than celebrate it.

The last rule is INV-4 expressed as copy. The runner's guardrail toggle is the
component that carries it.

## 8. Anti-patterns

- A trend line through three points.
- Any shadow.
- Bold text.
- Colour used for emphasis rather than state.
- A number without its interval, or an interval without its n.
- Ranking reviewers by median resolution time — that measures the queue, not the
  person. Compare only within an interrupt type.
- Percentages, money, versions or IDs set in the sans face.
- A spinner where an artefact would fit.

## 9. Reconciliation with `09-chase-brand.md`

Astro is an **internal console**, not a customer-facing surface. Chase's density,
disclosure and imagery rules in `09 §4`, `§7` and `§10` govern public surfaces and
do not apply here; its brand tokens do. Resolved as follows:

| Dimension | This spec | `09` Chase | Resolution |
|---|---|---|---|
| Accent hue | `#2456C9` | `#117ACA` blue, `#004B87` navy | **Chase wins.** Remap `accent` to the Chase ramp. Per §1 a re-skin is a token remap. |
| Sans face | Inter or system | Open Sans (licensed brand face) | **Chase wins.** Open Sans. |
| Mono face | JetBrains Mono | PT Mono "if code appears at all" | **This spec wins.** Mono is load-bearing here, not incidental; see §2. Flagged as an open question. |
| Weight ceiling | 500, never bold | 600–700 on marketing heroes | **This spec wins for the console**, with one carve-out. Chase's heavy weights are a marketing-hero rule and the console has no hero — but the brand lockup in the rail is brand rather than chrome, so `.brandmark-name` sets at 600. It is the only 600 in the system, the guard test permits it there and nowhere else, and the weight is loaded rather than synthesised. |
| Page ground | `#FBFBFA` warm | `#FFFFFF` | Open question. The warmth is 1.5% off white and is the aesthetic's name. |
| Primary text | `#16171A` | `#211E1E` warm near-black | **Chase wins.** Both are warm near-blacks; no structural cost. |
| Dark mode | first-class peer skin | brand expression is light; "product surfaces may support it" | **Both.** Permitted by `09` for product surfaces. Light is the default. |
| Shadows | none anywhere | minimal, one soft token if used | **This spec wins**, being the stricter rule. |
| Eyebrow | mono 11, lowercase | uppercase, tracked, 600 | **This spec wins for the console.** Chase's tracked eyebrow is a marketing-hero device. |
| Case | sentence | sentence | Agree. |
| Accessibility | focus rings | skip link, focus, descriptive links | **Chase wins.** Adopt all of `09 §10`'s accessibility items. |

## 10. Acceptance criteria

- [ ] Every colour token resolves through the `--p-` set; no literal hex in a component
- [ ] No `box-shadow`, `filter: blur`, or elevation token exists in the codebase
- [ ] No computed font-weight above 500 renders anywhere
- [ ] Percentages, money, versions and ids render in the mono face at every size
- [ ] Every chart has a sibling `takeaway` element; a chart without one fails the build
- [ ] Every surface that reports a metric carries a "What this doesn't tell you"
- [ ] Loading states render an artefact — progress count, worklog or partial result — never a bare spinner
- [ ] The 2px left accent border appears only on selected elements
- [ ] A re-skin to `warm` or `cool` requires no change outside the token block
- [ ] Section gap is 40; body padding is 28/32; the measure is 880px
- [ ] Metric tiles are gapped cards, not a packed strip
- [ ] Table cells are at least 14px vertical padding
- [ ] The composer input is at least 88px tall; composer and user bubbles are radius 12

## 11. Open questions

- Mono face: JetBrains Mono, or PT Mono per `09 §3`? The Astro aesthetic is named
  for its mono; Chase names a different one. Needs a brand decision.
- Page ground: keep the warm `#FBFBFA`, or take Chase's `#FFFFFF`? This is the
  single most visible token in the system.
- Does the verdict triad clear WCAG AA against both grounds in both themes?
  `09 §2` requires AA and this has not been audited.
- ~~The 2px left accent means "selected" in §3, but diff blocks use a 2px left
  `keep` border to mean "added". Two meanings for one device — rename one.~~
  **Resolved.** The 2px left rule is now reserved for selection. Diff blocks read
  from their tint and their mono `+` or `~` marker, which they already carried.
