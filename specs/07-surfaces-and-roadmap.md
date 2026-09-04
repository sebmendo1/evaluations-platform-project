# 07 · Surfaces and delivery

What screens exist, what each one owns, and the order they ship in.

Status: draft for review · Depends on: all preceding specs

---

## Part 1 · Surfaces

Astro is a notebook: an append-only ledger of what was tried and what happened,
with the current work as the newest entries. Production batches and eval
experiments live in the same log because they are the same object — a set of runs
against a bundle. The only difference is whether ground truth exists, which is
why one reports accuracy and the other reports autonomy.

### Surface map

| Surface | Landing object | Owns | Spec |
|---|---|---|---|
| **Overview** | The current state | Primary metrics, then held files, ledger and open attempts as sections | `06` |
| **Attempts** | The set of attempts | Board, timeline and list views over the loop | `04`, `01 §3` |
| **Experiments** | An experiment | Interval plot, gap chart, runner, field-failure matrix | `04` |
| **Governance** | A bundle version | Bundle review, version compare, audit chain | `05` |
| **Reports** | A period | Autonomy trend, interrupt economics, cost, compliance | `06` |
| **Batch** | A batch | 100+ files with filters, progress | `02` |
| **File** | One run | The transcript, with the interrupt as a paused turn | `03` |
| **Blind review** | A sampled file | Field-level agree or correct | `04 §4` |
| **Ask** | Nothing | Unscoped conversation | below |
| **Settings** | This device | Appearance, acting role, and who owns the rest | `01 §5` |

### Conversation is a surface, not an affordance

*Revised. An earlier version of this spec put a scoped composer on every surface,
re-scoping to the current object. That was removed.*

The transcript pane **is** the chat. A run's history and a conversation about that
run are the same thread, so there is no separate assistant to consult — and no
persistent input floating under every screen either. A composer on Reports invites
a question the platform cannot answer, and a composer under a file duplicates the
transcript it is already looking at.

So conversation has one home: **Ask**, a standalone thread bound to nothing, for
questions that do not have an object yet. It owns its own composer, which is the
hero of the empty state and docks once the thread starts.

Ask must be able to **act**, not only answer. The two highest-value operations in
the platform are not reachable by clicking anything:

- "Re-run the seven held loans on 0.12.0"
- "Start an attempt from the twenty conflicting extractions"

```
GIVEN a proposed action from conversation
THEN it is presented as an explicit confirmation with its scope and cost
AND it is never executed from inferred intent
```

Ask answers from the objects the platform already holds — the held count, the
autonomy rate, the computed verdict — rather than from a model. Where a question
falls outside that, it says so instead of improvising.

### Settings

Appearance and the acting role, both stored on the device. Everything else that
looks like a setting is owned by another function under `01 §5` and renders
read-only with its owner named: the sample rate is Compliance's, the thresholds
are Credit Policy's, and the autonomy guardrail has no switch at all because
INV-4 is enforced at the promotion path rather than configured.

### Overview

Leads with `cost_per_run`, `accuracy` and the file and run counts at full size,
with `autonomy_rate` and `held_count` secondary. Accuracy carries both figures in
its label because production has no ground truth and one number would be a lie
(INV-10). The counts are shown split rather than pooled, per `06 · runs`.

Below the metrics, a **secondary nav of counted pill tabs** over five sections: held
files, batches, blind review, the ledger, and open attempts. The metrics stay pinned
above the tabs because they are the state of the workspace, not one view of it.

Batches and blind review live here rather than in the rail. *Revised: an earlier
version gave each its own labelled rail group.* Both are current state you check
rather than places you navigate to and stay in, and Overview is the surface that owns
the current state. The rail keeps navigation between surfaces and the **Active loans**
list — held files of the current book. Attempts stay on Overview and `/attempts`; an
attempt is a hypothesis (`02 · Naming`), not a loan.

```
GIVEN a reviewer opens Overview
THEN the held queue is the default section
AND each section is addressable by URL so it survives a reload
```

