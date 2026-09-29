# Cursor → Astro: design language

Inspiration, not a binding spec. Geometry, type scale and voice live in
[`specs/08-visual-language.md`](specs/08-visual-language.md). Brand hue, typeface
and accessibility live in [`specs/09-chase-brand.md`](specs/09-chase-brand.md).
This file is the translation so a Cursor-shaped decision does not get reinvented
in CSS — and so the extracted Cursor system is remapped onto Chase before it
touches a token.

Astro stays the instrument: warm paper, 1px hairlines, Open Sans + JetBrains Mono,
weight ceiling 500, colour as state, Chase blue for identity and action. Cursor is
the spatial reference — how that instrument is *arranged*.

Local screenshots: [`docs/cursor-ref/`](docs/cursor-ref/).

---

## 0. Extracted → Chase token map

The attached Cursor design-system extract used a warm charcoal / gold / orange
palette and CursorGothic. Those values do **not** enter the product. Chase wins
on hue and typeface (`08 §9`); Astro wins on shadows, weight ceiling, and colour
discipline.

### Color

| Extracted role | Extracted value | Astro / Chase token | Value | Notes |
|---|---|---|---|---|
| Primary CTA / brand / body | `#26251E` | `--p-accent` (CTA, links, selected) · `--p-ink` (body) | `#117ACA` · `#211E1E` | Split: blue does identity work; ink does text. Never charcoal for CTAs. |
| Secondary / hero band | `#C08532` | — | — | **Dropped.** Second hue family. `09 §2` / `09 §11`. |
| Decorative accent | `#F54E00` | — | — | **Dropped.** Colour is state, never decoration. |
| Canvas | `#F7F7F4` | `--p-paper` | `#FBFBFA` | Warm paper kept; Chase `#FFFFFF` is an open question in `08 §11`. |
| Ink / max contrast | `#000000` | `--p-ink` | `#211E1E` | Chase warm near-black (`09 §2`). |
| On primary | `#FFFFFF` | white on filled CTA | `#FFFFFF` | Permitted literal on Chase-blue buttons (`09 §6`). |
| Neutral divider 1 | `#E6E5E0` | `--p-line` | `#E2E2DE` | Hairline only. |
| Neutral divider 2 | `#EDECEC` | `--p-panel-2` | `#EDEDEA` | Hover / surface modulation. |
| Card surface | `#F2F1ED` | `--p-panel` | `#F4F4F2` | Sunken fill, not elevation. |

Chase ramp used in code (`src/app/globals.css`):

```
--p-accent          #117ACA    Chase blue — primary action, links, selection
--p-accent-strong   #004B87    Chase navy — hover on primary, weight
--p-accent-bg       #E8F1FA    tint wash for callouts / info
--p-ink             #211E1E    primary text
--p-ink-2           #5A5C63    secondary text
--p-ink-3           #8A8C93    tertiary, captions, axis
--p-paper           #FBFBFA    page ground
--p-panel           #F4F4F2    rail, side, user bubbles
--p-panel-2         #EDEDEA    hover
--p-line            #E2E2DE    hairline
--p-line-2          #CFCFC9    control edge
--p-keep / discard / hold      verdict triad only (status, not brand)
```

### Typography

| Extracted face | Role in extract | Astro / Chase face | Notes |
|---|---|---|---|
| CursorGothic | Headings, branded body, buttons | **Open Sans** | `09 §3`. Loaded as `--font-open-sans`. |
| system-ui | Labels, captions, small UI | **Open Sans** | Console keeps one sans; OS-native split is marketing, not Astro. |
| berkeleyMono | Code / technical | **JetBrains Mono** | `08 §2` wins over PT Mono; open question in `09 §13`. |
| EB Garamond / Lato | Supplementary, unused | — | Omitted. No serif headline face (`09 §11`). |

Weight: the extract used 600–700 on small headings. **Astro caps at 500** except
`.brandmark-name` at 600 (brand lockup carve-out in `08 §9`). Never synthesise
bolder weights.

Display sizes in the extract (72px / 36px with tight negative tracking) are a
marketing ramp. The console inherits Open Sans and sentence case only; the
binding scale is `08 §2` (20 / 16 / 13.5 / 13 / 12 / 11 / 9.5).

---

## 1. Visual theme & atmosphere

