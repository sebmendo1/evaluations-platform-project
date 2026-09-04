# Conformance

Where the implementation stands against the acceptance criteria in these specs.
There are 60 checkboxes and 21 `GIVEN/WHEN/THEN` blocks; this records which are
met, which are partial, and which are deferred with a reason, so nothing is
quietly skipped.

Status: current as of the spec-conformance pass · 129 tests in [`../tests`](../tests)

| | Count |
|---|---|
| Met, with a test | 36 |
| Met, no test yet | 3 |
| Partial | 1 |
| Deferred — organizational | 9 |
| Deferred — needs a server | 5 |
| Deferred — needs real users | 4 |
| Deferred — out of scope | 2 |

---

## 00 · Constitution

Every invariant has an executable home.

| Invariant | Status | Where |
|---|---|---|
| INV-1 · provenance resolves | Met, tested | `domain/provenance.ts` · three-shape union, constructors throw |
| INV-2 · interrupts are typed | Met, tested | `domain/interrupt.ts` · closed enum, `createInterrupt` refuses without evidence |
| INV-3 · verdict needs separation | Met, tested | `domain/verdict.ts` · computed, no setter exported |
| INV-4 · autonomy never at accuracy's cost | Met, tested | `domain/promotion.ts` · blocks a `keep` at the gate |
| INV-5 · escalations never auto-clear | Met, tested | `domain/decision.ts` · refuses an unapproved adverse action |
| INV-6 · ledger append-only | Partial | No edit or delete path exists, and the crash and discard rows are retained. Storage-layer enforcement is deferred. |
| INV-7 · no protected characteristics | Met, no test | Fair-lending scan rendered on the escalation payload and in compliance reporting |
| INV-8 · thresholds in cards | Met, tested | `domain/policy-cards.ts` · `skillTextNamesThreshold` is a gate condition |
| INV-9 · decisions stamped | Met, tested | `writeDecision` refuses without a bundle version |
| INV-10 · production has no ground truth | Met, tested | `metrics.ts` · `assertContext` throws on a graded figure in a production context |

**Design rules.** The 30-second rule is represented as data and exempts only
`policy_judgment`. Re-derivable values are computed rather than stored — autonomy,
verdicts, `outcome_changes` and the interval estimate are all derived. Every metric
names its provenance in the same visual unit. Every queue surface has a reachable
zero state.

## 01 · Business

All five criteria are organizational and none can be met in code. What the
implementation does instead is refuse to launder them: `01 §2` marks
`loaded_rate_per_minute` and `manual_baseline_minutes` `[INPUT]`, so the hours-saved
figure on Reports renders inside an `unsourced` block naming both, and
`human_minutes_per_file` is shown beside `cost_per_run` because `01 §2` says it is
the more expensive half.

- Deferred: Finance rate, Ops time study, recomputed cost model, Compliance sampling
  basis, Model Risk framing review.

## 03 · Interrupts

| Criterion | Status |
|---|---|
| All five types emit with complete payloads | Met, tested |
| No code path constructs an interrupt without evidence and impact | Met, tested |
| `outcome_changes` computed from the policy card, never authored | Met, tested — `domain/impact.ts` straddle test |
| Senior-only types unresolvable by other roles | Partial — enforced in the client and stated to the reviewer; `03` requires server-side |
| Every resolution writes exactly one case | Met, tested — `createResolution` throws otherwise |
| A held run accrues zero cost | Met, tested — `accruesCost` |
| Median under 90s for the three non-exempt types | **Measured and reported, and it fails.** See below. |

`03 §Metrics` calls the 30-second breach rate "this spec's own health metric", and it
is now computed and shown on Reports rather than assumed. Computing it honestly
produced two findings:

- **No non-exempt type meets the 30-second target.** Two of four clear the
  90-second pilot gate — `conflicting_extraction` at 41s and `low_confidence` at
  1m 12s. `missing_document` at 2m 30s and `mandatory_escalation` at 3m 20s do not,
  which puts 27% of interrupt volume in a type that misses the gate.
- **The spec is inconsistent about its own exemption count.** `§The 30-second rule`
  exempts exactly one type, leaving four non-exempt, but the acceptance criteria say
  "the three non-exempt types". Filed as an open question in `03`.

All eight `GIVEN/WHEN/THEN` blocks in `03` are tests.

## 04 · Evaluation

| Criterion | Status |
|---|---|
| `verdict()` pure, tests for all five outcomes | Met, tested |
| No UI path can set a verdict | Met, tested — the module exports no setter |
| INV-4 gate blocks a promotion, verified by a test that attempts it | Met, tested |
| Pre-flight estimate precedes any authorised spend | Met — the runner states cost, interval and the minimum separating n |
| Reviewers cannot distinguish a sampled file | Deferred, needs real users |
| `sampled_accuracy` never renders without its provenance | Met, tested |
| Reports states the sample-size limitation on the page | Met — Overview, Reports and Verify each carry one |

## 05 · Governance

