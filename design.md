# Cursor → Astro: design translation

Inspiration, not a binding spec. Geometry that ships lives in
[`specs/08-visual-language.md`](specs/08-visual-language.md). Brand hue and
typeface live in [`specs/09-chase-brand.md`](specs/09-chase-brand.md). This file
is the translation so a Cursor-extracted design system is remapped once — to
**Open Sans** and **Chase blue** — rather than reinvented in CSS.

Astro stays the instrument: warm paper, 1px hairlines, monospace for anything a
machine produced, weight ceiling 500, colour as state. Cursor supplies spatial
organisation and interactive shape vocabulary. Chase supplies the identity
tokens.

Local screenshots: [`docs/cursor-ref/`](docs/cursor-ref/).

---

## 0. Token remap (Cursor extraction → Chase / Astro)

The attached Cursor design system is warm charcoal + gold. Astro does not ship
that palette. Every extracted token remaps before it touches code:

| Cursor extraction | Role there | Astro / Chase |
|---|---|---|
| CursorGothic | Primary UI / brand face | **Open Sans** — `09 §3`, loaded as `--font-open-sans` |
| system-ui | Labels, captions, small UI | Open Sans at the same sizes (one face, not two) |
| berkeleyMono | Code / technical | **JetBrains Mono** — `08 §2` (load-bearing mono) |
| EB Garamond, Lato | Supplementary, unused | Omitted |
| `#26251E` primary | CTA, body, active | **Ink** `#211E1E` for text; **Chase blue** `#117ACA` for CTA / active |
| `#C08532` golden | Hero band / secondary accent | **Chase navy** `#004B87` for weight; no gold family |
| `#F54E00` orange | Decorative accent | Dropped — colour is state, never decoration (`08 §1`) |
| `#F7F7F4` canvas | Page ground | **Paper** `#FBFBFA` (warm; Chase `#FFFFFF` is an open question in `08 §11`) |
| `#000000` ink | Headings | Chase ink `#211E1E` |
| `#FFFFFF` on-primary | Label on filled CTA | `#FFFFFF` on Chase blue |
| `#E6E5E0` / `#EDECEC` neutrals | Dividers | `--p-line` / `--p-panel-2` |
| `#F2F1ED` card surface | Cards | `--p-panel` with a 1px hairline — no micro-shadow |
| Micro-shadows | Card elevation | **Refused** — `08 §3`; depth is a sunken fill |
| Weight 600–700 | Display / small headings | **500 ceiling** — brand lockup and page title (`h1`) may use 600 |
| Display 72px / −2.16px tracking | Hero | Console has no marketing hero; page title stays 20 / 600 |
| Pill `9999px` on buttons & badges | Interactive identity | **Adopted** for primary actions, pills, badges (`09 §6`) |
| Sharp `0` inputs | Geometric voice | Inputs stay radius 6 — console geometry in `08 §3` |

---

## 1. Visual theme & atmosphere

Sophisticated restraint, remapped for an underwriting console rather than a
developer marketing site.

- **Monochrome + Chase blue.** Blue does identity and action work; chrome stays
  paper and ink. Verdict greens / reds / ambers are status only.
- **Open Sans** for interface and prose; **JetBrains Mono** for machine values.
- **Abundant whitespace** borrowed from Cursor’s uncompressed layout — section
  gap 40, body padding 28/32, measure 880px.
- **Near-flat.** Hairlines and panel fills, never drop shadows.
- **Pill primary actions.** Filled Chase blue, white label — the brand CTA shape
  from `09 §6`, aligned with Cursor’s pill interactive identity.

---

## 2. Color palette & roles

Canonical tokens are `--p-*` in [`src/app/globals.css`](src/app/globals.css).

### Brand (Chase wins)

| Token | Value | Role |
|---|---|---|
| `--p-accent` | `#117ACA` | Primary CTA, links, selection, in-progress |
| `--p-accent-strong` | `#004B87` | Hover on primary, dark bands, weight |
| `--p-accent-bg` | `#E8F1FA` | Callouts, action boxes |
| `--p-ink` | `#211E1E` | Primary text (Chase warm near-black) |
| On-primary | `#FFFFFF` | Label on filled Chase-blue controls |

Add `--p-on-primary` in [`src/app/globals.css`](src/app/globals.css) so filled CTAs
never reach for a raw `#fff` or `--p-paper` (paper is dark in the dark theme).
In dark mode the token flips to a near-black so labels stay readable on the
lightened Chase accent.

### Neutrals (Astro paper system)

| Token | Light | Role |
|---|---|---|
| `--p-paper` | `#FBFBFA` | Page ground |
| `--p-panel` | `#F4F4F2` | Rail, cards, user bubbles |
| `--p-panel-2` | `#EDEDEA` | Hover / selected fill |
| `--p-line` | `#E2E2DE` | Hairline separator |
| `--p-line-2` | `#CFCFC9` | Control edge |
| `--p-ink-2` | `#5A5C63` | Secondary text |
| `--p-ink-3` | `#8A8C93` | Tertiary, captions, axis |

