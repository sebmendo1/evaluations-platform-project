# Cursor → Astro: spatial language

Inspiration, not a spec. Binding geometry lives in [`specs/08-visual-language.md`](specs/08-visual-language.md). This file is the translation so a spacing decision does not get reinvented in CSS.

Astro stays the instrument: warm paper, 1px hairlines, monospace for anything a machine produced, weight ceiling 500, colour as state. Cursor is the spatial reference — how that instrument is *arranged*.

---

## 1. What we are copying

Cursor’s web app is easy to use because it is **uncompressed**. Independent tiles, tall table rows, a hero composer, and a thread that uses space instead of rules to separate turns. The product still reads as one column of work.

We copy that organisation. We do not copy the product, the type ramp, or the elevation.

Local screenshots: [`docs/cursor-ref/`](docs/cursor-ref/).

---

## 2. Layout skeleton

Astro keeps:

```
rail (238 default, 190–360, 56 collapsed)
main — body 28/32, centred, max-width 880px
no top bar · no side inspector · no global composer
rail stacks below 820px
```

Cursor’s three-pane agent view (history · thread · diff) maps to surfaces we already have, not a new pane:

- **Rail** = Cursor’s left history (nav + Active loans). Selected state is still the 2px left accent, not fill-only.
- **Main column** = Cursor’s centre thread. One measure, generous gutters.
- **File transcript** = the paused turn. Evidence and options *are* the work; they do not move to a right inspector.

Conversation still lives only on Ask (`07 §Conversation is a surface, not an affordance`).

---

## 3. Spacing scale

Cursor’s air, expressed in Astro’s hairline system:

```
4  6  8  12  16  20  24  32  40  48
```

| Token | Before | After | Why |
|---|---|---|---|
| Body padding | 18 / 22 | 28 / 32 | Page ground has to show around the column |
| Measure | 800px | 880px | Extra is gutter. Charts stay a 690 viewBox |
| Section gap | 26 | 40 | A chart and the next chart must not collide |
| Nav / rail row | 7 / 14 | 10 / 14 | History items need a finger-sized hit |
| Table `th` / `td` | 8 / 7 × 12 | 12 / 14 × 16 | Scan a loan row without crowding |
| Metric tile | packed strip, 11–16 pad | gapped cards, 20 / 22 | Cursor’s automations KPIs |
| Chart wrap | 14 / 16 | 20 / 24 | Title lives *inside* the card |
| Composer | radius 10, min-height 52 | radius 12, min-height 88 | The input is the hero |
| Chat turn gap | 26 | 36 | Space, not a hairline, separates turns |
| User bubble | 10 / 13, inline chip | 14 / 18, full measure | Cursor’s prompt block |
| Suggestion pills | 5 / 12, gap 6 | 8 / 14, gap 10 | Same weight as the composer they sit under |
| Evidence / option rows | 8–10 vertical | 12–14 | Thirty-second answers need room to pick |

Tokens: `--p-measure`, `--p-space-section`, `--p-space-body-y`, `--p-space-body-x`.

---

## 4. Component recipes

### Composer

**Cursor:** large rounded field; placeholder at the top; model / tools on a toolbar *inside* the same card; circular send.

**Astro:** already this shape on Ask. Make it spatial: min-height 88, padding `16 18 12`, radius 12. Send stays Chase-blue filled (`09 §6`). No shadow on focus — the border turns accent.

Empty state: centred hero, pills underneath. Thread: sticky dock, separated by space, not a top hairline.

### User / agent turns

**Cursor:** user prompt is a wide panel fill; agent reply is bare structured prose; `who` is receded.

**Astro:** `.msg.u` is a full-measure panel (not an inline chip). Agent turns stay bare. `who` stays mono 11. Paragraphs in a reply get `1em` between them.

When Ask is in `act` and proposes work, a **status-card row** sits above the confirmation: scope · estimated cost · mode. Same anatomy as Cursor’s three model cards. These are run state, not metrics — they do not go through `<Metric>`.

### Status-card row

Three (or two) independent tiles with a 12px gap. Small grey label, mono value, optional caption. Used on:

- Ask, when an action is proposed
- A held file: `held` · interrupt type · wait

### Metric tiles

**Before:** `.strip3` is one bordered box with internal dividers.