**What we take from Cursor:** sophisticated minimalism, purposeful restraint,
abundant whitespace, hierarchy through scale and spacing rather than saturation,
near-flat surfaces, content-first layout.

**What Chase / Astro change:** the warm charcoal–gold–orange extract becomes
**monochrome-plus-blue**. Blue does the identity work; everything else gets out
of the way (`09 §1`). Depth is a sunken panel fill and a 1px hairline — never a
micro-shadow. The face is Open Sans, geometric and calm, paired with JetBrains
Mono so a machine-produced value is readable as machine work.

### Key characteristics (resolved)

- Warm paper ground with minimal colour saturation; Chase blue (`#117ACA`) as the
  only brand accent
- Open Sans for interface and prose; JetBrains Mono for anything a machine produced
- Pill or soft radius on interactive chrome per `08 §3` (suggestion pills 20+;
  buttons/inputs 6; cards 9–12) — not a uniform `9999px` on every control
- **No shadows, blur, or elevation** (`08 §3`). Colour blocking and sunken fills
  carry depth
- Generous whitespace; Cursor’s air expressed in Astro’s spacing scale
- Hairline cards and containers; radius stays small on surfaces
- High contrast between Chase ink and warm paper; accent budget reserved for
  verdicts, diffs, selected state, and primary actions

---

## 2. What we are copying

Cursor’s web app is easy to use because it is **uncompressed**. Independent tiles,
tall table rows, a hero composer, and a thread that uses space instead of rules to
separate turns. The product still reads as one column of work.

We copy that organisation. We do not copy the product, the extracted type ramp,
the charcoal/gold palette, or the elevation.

---

## 3. Layout skeleton

Astro keeps:

```
rail (238 default, 190–360, 56 collapsed)
main — body 28/32, centred, max-width 880px
no top bar · no side inspector · no global composer
rail stacks below 820px
```

Cursor’s three-pane agent view (history · thread · diff) maps to surfaces we already
have, not a new pane:

- **Rail** = Cursor’s left history (nav + Active loans). Selected state is still the
  2px left accent, not fill-only.
- **Main column** = Cursor’s centre thread. One measure, generous gutters.
- **File transcript** = the paused turn. Evidence and options *are* the work; they
  do not move to a right inspector.

Conversation still lives only on Ask (`07 §Conversation is a surface, not an
affordance`).

The extracted Cursor max-width (~1300px) and 5-column marketing grid do **not**
apply. Astro’s centred 880px measure is the console answer to `09 §4`’s centred
content with generous gutters.

---

## 4. Spacing scale

Cursor’s air, expressed in Astro’s hairline system:

```
4  6  8  12  16  20  24  32  40  48
```

Mapped against the extracted spacing names where useful:

| Extracted | px | Astro use |
|---|---|---|
| `xxs` | 4 | Micro gutters, chip padding |
| `xs` | 8 | Small internals |
| `sm` | 12 | Icon–text gaps, metric tile gap |
| `md` | 16 | Standard component padding |
| `lg` / `xl` | 20 / 24 | Chart / card internal air |
| `xxl` | 32 | Body horizontal padding |
| section / band | 56 / 64 | **Not adopted.** Console section gap is 40 (`--p-space-section`) |

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

## 5. Typography rules

**Family**

```css
--p-sans: var(--font-open-sans), -apple-system, BlinkMacSystemFont, "Segoe UI",
  Roboto, Helvetica, Arial, sans-serif;
--p-mono: var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, Menlo, monospace;
```

**Console scale** (`08 §2`) — not the extracted marketing ramp:

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

Principles carried over from the extract, remapped:

- Slight negative tracking on larger headings (`-0.02em` / `-0.01em`) — keep the
  geometric tightness; do not import −2.16px display tracking meant for 72px type
- Open Sans as the primary voice for all chrome and prose
- JetBrains Mono for code, ids, money, percentages, paths, enum labels — never
  substitute a second monospace
- Body line-height ~1.5; headings slightly tighter
- Sentence case everywhere (`09 §3` / `08 §7`)

---

## 6. Component recipes

### Buttons (`09 §6`, brand scope)

| Variant | Treatment |
|---|---|
| Primary | Filled `--p-accent` (`#117ACA`), white label, radius 6 (or pill where the
  control is a chip). Hover → `--p-accent-strong` (`#004B87`). No shadow. |