### Semantic (status only)

| Token | Role |
|---|---|
| `--p-keep` / `-bg` | Verdict keep · cleared · agreed |
| `--p-discard` / `-bg` | Verdict discard · failed · corrected |
| `--p-hold` / `-bg` | Verdict inconclusive · waiting · held |

No second hue family for decoration. No gold, no orange punctuation, no green
link chips from the Cursor extraction.

---

## 3. Typography

### Families

```
Primary   Open Sans     --p-sans   interface, prose, buttons
Mono      JetBrains Mono --p-mono  anything a machine produced
```

Fallbacks: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
for sans; `ui-monospace, SFMono-Regular, Menlo, monospace` for mono.

### Console scale (binding — `08 §2`)

Cursor’s 72px display and 600–700 small headings do not ship. The console ramp:

| Role | Size / weight | Tracking | Face |
|---|---|---|---|
| Page title | 20 / 600 | −0.02em | Open Sans |
| Section heading | 16 / 500 | −0.01em | Open Sans |
| Card title | 13.5 / 500 | 0 | Open Sans |
| Body / form | 13–13.5 / 400, lh 1.5–1.6 | 0 | Open Sans |
| Label, crumb, link | 12 / 400 | 0 | Open Sans |
| Caption | 11.5 / 400 | 0 | Open Sans |
| Eyebrow / `who` / badge | 11 / 400 | 0 | Mono |
| Log / citation | 10.5 / 400 | 0 | Mono |
| Axis tick | 9.5 / 400 | 0 | Mono |
| Brand lockup only | — / 600 | 0 | Open Sans |

**Never bold.** 500 is the ceiling except `.brandmark-name` at 600.

### Principles carried from the extraction

- Negative tracking on the largest console titles (−0.02em / −0.01em) — keep it.
- Mono for machine strings at every size, including hero metrics.
- Comfortable body line-height (~1.5); headings slightly tighter.
- Do not import CursorGothic, Lato, or EB Garamond into the build.

---

## 4. Component recipes

### Buttons

**Primary (`.btn.pri`)** — Chase CTA

- Background / border: `--p-accent` (`#117ACA`)
- Text: `#FFFFFF`
- Font: Open Sans, 13px / 400 (sm: 12px)
- Padding: `10px 14px` (sm: `5px 10px`)
- Radius: **pill** (`9999px`) — Cursor interactive identity + `09 §6`
- Hover: `--p-accent-strong` (`#004B87`); text stays white
- Focus: 2px solid outline in `--p-accent`
- Shadow: none

**Default / secondary (`.btn`)**

- Background: `--p-paper`; text: `--p-ink`; border: `--p-line-2`
- Same pill radius and padding as primary
- Hover: border darkens to `--p-ink-3` — colour block, not elevation

**Danger (`.btn.dan`)** — outline only, discard ink; still pill.

### Cards & containers

- Background: `--p-panel` or `--p-paper`
- Border: 1px `--p-line` (hairline). **No box-shadow.**
- Radius: 9px metric tiles · 10px table wrappers · 12px composer / bubbles · 4–8px smaller surfaces per `08 §3`
- Hover: panel fill shift (`--p-panel-2`), never a lift shadow

Cursor’s micro-shadow (`rgba(0,0,0,0.02)…`) is the spatial *idea* of separation;
Astro expresses it as a hairline + panel tint.

### Badges & pills

- Pill radius (`20px`+ / `9999px`)
- Transparent or panel fill; ink text; hairline optional
- Selection elsewhere stays the **2px left accent**, not a filled hue

### Inputs & forms

- Background: `--p-paper`
- Border: 1px `--p-line-2`; radius **6px** (console), not sharp 0
- Text: `--p-ink`; labels Open Sans 12–13
- Focus: 2px outline `--p-accent` — no shadow glow

### Navigation (rail)

- Transparent / paper inheritance
- Open Sans 13; selected = panel fill **and** 2px left accent
- Collapsed: accent moves to the right edge so it does not sit under the icon

### Links

- Default: `--p-accent` text; underline on hover where prose needs it
- Do **not** use Cursor’s muted-green filled link chip — that is decorative colour

### Composer (Ask)

- Min-height 88, padding `16 18 12`, radius 12
- Send control: filled Chase blue, circular / pill
- No shadow on focus — border turns accent
- Empty state: centred hero, suggestion pills underneath

### Metric tiles / status-card row

- Independent tiles, 12px gap — Cursor automations KPI rhythm
- 20 / 22 padding; provenance in the same visual unit
- Status tiles are run state; they must not enter the metrics dictionary

### Charts

- Title + muted caption *inside* the card; takeaway sibling underneath
- Interval plot whenever n is small — never restyle as a trend fill

### Tables

- Headers in ink-3, smaller than data; no vertical rules
- Row padding ≥ 14 / 16; primary id in mono ink; hover = panel fill

---

## 5. Layout & spacing

### Skeleton

