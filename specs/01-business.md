# 01 · Business specification

How the platform makes money, who operates it, what it risks, and how it grows.

Status: draft for review · Depends on: `00-constitution.md`

> **Numbers in this document are a model, not a measurement.** Every figure
> marked `[INPUT]` must be replaced with a verified value from Chase's own cost
> accounting before this spec is used to justify spend. The structure of the
> model is the deliverable; the placeholder values are illustrative and should
> be treated as wrong until sourced.

---

## 1. The economic claim

HELOC file review is a labour-bound process. A trained underwriter reads a
folder, extracts a fixed set of fields from documents, applies a policy grid,
and writes a record. The work is high-volume, procedurally identical file to
file, and expensive because it requires judgment at a handful of points inside
an otherwise mechanical procedure.

Astro's claim is narrow and testable:

> Most of the procedure requires no judgment. The judgment points can be
> isolated, typed, and surfaced to a human in seconds rather than requiring the
> human to reconstruct the whole file to reach them.

The business does not rest on the agent being right about everything. It rests
on the agent being **reliably able to tell when it isn't**, and on the cost of
asking being small.

## 2. Unit economics

The unit is one loan file reviewed to a written record.

```
cost_per_file  =  agent_cost
               +  (human_minutes × loaded_rate_per_minute)
               +  amortised_platform_cost

human_minutes  =  (1 − autonomy_rate) × avg_interrupt_minutes
               +  sample_rate × blind_review_minutes
```

Observed and assumed inputs:

| Input | Value | Source |
|---|---|---|
| `agent_cost` | $2.19 / file | measured, Sep 3 batch |
| `autonomy_rate` | 86% | measured, current bundle |
| `avg_interrupt_minutes` | 1.6 min | measured, 214 interrupts |
| `sample_rate` | 5% of clean files | policy decision |
| `blind_review_minutes` | ~6 min / file | measured, small n |
| `loaded_rate_per_minute` | `[INPUT]` | Finance |
| `manual_baseline_minutes` | `[INPUT]` — assumed ~25 min | Ops time study |

At 86% autonomy, per 100 files: 14 interrupts × 1.6 min ≈ 22 min, plus 5 blind
reviews × 6 min ≈ 30 min. **About 52 minutes of human time per 100 files**,
against `100 × manual_baseline_minutes` today.

Two things follow that are easy to get wrong:

- **Blind review is now the larger half of the human cost.** As autonomy rises,
  verification does not shrink — it is a fixed percentage of clean volume. Past
  roughly 90% autonomy, verification dominates. Any ROI model that omits it
  overstates savings and will be corrected embarrassingly, in public, by
  whoever inherits it.
- **Agent cost is close to irrelevant.** At `[INPUT]` loaded rate, one minute of
  underwriter time is worth several files of inference. Optimising token spend
  before optimising interrupt resolution time is the wrong order of work.

## 3. The value driver

**Autonomy rate is the business metric.** Cost per run and accuracy are inputs
to it; throughput is a consequence of it.

Autonomy improves by one mechanism only, and it is a loop:

```
production run
   → agent stops on evidence it cannot resolve
   → human answers a typed question in seconds
   → answer is stored as a labelled case
   → case joins the eval corpus
   → next experiment tests a bundle change against those cases
   → bundle separates from baseline and is promoted
   → fewer files stop
```

Every part of the platform is a station on that loop. The interrupt design is
what makes the loop cheap; the verdict logic is what keeps it honest; the
governance chain is what makes it defensible.

This is the strategic asset. Competing platforms can run agents. What
accumulates here is **a growing corpus of adjudicated edge cases from Chase's
own book**, labelled by Chase underwriters, that no vendor can supply and no
competitor can copy. The agent bundle is replaceable; the corpus is not.

## 4. Where the money actually comes from

Ranked by confidence, not size:

1. **Underwriter capacity released.** Highest confidence, measurable today.
   Reviewers move from reading whole folders to resolving typed questions.
2. **Cycle-time reduction.** Median time to clear is 18 minutes against a manual
   baseline measured in hours or days, most of which is queue wait rather than
   work. Faster decisions improve pull-through; the size of that effect is a
   `[INPUT]` from the business, not something Astro can claim.
3. **Consistency.** The same procedure runs on every file. Variance between
   underwriters is a known source of both fair-lending exposure and rework.
   Hard to price, easy to defend.
4. **Audit cost.** Every field carries a citation and every decision carries a
   version chain. Examination preparation that is currently a project becomes a
   query. Real, and usually omitted from these models.

Explicitly **not** claimed: credit-loss improvement. Astro executes existing
policy faithfully. It does not make better credit decisions, and any model that
assumes it does should be rejected.

## 5. Operating model