**After:** three (or two) separate rounded tiles with a 12px gap — Cursor’s automations / usage KPIs. Same five Overview metrics. Provenance stays in the same visual unit (`06`).

Selection, where it applies, is still the 2px left accent.

### Chart block

**Cursor Usage:** title and muted subtitle *inside* the card; plot has room; legend is quiet; a table below has tall rows.

**Astro:** title + caption move inside `.chartwrap`. Plot padding and SVG `TOP`/`BOTTOM` increase. Takeaway stays a sibling under the card (`08 §6`). “What this doesn’t tell you” stays on the page.

Do **not** restyle a small-n series as a stacked area. Ten batches is still small-n. Deploy markers get more room, not a trend fill.

### Tables

Headers in ink-3, smaller than the data. No vertical rules. Row padding 14 / 16. Primary identifier in ink (mono); secondary in ink-2. Hover is a panel fill.

Applies to the held queue, batch files, ledger, other-held list.

### Rail

Looser vertical padding. Selected = panel fill **and** the 2px left accent. Collapsed rail keeps the accent on the right so it does not sit under the icon.

### Suggestion pills

Radius 20+, padding `8 14`, gap 10. Hairline, paper fill, ink-2 label. Hover darkens the edge, not the fill.

---

## 5. Anti-copy list

Cursor does these. Astro must not:

| Cursor | Why we refuse |
|---|---|
| Drop shadow on the composer and cards | `08 §3` — depth is a sunken fill. Guard test fails on `box-shadow` |
| Bold / 600–700 headings | `08 §2` — 500 is the ceiling (brand lockup excepted) |
| Colour as decoration (green sparkline, purple “Merged”) | Colour is state: keep / discard / hold / accent |
| Stacked area / trend through a handful of points | `08 §6` — interval plot whenever n is small |
| Composer on every surface | `07` — conversation is a surface, not an affordance |
| Sans face on spend, tokens, versions | Mono is how a reader tells a machine value from prose |
| Cold `#FFFFFF` SaaS ground | Paper stays warm until `08 §11` is decided |

If a screenshot still feels flat after the new scale, increase the section gap. Do not reach for elevation.

---

## 6. Surface map

| Astro surface | Cursor pattern | Mobbin |
|---|---|---|
| Ask empty state | Centred hero composer, pills underneath | [Chatting with an agent](https://mobbin.com/flows/de3904e0-f2db-4e6c-81db-e91d90483f80) |
| Ask thread | Status-card row + wide user bubble + structured reply + sticky follow-up | [Adding a follow up](https://mobbin.com/flows/2d3132be-9237-4270-b1d9-1ffaa68362ee), [agent thread](https://mobbin.com/screens/924cf1be-b47e-4957-8ac7-426c93ee8835), [`cursor-chat.png`](docs/cursor-ref/cursor-chat.png) |
| File / interrupt | Kicker → status tiles → callout → evidence block → options → impact | Same thread rhythm; the payload *is* the work |
| Overview | Independent KPI tiles + taller queue / ledger rows | [Automations](https://mobbin.com/screens/a0c4fe6f-8487-445f-b625-8159c82b9b98), [`cursor-automations.png`](docs/cursor-ref/cursor-automations.png) |
| Reports | Chart card with title inside, more plot padding, airy KPI row | [Usage](https://mobbin.com/screens/d1ae9c6c-1e3f-4810-9d6b-e042a0fc1d0f), [`cursor-usage.png`](docs/cursor-ref/cursor-usage.png) |
| Batch | Filter chips + taller file table | [Run history](https://mobbin.com/screens/3e49c061-8dc4-4c1e-bb8e-3e4d3162e9fd) |
| Rail | Selected fill + looser nav padding | Keep the 2px left accent — that meaning is ours |

---

## 7. File / interrupt rhythm

A held file is a paused agent turn. The page should scan like Cursor’s thread, not like a dense form:

```
crumb
kicker     loanRef + step
status     held · interrupt type · wait
callout    the question (one per pause)
evidence   panel header + mono values  (“the code block”)
opts       taller rows, last option a quiet hatch
impact     what the choice changes, then the action
other held taller list, not a dense strip
```

Status tiles are run state. They must not enter the metrics dictionary.
