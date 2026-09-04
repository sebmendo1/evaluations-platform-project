# 04 · Evaluation and verification

How Astro decides whether a bundle is better, and how it knows what production
is actually doing.

Status: draft for review · Depends on: `02-domain-model.md`

---

## Two different questions

| | Question | Method | Truth source |
|---|---|---|---|
| **Evaluation** | Is bundle B better than bundle A? | Graded runs on a corpus | Labelled cases |
| **Verification** | Is production actually correct? | Blind review of cleared files | A human reading the file |

They are not interchangeable and their numbers are not comparable without saying
so. Evaluation happens before promotion and is optimistic. Verification happens
continuously and is the only production truth (INV-10).

The gap between them is itself a monitored signal — see §5.

---

## 1. Experiments

An experiment is a hypothesis tested at a stated number of runs.

```
Experiment { hypothesis, bundle_version, corpus, n_runs, grader }
```

`hypothesis` is required prose and becomes the first turn of the experiment
thread. An experiment without a stated hypothesis is a fishing expedition and
cannot be reviewed later.

### Pre-flight estimate

Before running, Astro states the cost and **the interval width that number of
runs will produce**:

```
estimated_interval ≈ z × sqrt(p(1−p) / (n × fields_per_run))
```

and whether that width can separate from the current baseline. This is the single
most useful thing the runner does. At n=5 the interval lands near ±2.0 and the
experiment will almost certainly return `inconclusive`; at n=12 it lands near
±1.2 and can separate. Telling the user this before they spend $26 is worth more
than any chart afterwards.

```
GIVEN a proposed experiment at n runs
WHEN the estimated interval overlaps the baseline interval
THEN the runner states that the result will be inconclusive at this n
AND suggests the minimum n that could separate
```

---

## 2. Verdict logic

**The most important function in the platform.** It is computed, never entered,
and has no override (INV-3).

```
function verdict(result, baseline):
    if result.status == crashed:                  return crash
    if baseline is null:                          return baseline
    if intervals_overlap(result, baseline):       return inconclusive
    if result.accuracy > baseline.accuracy:       return keep
    else:                                         return discard

function intervals_overlap(a, b):
    return not (a.lower > b.upper or a.upper < b.lower)
```

Where `lower = accuracy − interval` and `upper = accuracy + interval` at 95%.

### The INV-4 gate

`keep` is necessary but not sufficient for promotion. A bundle may be promoted
only if:

```
verdict == keep
AND NOT (autonomy_delta > 0 AND sampled_accuracy_delta < 0)
```

Autonomy and correctness pull against each other. Every interrupt removed to
raise autonomy is a case where the agent now guesses instead of asking. Without
this gate, the cheapest way to move the headline metric is to make the system
worse, and that will be discovered eventually by someone outside the team.

The gate is enforced in code at the promotion path, not stated in a policy
document. A toggle for it exists in the runner UI and defaults on; disabling it
requires a written reason stored with the promotion.

```
GIVEN an experiment returns keep
AND the bundle's autonomy in canary is higher than the incumbent's
AND its sampled accuracy is lower
THEN promotion is blocked and the reason is stated on the experiment
```

### Why not statistical significance testing

A two-proportion test would be defensible and is a reasonable future refinement.
Interval overlap is chosen for pilot because it is legible to a reviewer with no
statistics background, it errs toward `inconclusive`, and it cannot be argued
with in a meeting. Model Risk should review this choice; if they prefer a formal
test, the change is confined to one function.

---

## 3. Corpora

| Corpus | Origin | Size | Purpose |
|---|---|---|---|
| `heloc-150` | authored | 150 fields × cases | Standard regression set |
| `obligations-conflicts` | production resolutions | 20 and growing | Targeted, from real stops |
| `heloc-150 + corrections` | mixed | — | Regression plus recent production truth |

Cases from `production_resolution` are the compounding asset (`01 §3`). A corpus
built only from authored cases drifts away from production and the graded number
becomes decorative.

**Rule:** every experiment states its corpus, and the corpus is part of the
verdict's meaning. A `keep` on `obligations-conflicts` says nothing about
regression, and the UI must not imply otherwise.

---

## 4. Blind verification

The only control that catches confident-wrong (`01 §6`).

### The problem it solves

The queue only surfaces files where the agent **knew** it was unsure. A file with
a wrong DTI and no interrupt clears silently. Nothing in the interrupt system can
ever see it, by construction.

### Mechanism