| Role | Owns | Volume |
|---|---|---|
| **Reviewer** (ops underwriter) | Clears the interrupt queue; performs blind reviews | ~50 resolutions / day / person at current mix |
| **Senior reviewer** | Policy judgments, adverse-action approvals | ~12% of interrupts, 4 min each |
| **Bundle owner** (engineer / designer) | Runs experiments, proposes bundle changes | 1–3 experiments / week |
| **Credit Policy** | Owns policy cards; approves card amendments proposed from the queue | Reviews amendments weekly |
| **Model Risk** | Independent validation of the bundle; owns the challenge process | Per promotion, plus periodic |
| **Compliance** | Fair-lending and adverse-action review; owns the sampling rate | Continuous, via Reports |

The unusual role is **bundle owner**. It is not a data science job and not a
traditional engineering job: it is someone who can read failure patterns, write
the procedure change, run the experiment, and read a confidence interval
honestly. Staffing this is the main organisational risk in the plan.

## 6. Risk model

| Risk | Mechanism | Control |
|---|---|---|
| **Confident-wrong** — agent produces a wrong field with no interrupt | Model error the checker doesn't catch | Blind sampling (`04`). This is the only control that sees it. |
| **Autonomy gaming** | Removing interrupts to raise the headline metric | INV-4, enforced in verdict logic, not by policy memo |
| **Corpus drift** | Eval corpus stops resembling production | Graded-vs-sampled gap monitored in Reports; widening gap is the alarm |
| **Reviewer rubber-stamping** | Queue pressure → reflexive approval | Blind sample includes previously-resolved files; resolution-time floors |
| **Policy drift into skills** | A threshold gets written into skill text | INV-8, checked at bundle review in Governance |
| **Silent regression after promotion** | Bundle passes at promotion, drifts in production | Continuous sampled accuracy per bundle, not just at promotion |
| **Vendor concentration** | Single model provider | Bundle abstraction is model-portable; runtime pins the model per version |

The tail risk is not the agent being wrong. It is the agent being wrong in a way
nothing flagged, in volume, for a period, and the institution learning about it
from an examiner. Blind sampling exists for exactly this and should be argued
for on that basis, not on the basis of measurement hygiene.

## 7. Regulatory posture

To be confirmed with Legal and Compliance — stated here as design intent, not as
legal advice.

- **Adverse action (ECOA / Regulation B).** Every counteroffer or decline
  requires specific principal reasons. Astro drafts them from the Chase reason
  table, matches each to a recorded finding, and requires named human approval
  before the record is written (INV-5). No adverse action is ever issued
  autonomously.
- **Fair lending.** Prohibited-basis characteristics never enter agent context
  or reasoning (INV-7). Reports carries a per-period count of reasoning traces
  scanned and flags raised.
- **Model risk management (SR 11-7 and equivalents).** The bundle is the model
  artifact. Governance provides version history, the promoting experiment, its
  evidence, and the signer. Independent validation is a role, not a feature —
  Astro's job is to make the artifact reviewable.
- **Records.** The audit chain (`05`) is designed as the examination artifact.
  Retention must at minimum match the loan file's own retention period.

## 8. Growth path

The bundle abstraction is the reusable asset. Sequence, easiest first:

1. **HELOC file review** — current. Locked eight-step procedure, one policy card
   set.
2. **Second HELOC surface** — pre-qualification or conditions clearing. Reuses
   document-reader, checker, the interrupt types and the entire platform;
   changes skills and cards only.
3. **Adjacent product line** — purchase or refinance. New card set, new step
   skills, same platform. This is the test of whether the abstraction held.
4. **Platform for the bank** — other document-heavy adjudication processes that
   share the shape: fixed field set, policy grid, judgment at a few points.

The order matters. Step 2 exists to prove the platform is a platform before
anyone commits to step 3 on a slide.

## 9. What would make this fail

Stated plainly so it can be checked against later:

- Interrupts that take four minutes instead of forty seconds. The whole model
  collapses; a slow interrupt is worse than no automation because it adds a
  context switch to work that was already going to happen.
- Autonomy plateauing in the low 80s because the remaining stops are genuine
  judgment. This is a real possibility and it is fine — but the business case
  must be built on the plateau, not on an extrapolation through it.
- A confident-wrong incident found externally before the sampling finds it.
  Recoverable technically, expensive institutionally.
- Bundle-owner capacity. One person who can run this well is a single point of
  failure and the pipeline for the role does not exist yet.

## 10. Acceptance criteria for the business case

- [ ] `loaded_rate_per_minute` and `manual_baseline_minutes` sourced from Finance
      and Ops respectively, in writing.
- [ ] Cost model recomputed with verified inputs and re-reviewed.
- [ ] Sampling rate agreed with Compliance, with a stated statistical basis for
      the number chosen.
- [ ] Model Risk has reviewed the bundle-as-model-artifact framing and confirmed
      what independent validation requires.
- [ ] Blind-review cost is included in every savings figure presented outside
      the team.