### The rail

Navigation only, in one column: the Chase mark, the five primary surfaces, then
**Active loans** taking the remaining height and scrolling on its own, then Settings
at the foot clear of the bottom edge.

Each loan row is the borrower name and the product — `Reyes, M.` over `HELOC 2nd
lien` — so a reviewer can pick a file without decoding an experiment title or an id.
The loan ref stays on the row in mono because it is machine-produced. The heading
links to the held files of the current batch. Opening a row opens that file.

It carries no explanatory prose. An earlier version footed the rail with a sentence
explaining that a batch is a thread — that belongs beside the batches it describes,
which is where it now sits. An earlier version listed attempts here; that mixed two
vocabularies (`02`) and the titles were the hypothesis, not the loan.

```
GIVEN the rail is open
THEN the group heading reads Active loans
AND each row shows the borrower name and the loan product
AND a row opens that loan's file, not an attempt
```

### Breadcrumbs

The crumb trail is how a reviewer moves *within* a surface without going back to the
rail. Each segment that has children is a disclosure: the label goes to that level,
the caret lists every page underneath it. The trail is as deep as the object — a
held file is Overview › Active loans › the batch › the filter › the borrower › the
pause; an experiment is Overview › Experiments › the bundle › the section of the
write-up.

Active loans and Experiments are the two trees that earn this. Other surfaces keep
a short trail; they do not grow a caret of pages they do not own.

```
GIVEN a reviewer is on a held file
THEN the crumb trail is Overview › Active loans › the batch › held › the borrower › the pause
AND the Active loans caret lists every held loan by borrower and product
AND the batch caret lists every batch
AND the filter caret lists every filter on that batch
AND the borrower caret lists the other held files in that batch
```

```
GIVEN a reviewer is on an experiment
THEN the crumb trail is Overview › Experiments › the bundle › the write-up section
AND the Experiments caret lists New experiment, the attempts board, and every attempt
AND the bundle caret lists the other attempts
```

### Attempts

The loop in `01 §3` made legible in three views over the same six objects:

- **Board** — five columns: drafted, grading, inconclusive, kept, discarded. The
  columns are the lifecycle, so the shape of the board is the shape of the work.
- **Timeline** — drafted to decided in calendar days. The bars deliberately do not
  show machine time: runs take eighteen to forty-one minutes, and what takes days
  is deciding what to test and reading the result honestly.
- **List** — the same six as a table, for scanning rather than triage.

An attempt is described **in the language of the work**, not the language of the
change. It names the steps of the procedure it touches, what the run did before
and does now, and what it did to the reviewer's queue. File paths, diff counts and
command lines belong in Governance, where a model-risk reviewer needs the artifact;
they do not belong here, where the reader is an underwriter.

```
GIVEN an attempt
THEN it names the procedure steps it changed and the before and after of each
AND it states what it did, or would do, to the interrupt queue
AND its verdict is computed from the interval rather than stored
```

### Batch

The 100+ loan requirement. A batch is a thread and its files are turns, but a
thread of 108 turns is unusable — so the batch surface is a **console with
filters**: held, running, cleared, sampled, all. Default filter is held.

```
GIVEN a batch of 100+ files
THEN the default view shows only files needing a human, sorted by wait
AND filters reach every file without scrolling a transcript
AND opening a held file lands at the point the run paused
```

### The zero state is the design target

The queue is an inbox, not a monitor. A monitor with nothing wrong is a screen
people close, which means nobody is looking when something does go wrong. Every
queue surface must have a completion state that a person can reach.

---

## Part 2 · Delivery

### Phase 0 · Foundations

Ships nothing user-visible. Exists so later phases are not retrofits.

- Domain model per `02`, with provenance non-nullable from day one
- Append-only ledger at the storage layer, not the application layer
- Bundle versioning and stamping on every decision

**Gate:** a decision cannot be written without a bundle version and complete
field provenance. Verified by a test that attempts it.

### Phase 1 · The interrupt loop