| Criterion | Status |
|---|---|
| Section nav present, sticky, marks changed sections | Met |
| Compare diffs all six dimensions | Met, tested |
| Tools render grouped; flat list unreachable | Met |
| Skill-to-step mapping explicit, including gaps | Met, tested — an uncovered step renders as a gap |
| Audit chain resolves from any decision in one screen | Met, tested — `/decisions/[loanRef]` resolves for any of the 189 cleared files |
| Promotion gate enumerates every failing condition | Met, tested — seven conditions, each citing its clause |
| Citation coverage displayed, declines alert | Met, tested — computed from provenance, and a drop below the 99% floor reads as a correctness incident |
| Rollback | Met — requires a written reason, retires rather than deletes, leaves stamped decisions untouched |
| Model Risk reviewer completes a review unaided | Deferred, needs an observed session |

The audit chain is generated from the record rather than authored: every field carries
real `Provenance`, so the chain resolves down to a page or a named formula and up to
the promoting experiment, and `citation_coverage` is computed from the same data. A
corrected field carries `stated` provenance, which is what makes the chain resolve to
a person as well as to a document. A held file has no decision to trace and says so.

## 06 · Metrics

All five criteria met and tested. The registry is the gate; the `<Metric>` component
enforces the provenance label rather than trusting the caller; `graded_accuracy`
cannot render in a production context; `resolution_time` is marked per-type only and
the reviewer table no longer carries a pooled median; a test asserts none of the five
forbidden metrics exists anywhere in `src`.

## 07 · Surfaces

Cross-phase criteria all met: no undefined metric on screen, no accuracy figure
without provenance, no interrupt without evidence and impact, no decision without a
bundle version, no promotion bypassing INV-4, no adverse action clearing without a
named human.

The rail's Active loans list is met and tested: the heading, borrower + product
rows, and file hrefs are asserted against `07 §The rail`. Attempts remain a surface
(`/attempts`); they are not the rail body.

Breadcrumbs are met and tested against `07 §Breadcrumbs`: a held file trails
Overview › Active loans › batch › filter › borrower › pause, and an experiment
trails Overview › Experiments › bundle › section, each caret listing the pages
under that segment.

Deferred: Phase 6, the second surface. That is a future phase rather than a
conformance gap.

## 08 · Visual language

All twelve criteria met and tested, except one partial. Tokens resolve through the
`--p-` set with no literal hex outside the declarations; no shadow, blur or elevation
anywhere; no computed weight above 500, enforced with a base rule on `b` and `strong`;
percentages, money, versions and ids in mono at every size including hero metrics;
every chart has a sibling takeaway; every metric-reporting surface carries a "what
this doesn't tell you"; loading states render an artefact rather than a spinner; the
2px left accent means only "selected"; section gap is 40, body padding 28/32, measure
880px; metric tiles are gapped cards; table cells are at least 14px vertical padding;
the composer input is at least 88px tall; primary nav rows are 6px vertical padding.

- Partial: a re-skin has not been exercised. The token layer is isolated, but nothing
  proves it until a second skin is built.

## 09 · Chase brand

Brand-scope items met: Chase blue and navy, the warm near-black ink, Open Sans, and
the accessibility floor — skip link, `<main>` landmark, visible focus, descriptive
link text.

- Deferred, production: licensed Open Sans build, confirmation that
  `public/brand/chase-octagon.png` is the internal asset, motion tokens, and the
  contrast audit of the verdict triad against both grounds.
- Out of scope by `09 §0`: FDIC and Equal Housing marks, NMLS ID, the
  investment-risk block, rate disclaimers, and Spanish parity. These govern
  customer-facing surfaces; Astro is an internal console. Recorded here so their
  absence is a decision.

---

## Deferred because the prototype has no server

`02 · Contracts` assigns these to a write path or a storage layer. Each is
implemented as a guarded constructor that throws, with a test asserting the throw —
the closest a client-only build gets to a database constraint.

- Resolution → Case as a non-nullable foreign key
- Append-only enforcement at the storage layer rather than the application
- Server-side role checks on the two senior-only interrupt types
- The blind sampler drawing files at the agreed rate
- Decision writes rejected at the boundary rather than in a constructor

## Spec defects found while implementing

Three, none coded around.

1. **86% autonomy was not derivable.** `06` defines the denominator as cleared
   files, and every cleared file had zero interrupts, which makes the answer 100%.
   The displayed 86% was `93/108`, using submitted files. Fixed in the data: 13 of
   the 93 cleared files now carry an interrupt, giving `80/93`. This is why the
   invented `resolved` state had to become an interrupt count.
2. **`03` contradicts itself on the 90-second gate.** Its acceptance criteria
   require the three non-exempt types under 90 seconds, but `§Type 2` states
   `missing_document` at 2m30s and defends it as legitimate work. One of the two has
   to move; the data was not adjusted to satisfy the checkbox.
3. **The ledger's `0.10.1` discard is not derivable.** At `88.9% ±2.4` its band is
   `[86.5, 91.3]`, which overlaps the baseline's `[90.4, 94.4]`, so `verdict()`
   returns `inconclusive` and INV-3 admits no override. No baseline in the ledger
   makes it separate. To earn `discard` it needed `±1.5` or tighter, which is twelve
   runs rather than the five it ran. Recorded as a test documenting the
   contradiction, awaiting a decision on whether the verdict label or the interval
   is wrong.