```
GIVEN a run reaches `cleared` with no interrupts
WHEN it is selected by the sampler at rate `sample_rate`
THEN a Review is created and routed to a reviewer
AND the reviewer is NOT told the file was sampled
```

The blindness is the point. A reviewer who knows they are auditing an agent
reviews differently than one who believes they are doing ordinary work.

### Review UI

Every field with its value and provenance, and a per-field agree-or-correct
action. Not a summary judgment on the file — a field-level verdict, because
`sampled_accuracy` is a field-level rate.

```
sampled_accuracy = fields_agreed / fields_reviewed
```

A correction:
- writes `Stated` provenance to the field
- creates a Case with `origin = blind_review`
- counts against `sampled_accuracy`
- does **not** count as an interrupt resolution — different metric, different
  meaning (`02 · Naming`)

### Sample rate

Currently 5% of clean files. This number is a Compliance decision and needs a
stated statistical basis, which it does not yet have. Two competing pressures:

- Verification is the larger half of human cost above ~90% autonomy (`01 §2`).
  Every point of sample rate is expensive.
- At 5% of ~100 files/day, reaching a confidence interval worth quoting takes
  around three weeks. Current figures rest on 70 fields, which detects a
  systematic error and supports no interval at all.

**Reports must state this limitation on the page**, not in a footnote. A 95.1%
that gets quoted in a steering committee and then qualified later costs more
credibility than a caveated number ever costs attention.

### Stratification

Uniform random sampling under-samples rare, high-consequence file types. Open
question in §7 — the pilot ships uniform and the limitation is documented.

---

## 5. The graded–sampled gap

```
gap = graded_accuracy − sampled_accuracy
```

Currently 1.2 to 1.7 points across four bundles, and it has not closed. Live
files are messier than the corpus, so a graded gain should be discounted before
it is promised to anyone.

**Treat the gap as a monitored signal, not a nuisance:**

| Behaviour | Reading |
|---|---|
| Stable gap | Normal. Corpus is representative; discount by the gap. |
| Widening gap | **Alarm.** The corpus has drifted from production. Refresh it before running more experiments. |
| Gap closes to zero | Suspicious. Either the corpus now contains production cases so recent it is no longer a regression set, or sampling is not blind in practice. |

---

## 6. Metrics owned by this spec

| Metric | Definition | Where it may appear |
|---|---|---|
| `graded_accuracy` | fields correct / fields graded, on a corpus | Lab contexts only |
| `interval` | ± at 95% | Always shown with graded_accuracy |
| `sampled_accuracy` | fields agreed / fields reviewed, blind | Production contexts, labelled `sampled` |
| `verdict` | computed per §2 | Everywhere an experiment appears |
| `gap` | graded − sampled | Experiments, Reports |
| `runs_to_verdict` | n at which an experiment separated | Experiments |

INV-10: `graded_accuracy` may never render in a production context without the
word `graded` adjacent to it, and `sampled_accuracy` may never render without
`sampled`.

## 7. Acceptance criteria

- [ ] `verdict()` is a pure function with unit tests covering all five outcomes
- [ ] No UI path can set a verdict manually
- [ ] The INV-4 gate blocks promotion, verified by a test that attempts it
- [ ] Pre-flight estimate is shown before any spend is authorised
- [ ] Reviewers cannot distinguish a sampled file from ordinary work
- [ ] `sampled_accuracy` never renders without its provenance label
- [ ] Reports states the sample-size limitation on the page

## 8. Open questions

- **The ledger's `0.10.1` verdict contradicts §2.** Recorded at `88.9% ±2.4`, its
  band is `[86.5, 91.3]` and the baseline's is `[90.4, 94.4]`. They overlap, so
  `verdict()` returns `inconclusive` — but the ledger and §3 both label the bundle
  `discard`. No baseline in the ledger makes it separate, and the recorded interval
  is consistent with the formula at n=5, so it is the verdict label that is wrong
  rather than the width. To genuinely separate below it needed `±1.5` or tighter,
  which is n=12. Either the row is corrected to `inconclusive` or the experiment is
  re-run at higher n. INV-3 admits no third option, and the implementation computes
  `inconclusive` today.
- Should sampling be stratified by product type, loan size, or income complexity?
  Uniform under-samples exactly the files where an error is most expensive.
- Should previously-resolved files re-enter the blind sample to detect reviewer
  rubber-stamping? Argues yes; adds cost.
- Does Model Risk require a formal two-proportion test rather than interval
  overlap?
- What is the minimum corpus refresh cadence to keep the gap stable?
