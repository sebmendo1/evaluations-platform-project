# Astro — specification set

Spec-driven development for agentic loan-file review.

These specs are the source of truth. The UI follows from them, not the other way
around. A change to behaviour starts as an edit here.

Owner: Sebastian Mendo · Status: draft for review · Sep 3, 2026

---

## Read in this order

| # | Spec | What it settles |
|---|---|---|
| [00](00-constitution.md) | **Constitution** | Ten invariants every other spec inherits, and the decision rules for when goals conflict |
| [01](01-business.md) | **Business** | Unit economics, the value loop, operating model, risk, regulatory posture, growth path |
| [02](02-domain-model.md) | **Domain model** | Entities, state machines, contracts, and the shared vocabulary |
| [03](03-interrupts.md) | **Interrupts** | The core primitive — five types, payloads, routing, the 30-second rule |
| [04](04-evaluation.md) | **Evaluation** | Verdict logic, the INV-4 gate, corpora, blind verification |
| [05](05-governance.md) | **Governance** | Bundle review, version compare, audit chain, promotion gate |
| [06](06-metrics.md) | **Metrics** | Every number the platform may display, and the ones it may not |
| [07](07-surfaces-and-roadmap.md) | **Surfaces and delivery** | Screen map, phased delivery with gates, consolidated open questions |
| [08](08-visual-language.md) | **Visual language** | The Astro look — palette, type, geometry, component vocabulary, chart rules, voice |
| [09](09-chase-brand.md) | **Chase brand** | Brand tokens, typography, voice, and the accessibility floor. Governs `08` on hue and typeface |

---

## The one-paragraph version

Astro runs a versioned agent bundle against loan folders at batch scale. When the
agent cannot proceed on the evidence it has, it emits a **typed interrupt** — one
of five, never free text — carrying everything a human needs to answer in under
thirty seconds. The human's answer resumes the run and is simultaneously stored
as a **labelled case**. Those cases become the corpus that the next **experiment**
tests against, and an experiment may only be called better if its confidence
interval clears the baseline's. A promoted bundle is stamped on every decision it
produces, and every decision resolves down to a page in a document and up to the
experiment that authorised it.

That loop is the product. Everything else is a screen onto it.

## The four ideas worth defending in a review

**Autonomy rate is the business metric.** Cost per run and accuracy are inputs;
throughput is a consequence. The number that decides whether this saves anyone
money is the share of files that clear with no human at all.

**Production has no ground truth.** Any accuracy figure shown in a production
context must come from blind human review of files that cleared with no
interrupt. The queue only ever shows you files where the agent knew it was
unsure — it is structurally blind to the confident-wrong file, which is the
expensive failure.

**Autonomy and correctness pull against each other.** Every interrupt removed to
raise autonomy is a case where the agent now guesses instead of asking. INV-4
blocks any promotion that raises one while lowering the other, enforced in code
at the promotion path rather than in a policy memo. This is very hard to retrofit
once autonomy is on someone's quarterly goal.

**The corpus is the asset, not the agent.** The bundle is replaceable — a better
model ships every few months. What compounds is a growing set of edge cases from
Chase's own book, adjudicated by Chase underwriters, that no vendor can supply.

## Conventions

- Acceptance criteria are `GIVEN / WHEN / THEN` and should become tests directly.
- `INV-n` cites the constitution. Invariants cannot be waived in a feature spec.
- `[INPUT]` marks a figure that must be replaced with a verified value before the
  spec is used to justify spend. Treat these as wrong until sourced.
- Open questions are listed at the end of each spec. They are real decisions
  someone has to make, not rhetorical.

## Before this goes further

Three things gate everything else, and none of them are design work:

1. `loaded_rate_per_minute` from Finance and `manual_baseline_minutes` from a
   proper Ops time study. The whole business case is a model until these land.
2. Compliance sign-off on the blind sample rate, with a stated statistical basis
   for whatever number is chosen.
3. Model Risk's position on the bundle-as-model-artifact framing, and what their
   independent validation actually requires.

## The implementation

This repository is the working prototype these specs describe. It supersedes the
`astro-notebook.html` single-file mockup, which was the source the first build was
ported from.

The prototype was built from the mockup **before** these specs landed, so it does
not yet conform to them. The known violations are tracked as a conformance audit
rather than silently fixed — see the repository README.

`08` is also published as an agent skill at
`.cursor/skills/astro-design/SKILL.md`, which points at the spec rather than
restating it.

[`design.md`](../design.md) is a Cursor → Astro spatial translation (spacing,
grouping, composer and chart chrome). It is inspiration, not a spec. Binding
geometry lives only in `08`.

## Precedence

When two specs disagree:

1. `00-constitution.md` — an `INV-n` cannot be waived by any other spec.
2. `09-chase-brand.md` — wins on brand tokens: hue, typeface, accessibility floor.
3. The feature spec that owns the surface (`03`–`07`).
4. `08-visual-language.md` — yields to `09` on brand, wins on structure, density
   and voice.

`06-metrics.md` is not in this ladder because it is a dictionary, not a position:
a metric that is not defined there may not appear on a screen, full stop.