```
rail (238 default, 190–360, 56 collapsed)
main — body 28/32, centred, max-width 880px
no top bar · no side inspector · no global composer
rail stacks below 820px
```

Cursor’s three-pane agent view maps to surfaces we already have:

- **Rail** = left history (nav + Active loans)
- **Main column** = centre thread / work
- **File transcript** = paused turn — evidence and options stay in-flow

Conversation still lives only on Ask (`07 §Conversation is a surface, not an
affordance`).

### Spacing scale

```
4  6  8  12  16  20  24  32  40  48
```

| Token | Value | Use |
|---|---|---|
| Body padding | 28 / 32 | Page ground around the column |
| Measure | 880px | Extra is gutter; charts keep a 690 viewBox |
| Section gap | 40 | Chart-to-chart breathing room |
| Nav / rail row | 6–10 / 14 | Compact primary nav; finger-sized Active loans |
| Table `th` / `td` | 12 / 14 × 16 | Scan a loan row without crowding |
| Metric tile | 20 / 22, 12px gap | Cursor automations KPIs |
| Chart wrap | 20 / 24 | Title lives inside the card |
| Composer | radius 12, min-height 88 | The input is the hero |
| Chat turn gap | 36 | Space, not a hairline, separates turns |
| Suggestion pills | 8 / 14, gap 10 | Same weight as the composer |

CSS: `--p-measure`, `--p-space-section`, `--p-space-body-y`, `--p-space-body-x`.

Cursor’s extracted `{spacing.band}` (64) / `{spacing.section}` (56) map to Astro’s
section gap 40 inside the console measure — do not inflate the column to a
marketing band.

### Border radius

| Token | Value | Use |
|---|---|---|
| none / hairline surfaces | 0–4px | Code chips (4), rare sharp edges |
| control | 6px | Inputs, crumb menus, default controls |
| container | 8–12px | Callouts, opts, composer, bubbles |
| pill | 20px+ / `9999px` | Primary buttons, badges, suggestion pills, send |

---

## 6. Depth & elevation

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow; solid / paper fill | Nav, sections, backgrounds |
| Sunken | Panel fill or hairline | Cards, selected rows, composer |
| Overlay | Hairline panel, z-index 10–50 | Crumb menus, disclosures |

**Shadow philosophy (Astro):** colour blocking is the depth signal. Cursor’s
micro-shadow and medium overlay shadow are **not** adopted. Guard tests fail the
build on `box-shadow`.

Opacity for muted / disabled states stays in the 0.55–0.70 range already used on
disabled controls — not as a decorative wash.

---

## 7. Surface map

| Astro surface | Cursor pattern | Notes |
|---|---|---|
| Ask empty state | Centred hero composer, pills underneath | Chase-blue send |
| Ask thread | Status-card row + wide user bubble + sticky follow-up | Space separates turns |
| File / interrupt | Kicker → status → callout → evidence → options → impact | Payload *is* the work |
| Overview | Independent KPI tiles + taller queue / ledger rows | 2px left accent = selected |
| Reports | Chart card with title inside, airy KPI row | Takeaway under the card |
| Batch | Filter chips + taller file table | |
| Rail | Selected fill + 2px left accent | Accent on the right when collapsed |

Mobbin / screenshot refs stay in [`docs/cursor-ref/`](docs/cursor-ref/).

---

## 8. File / interrupt rhythm

A held file is a paused agent turn:

```
crumb      Overview › Active loans › batch › held › borrower › pause
kicker     loanRef + step
status     held · interrupt type · wait
callout    the question (one per pause)
evidence   panel header + mono values
opts       taller rows, last option a quiet hatch
impact     what the choice changes, then the action
other held taller list, not a dense strip
```

Status tiles are run state. They must not enter the metrics dictionary.

---

## 9. Do’s and don’ts

### Do

- Use **Open Sans** for chrome and prose; **JetBrains Mono** for machine values.
- Use **Chase blue** `#117ACA` for primary CTAs and selection; navy `#004B87` on hover.
- Keep primary actions **pill-shaped**.
- Keep negative tracking on page / section titles.
- Prefer section gap and panel fills over any elevation.
- Maintain 28/32 body padding and the 880px measure across breakpoints.
- Keep the 2px left accent as the only “selected” device.

### Don’t

- Don’t ship CursorGothic, berkeleyMono, Lato, or EB Garamond.
- Don’t use `#26251E`, gold `#C08532`, or orange `#F54E00` as brand accents.
- Don’t add `box-shadow`, blur, or hover lift.
- Don’t set font-weight above 500 (brand lockup excepted).
- Don’t treat colour as decoration — no green link chips, no sparkline cosmetics.
- Don’t draw a trend line through a handful of points.
- Don’t put the composer on every surface.
- Don’t set spend, tokens, versions, or ids in the sans face.
- Don’t replace warm paper with cold SaaS white until `08 §11` decides.

If a screen still feels flat after spacing is right, increase the section gap. Do
not reach for elevation.