| Secondary | Transparent / panel fill, accent or ink label, 1px hairline |
| Tertiary | Accent text link, underline on hover |
| Label | The action that happens. Never “Submit” / “Learn more” / “Click here.” |

Extracted pill padding and charcoal fills are **not** copied. Focus is a visible
2px outline in accent (Chase accessibility floor, `09 §10`).

### Cards & containers

- Background: `--p-panel` or `--p-paper`; border 1px `--p-line` or none with a
  sunken fill
- Radius: `08 §3` (9 small cards / metric tiles, 10 table wrappers, 12 composer)
- **No box-shadow.** The extracted micro-shadow
  (`rgba(0,0,0,0.02) 0 0 16px`) is refused by `08 §3` and the guard tests
- Hover: panel-2 fill, not lift

### Badges / pills

Suggestion pills and sectionnav tabs: radius 20+, hairline, paper fill, ink-2
label. Selection is a filled pill — never a second hue (`08 §5`). Transparent
text badges from the extract map to ink / ink-2 labels, not gold.

### Inputs & forms

- Background: `--p-paper` or `--p-panel`
- Border: 1px `--p-line-2`; radius 6
- Font: Open Sans, 13px body values
- Focus: accent outline; no shadow ring
- Placeholder: ink-3

### Navigation

Transparent rail inheriting paper/panel. Open Sans 12–13. Selected = panel fill
**and** the 2px left accent. Active is never a gold underline.

### Links

Default links use `--p-accent`. The extracted muted-green link chip is refused —
green is reserved for the `keep` verdict. Outline / quiet links use ink + hairline.

### Composer

**Cursor:** large rounded field; placeholder at the top; model / tools on a toolbar
*inside* the same card; circular send.

**Astro:** already this shape on Ask. Make it spatial: min-height 88, padding
`16 18 12`, radius 12. Send stays Chase-blue filled (`09 §6`). No shadow on focus —
the border turns accent.

Empty state: centred hero, pills underneath. Thread: sticky dock, separated by
space, not a top hairline.

### User / agent turns

**Cursor:** user prompt is a wide panel fill; agent reply is bare structured prose;
`who` is receded.

**Astro:** `.msg.u` is a full-measure panel (not an inline chip). Agent turns stay
bare. `who` stays mono 11. Paragraphs in a reply get `1em` between them.

When Ask is in `act` and proposes work, a **status-card row** sits above the
confirmation: scope · estimated cost · mode. Same anatomy as Cursor’s three model
cards. These are run state, not metrics — they do not go through `<Metric>`.

### Status-card row

Three (or two) independent tiles with a 12px gap. Small grey label, mono value,
optional caption. Used on:

- Ask, when an action is proposed
- A held file: `held` · interrupt type · wait

### Metric tiles

**Before:** `.strip3` is one bordered box with internal dividers.

**After:** three (or two) separate rounded tiles with a 12px gap — Cursor’s
automations / usage KPIs. Same five Overview metrics. Provenance stays in the same
visual unit (`06`).

Selection, where it applies, is still the 2px left accent.

### Chart block

**Cursor Usage:** title and muted subtitle *inside* the card; plot has room;
legend is quiet; a table below has tall rows.

**Astro:** title + caption move inside `.chartwrap`. Plot padding and SVG
`TOP`/`BOTTOM` increase. Takeaway stays a sibling under the card (`08 §6`). “What
this doesn’t tell you” stays on the page.

Do **not** restyle a small-n series as a stacked area. Ten batches is still
small-n. Deploy markers get more room, not a trend fill.

### Tables

Headers in ink-3, smaller than the data. No vertical rules. Row padding 14 / 16.
Primary identifier in ink (mono); secondary in ink-2. Hover is a panel fill.

Applies to the held queue, batch files, ledger, other-held list.

### Rail

Looser vertical padding. Selected = panel fill **and** the 2px left accent.
Collapsed rail keeps the accent on the right so it does not sit under the icon.

### Suggestion pills

Radius 20+, padding `8 14`, gap 10. Hairline, paper fill, ink-2 label. Hover
darkens the edge, not the fill.

---

## 7. Depth & elevation

