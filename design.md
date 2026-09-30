# Figma → Astro: spatial language

Inspiration from the Portfolio 2026 Figma frames
([Agent](https://www.figma.com/design/aGVqt9L6HPYZE9eiVAUuOy/Portfolio-2026?node-id=1059-79226),
[Loans](https://www.figma.com/design/aGVqt9L6HPYZE9eiVAUuOy/Portfolio-2026?node-id=1059-80049),
[Overview](https://www.figma.com/design/aGVqt9L6HPYZE9eiVAUuOy/Portfolio-2026?node-id=1059-79572),
[Loan file](https://www.figma.com/design/aGVqt9L6HPYZE9eiVAUuOy/Portfolio-2026?node-id=1059-80503)).
Binding product rules still live in [`specs/`](specs); this file owns **how the
instrument is arranged** so spacing and chrome do not get reinvented in CSS.

**Decision (2026-09):** look matches Figma first. Chase tokens, mono for machine
values, and shadcn as the control foundation remain. Copy stays short — labels
and numbers over paragraphs.

---

## 1. What we are copying

A quiet agent console: cool-grey chrome, a large rounded white **stage** for work,
fill-only rail selection, and almost no explanatory prose on the surface. The
product is for seeing the agent work and steering from individual outputs — not
for reading essays next to every number.

We copy that organisation and density. Domain meaning (interrupts, verdicts,
provenance) still comes from the specs.

---

## 2. Layout skeleton

```
shell — cool grey chrome (#f4f4f2 / #f5f7fa)
  rail (~240) — cool panel, no right hairline required if stage floats
    brand row     Chase mark + product label + chevron (dropdown)
    primary nav   Agent · Overview · Loans   (fill-only selected, white pill)
    rail body     Active loans — one line, run-state mark
    utility       Governance (version) · Settings
  main — padded chrome; inner .stage is white, radius 16, full remaining height
    body          padding inside the stage; measure opens for data tables
```

**Form factors** (`08 §4a`) still apply: phone sheet, tablet icon column, wide
data surfaces. Touch targets 44px under `pointer: coarse`.

**Two grounds, stage as the work plane.** Rail and shell chrome share a cool
grey. Work sits on a white rounded stage — depth from ground change and radius,
not drop shadows (shadows stay forbidden in code unless a later token carve-out
lands).

**Loan Originator** is the brand signal on the Agent home hero, not a permanent
rail lockup. The rail brand row names the current product (Evaluations /
Experiments).

---

## 3. Information architecture

| Nav | Route | Job |
|---|---|---|
| Agent | `/ask` | Composer home — see / ask / act |
| Overview | `/` | Thin KPIs + current state |
| Loans | batch / loans list | Pipeline of files |
| Active loans (list) | file routes | Jump to a held / running file |
| Governance | `/governance` | Bundle truth (utility) |
| Settings | `/settings` | Preferences (utility) |

Experiments stays a product via the brand dropdown; its rail lists Attempts.

---

## 4. Density and copy

**Default: fewer words.** Prefer:

- A title and optional one-line caption
- Numbers with short metric labels
- Tables without paragraph footers
- Takeaways only under charts that need them — one sentence max

Remove or shorten: long Overview ledes, “What this doesn’t tell you” essays on
every surface, impact paragraphs that restate the table. Spec voice (trade-offs,
no cheerleading) still applies when copy remains.

---

## 5. Spacing scale (Figma-aligned)

| Region | Guidance |
|---|---|
| Shell padding around stage | ~12–16px |
| Stage radius | 16px |
| Rail width | ~240 default |
| Nav row | inset 8, radius 6, py 6 / px 12 |
| Selected nav | white fill on cool rail (not accent tick) |
| Table cell | tall, airy (~14px vertical) |
| KPI cards | gapped, radius ~9–12 |
| Composer | large, radius 12+, circular send |

---

## 6. Surfaces (target)

### Agent
Vertically centered in the stage: Loan Originator mark + name, Answer/Act pill,
soft panel composer (radius 16, circular send). Placeholder: “Ask about a held
file, a bundle, or a number.” No suggestion chips, scope chrome, or disclaimer.

### Overview
Title → period range (date + 1d/7d/30d/MTD/Last month pills) → three soft panel
KPI tiles (Autonomy · Cost per run · Turns per run) → two stacked area charts
(Autonomy, Cost per run) on panel cards, radius ~12. Short captions; one-line
takeaways. Held / Batches / Blind review / Ledger / Attempts sit below as
secondary tabs — not above the instrument.

### Loans
Title **Active loans** → soft pills **Pipeline / Open / Reviewed** (counts in
the label) → calm table in a panel card: Loan · Milestone · Stage · Scope ·
Updated. Zebra rows, generous cell padding, no progress bar or essay. Open =
held + running; Reviewed = cleared; Pipeline = all.

### Loan file (next)
Three-pane: activity / steer thread · loan decision + metrics. Right pane for
decision and documents. Middle column shows work and interrupts — steer here.

---

## 7. What we still refuse

| Temptation | Why |
|---|---|
| Purple marketing gradients | Chase + Astro tokens only |
| Heavy shadows / blur | Depth from grounds and radius |
| Bold walls of prose | Density is the product |
| Decorative colour | Colour is state |
| Spinners on nav | Only the run-state mark animates |

---

## 8. Implementation order

1. Shell stage + rail IA + product dropdown  
2. Terse copy pass on Agent / Overview / Loans  
3. Overview KPI layout toward Figma  
4. Loans table tabs  
5. Agent empty state toward Figma (centered hero, soft composer)  
6. Loan-file three-pane steer surface  