**This is the product.** Nothing else matters if a human cannot clear a held file
in thirty seconds.

- All five interrupt types with payloads, evidence, impact
- Resolution UI per type
- Resolution → Case write path
- Batch console with filters
- Overview with the three metrics

**Gates:**
- Median resolution under 90 seconds for the three non-exempt types
- 100% of resolutions produce a case
- Held runs accrue zero cost
- Mandatory escalations cannot clear without a named approver

**Pilot shape:** one batch per day, one reviewer, shadow mode — the agent runs
and a human underwrites the same files independently. Compare, do not deploy.
This is also how `manual_baseline_minutes` gets measured properly.

### Phase 2 · Evaluation

- Experiment runner with pre-flight interval estimate
- `verdict()` with the INV-4 gate
- Corpus management, including production-resolution cases
- Interval plot and gap chart

**Gates:**
- No manual verdict path exists
- INV-4 gate blocks a promotion in test
- Pre-flight estimate precedes any authorised spend

### Phase 3 · Verification

- Blind sampler at agreed rate
- Field-level review UI
- `sampled_accuracy` with its limitation stated on the page
- Gap monitoring

**Gates:**
- Reviewers cannot distinguish sampled files from ordinary work
- `graded_accuracy` cannot render in a production context
- Compliance has signed off on the sample rate with a stated basis

Phase 3 is the gate for leaving shadow mode. Autonomous clearing without blind
verification is the confident-wrong exposure in `01 §6`, and it should not ship.

### Phase 4 · Governance

- Bundle review with right-side section navigation
- Version compare across all six diffable dimensions
- Audit chain screen
- Promotion gate enumerating every failing condition

**Gates:**
- A Model Risk reviewer completes a review unaided, observed
- Audit chain resolves from any decision in one screen

### Phase 5 · Reports and conversation

- The four report charts with written takeaways
- Compliance section
- Scoped composer and Ask
- Action confirmation flow

**Gates:**
- Every chart carries a takeaway sentence
- No pooled resolution-time metric exists
- Actions require explicit confirmation

### Phase 6 · Second surface

Prove the platform is a platform. A second HELOC surface — conditions clearing or
pre-qualification — reusing document-reader, checker, the interrupt types and
every screen, changing only skills and cards.

**Gate:** the second surface ships without modifying anything in `02` through
`06`. If it cannot, the abstraction did not hold and that is worth knowing before
anyone commits to a second product line.

---

## Cross-phase acceptance

Checked at every gate, not once:

- [ ] No metric on screen is undefined in `06`
- [ ] No accuracy figure renders without provenance
- [ ] No interrupt exists without evidence and impact
- [ ] No decision exists without a bundle version
- [ ] No promotion bypasses the INV-4 gate
- [ ] No adverse action clears without a named human

## How to use these specs

1. A change starts as an edit to a spec, reviewed by the owner named at the top.
2. Acceptance criteria are written before implementation and are testable — every
   `GIVEN/WHEN/THEN` in these files should become a test.
3. An invariant in `00` cannot be waived in a feature spec. If one genuinely
   needs to change, that is a constitution change with its own review.
4. A metric enters `06` before it enters a screen.
5. Open questions are tracked, not resolved silently. Each one in these files is
   a real decision someone has to make.

## Consolidated open questions

Carried forward from every spec, for one review pass:

**Ownership** — who owns the interrupt type system; who sets the sample rate.
**Statistics** — interval overlap or a formal test; stratified sampling;
minimum corpus refresh cadence.
**Scope** — INV-4 at promotion only or continuously; heterogeneous bundles in a
batch for canary; case difficulty tiers.
**Operational** — missing-document SLA; interrupt handoff between reviewers;
re-sampling resolved files to detect rubber-stamping.
**Regulatory** — retention period for the audit chain; challenger-model process;
review cadence for an unchanged live bundle.
**Organisational** — the bundle-owner role has no hiring pipeline and is the
main single point of failure in this plan.