| Extracted level | Extracted treatment | Astro resolution |
|---|---|---|
| Flat | No shadow | Keep — navigation, sections, backgrounds |
| Micro | `rgba(0,0,0,0.02)` layered blur | **Refuse.** Use `--p-panel` sunken fill + hairline |
| Medium | Tailwind-like overlay shadow | **Refuse** for cards. Overlays (crumb-menu) use paper + 1px line, radius 6, no shadow |

Opacity for muted / secondary states may use ink at reduced emphasis via
`--p-ink-2` / `--p-ink-3` tokens — not free-floating alpha on brand blue over navy
(`09 §2`: never place Chase blue on Chase navy).

Z-index stays sparse: content, sticky rail/header, then disclosure panels. No
elevation ladder.

---

## 8. Anti-copy list

Cursor (and the extract) do these. Astro must not:

| Cursor / extract | Why we refuse |
|---|---|
| Drop shadow on composer and cards | `08 §3` — depth is a sunken fill. Guard test fails on `box-shadow` |
| Bold / 600–700 headings | `08 §2` — 500 is the ceiling (brand lockup excepted) |
| Charcoal `#26251E` as CTA fill | Chase blue is the primary action (`09 §6`) |
| Gold `#C08532` / orange `#F54E00` accents | Second hue family; colour is state (`09 §2`, `08 §1`) |
| Colour as decoration (green sparkline, purple “Merged”) | Colour is state: keep / discard / hold / accent |
| CursorGothic / Lato / EB Garamond | Open Sans only for sans (`09 §3`) |
| Stacked area / trend through a handful of points | `08 §6` — interval plot whenever n is small |
| Composer on every surface | `07` — conversation is a surface, not an affordance |
| Sans face on spend, tokens, versions | Mono is how a reader tells a machine value from prose |
| Cold `#FFFFFF` SaaS ground as a rebrand default | Paper stays warm until `08 §11` is decided |
| Uniform `9999px` radius on every button *and* sharp 0 on inputs as brand law | Follow `08 §3` radius scale; Chase allows pill *or* ~4px, not both randomly |

If a screenshot still feels flat after the new scale, increase the section gap. Do
not reach for elevation.

---

## 9. Do's and don'ts

### Do

- Use Chase blue (`#117ACA`) for primary CTAs, links, and selected accent
- Use Open Sans for all chrome and prose; JetBrains Mono for machine values
- Keep negative tracking modest on page/section titles (`-0.02em` / `-0.01em`)
- Prefer colour blocking and panel fills for depth before any other device
- Keep horizontal body padding at 32px and section gap at 40px
- Maintain the 2px left accent as the only “selected” signal
- Pair every chart with a takeaway; every metric surface with “What this doesn’t
  tell you”

### Don't

- Don’t import charcoal, gold, or orange from the Cursor extract
- Don’t add `box-shadow`, blur, or elevation tokens
- Don’t set font-weight above 500 outside `.brandmark-name`
- Don’t put percentages, money, versions or ids in Open Sans
- Don’t round every interactive element to a full pill when `08 §3` already names
  the radius for that component
- Don’t use a second accent hue for “visual interest”

---

## 10. Surface map

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

## 11. File / interrupt rhythm

A held file is a paused agent turn. The page should scan like Cursor’s thread, not
like a dense form:

```
crumb      Overview › Active loans › batch › held › borrower › pause
           (each caret lists the pages under that segment)
kicker     loanRef + step
status     held · interrupt type · wait
callout    the question (one per pause)
evidence   panel header + mono values  (“the code block”)
opts       taller rows, last option a quiet hatch
impact     what the choice changes, then the action
other held taller list, not a dense strip
```

Status tiles are run state. They must not enter the metrics dictionary.

---

## 12. Implementation homes

| Concern | File |
|---|---|
| Base colour + type tokens | [`src/app/globals.css`](src/app/globals.css) |
| Open Sans / JetBrains Mono load | [`src/app/layout.tsx`](src/app/layout.tsx) |
| Component geometry | [`src/app/notebook.css`](src/app/notebook.css) |
| Binding visual rules | [`specs/08-visual-language.md`](specs/08-visual-language.md) |
| Chase brand tokens | [`specs/09-chase-brand.md`](specs/09-chase-brand.md) |
| Guard tests | [`tests/08-visual-language.test.ts`](tests/08-visual-language.test.ts) |
