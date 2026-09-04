# 06 · Metrics dictionary

Single source of truth for every number Astro displays. A metric that is not
defined here may not appear on a screen.

Status: draft for review · Depends on: `04-evaluation.md`

---

## Rule of provenance

**Every metric renders with its provenance in the same visual unit as the
number.** Not in a tooltip, not in a footnote. `95.1% sampled` and `96.4% graded`
are different metrics that happen to share a word, and merging them is the single
most likely way this platform ends up misleading someone senior.

---

## Primary metrics

### `autonomy_rate`

```
autonomy_rate = files_cleared_with_zero_interrupts / files_cleared
```

**The business metric** (`01 §3`). Denominator is cleared files, not submitted —
crashed and held files are excluded. A file that had one interrupt and cleared
counts as 0 in the numerator, not 0.9; autonomy is binary per file.

Never displayed without `sampled_accuracy` nearby (INV-4).

### `cost_per_run`

```
cost_per_run = total_inference_cost / runs_completed
```

Held runs accrue no cost. Reported alongside `human_minutes_per_file`, because
cost per run alone systematically understates the real number by the more
expensive half.

### `runs`

Context-dependent and must be labelled:

| Context | Means |
|---|---|
| Queue / batch | Loan files in the batch |
| Lab / experiments | Graded eval runs |
| Overview | Both, stated separately |

Never display a single unlabelled "runs" figure that pools the two.

### `graded_accuracy` and `interval`

```
graded_accuracy = fields_correct / fields_graded          # on a labelled corpus
interval        = ± at 95%
```

Lab contexts only (INV-10). Never renders without its interval — a point estimate
without a width is the specific mistake this platform exists to stop making.

### `sampled_accuracy`

```
sampled_accuracy = fields_agreed / fields_reviewed_blind
```

The only production accuracy figure. Must render with `n` fields reviewed, and
where `n` is small, with the limitation stated on the page (`04 §4`).

### `held_count`

Runs currently in `held`. Paired with the oldest wait time, because a count with
no age is not actionable.

---

## Derived and operational

| Metric | Definition | Notes |
|---|---|---|
| `human_minutes_per_file` | `(interrupt_minutes + review_minutes) / files` | The real cost driver |
| `interrupt_rate_by_type` | interrupts of type / total interrupts | Volume, not burden |
| `resolution_time` | median and p90, **by type** | Never pooled — see below |
| `time_to_clear` | `cleared_at − started_at`, excluding held time | Held time is queue wait, not work |
| `gap` | `graded_accuracy − sampled_accuracy` | Monitored signal (`04 §5`) |
| `citation_coverage` | fields with a source / total fields | Correctness metric, not reporting |
| `escalation_approval_rate` | approved / escalated | Must be < 100%; 100% means rubber-stamping |
| `runs_to_verdict` | n at which an experiment separated | Planning input for the runner |

### `resolution_time` must never be pooled

Median resolution time across types is meaningless and actively harmful, because
it varies by an order of magnitude by type (41s to 4m10s) and reviewers do not
handle the same mix. A reviewer taking longer per item is usually taking the
judgment calls. **A report that ranks reviewers on pooled resolution time is
measuring the queue, not the person**, and would push senior reviewers to avoid
the work only they can do.

---

## Metrics deliberately absent

| Not built | Why |
|---|---|
| Confidence score per field | Uncalibrated, would be trusted, has no ground truth to calibrate against |
| Reviewer leaderboard | See above; incentivises the wrong selection |
| Composite "quality score" | Hides the trade-off between autonomy and accuracy that INV-4 exists to police |
| Straight-through-processing % | Same as `autonomy_rate` with a name that implies a different denominator |
| Accuracy trend line | With n=5 per bundle the intervals overlap; a line implies progress the data does not support. Use the interval plot |

That last one is a design decision with history: the original Astro overview led
with a rising accuracy line over three statistically indistinguishable runs. The
interval plot exists specifically so overlap is visible rather than smoothed.

---

## Display rules

1. Provenance label adjacent to the number, always.
2. Point estimates from graded runs always carry their interval.
3. Small-n figures state their n.
4. Percentages that pool different denominators are not permitted — split them.
5. A metric with no defined action is not on the dashboard.
6. Charts state their takeaway in prose beneath them. If the takeaway cannot be
   written in a sentence, the chart is not carrying information.

## Chart selection

| Data shape | Use | Do not use |
|---|---|---|
| Few points with uncertainty | Interval plot | Line chart |
| Change over many periods | Line, with deploy markers | Bar |
| Composition of a total | Horizontal bars, sorted | Pie, donut |
| Distribution | Histogram with populated buckets only | Fixed 10-bucket grid |
| Two measures per category | Paired dots with a connector | Grouped bars |

Axis rules: never auto-zoom a flat series into a dramatic slope; never render
duplicate tick labels from integer rounding; state the axis floor when it is not
zero.

## Open questions

- **`autonomy_rate`'s denominator was not what the prototype displayed.** The
  definition here is unambiguous — cleared files, with held and crashed excluded —
  but the figure shown was `cleared / submitted`, which is a different and more
  flattering number. Resolved in the implementation by modelling the interrupt count
  per run, so a file that stopped once and then finished counts as zero in the
  numerator. Worth noting because the two readings differ by 14 points on the same
  batch, and the looser one is the one that reads better in a steering committee.

## Acceptance criteria

- [ ] Every displayed metric maps to an entry in this file
- [ ] Provenance labels are enforced in the component, not left to the caller
- [ ] `graded_accuracy` cannot render in a production context
- [ ] `resolution_time` cannot render pooled across types
- [ ] No composite score exists anywhere in the codebase
