# 02 · Domain model

The objects, their states, and the contracts between them. Every feature spec
references entities defined here; nothing invents a new noun.

Status: draft for review · Depends on: `00-constitution.md`

---

## Entity map

```
Bundle ──promoted by──> Experiment ──runs on──> Corpus ──contains──> Case
  │                          │
  │ stamps                   │ produces
  ▼                          ▼
Decision <──writes── Run ──emits──> Interrupt ──resolved by──> Resolution
  │                    │                                          │
  │ composed of        │ belongs to                               │ becomes
  ▼                    ▼                                          ▼
 Field              Batch                                       Case
  │
  │ verified by
  ▼
Review (blind sample)
```

Two facts drive most of the design. A **Resolution becomes a Case** — that is
the flywheel. And a **Decision stamps a Bundle** — that is the audit chain.

---

## Bundle

The versioned agent artifact. The unit of governance and the unit of deployment.

```
Bundle {
  version          semver        # 0.12.0
  name             string        # "HELOC File Review v2"
  runtime          string        # smart-sdk v3
  model            string        # opus-5
  reasoning_effort enum          # low | medium | high | xhigh
  agents           Agent[]
  skills           Skill[]
  policy_cards     PolicyCardRef[]
  repo_path        string
  signed_by        UserId
  signed_at        timestamp
  promoted_by      ExperimentId | null
  status           enum          # draft | evaluated | live | retired
}
```

Rules:
- A bundle with `status = live` MUST have a non-null `promoted_by` (INV-9).
- `policy_cards` are references. A card's contents are owned by Credit Policy and
  versioned separately; a bundle pins card versions but does not contain them
  (INV-8).
- Model and runtime are pinned per bundle. Changing either is a bundle change
  requiring its own experiment.

## Agent

```
Agent {
  name             string        # underwriter | document-reader | checker
  role             enum          # root | peer
  model            string | inherit
  tools            ToolName[]
  context_policy   enum          # full | documents_only | worksheet_only
}
```

`context_policy` is load-bearing. `checker` is `worksheet_only` — it sees
recorded entries and acceptance criteria and never the source documents. That
isolation is what makes its agreement evidence rather than an echo.

## Batch

A set of loan files submitted together.

```
Batch {
  id               string        # batch-0903-am
  bundle_version   semver
  submitted_at     timestamp
  files            Run[]
  status           enum          # running | closed
}
```

## Run

One agent execution against one loan folder. Also used for graded eval runs; the
discriminator is `corpus_case_id`.

```
Run {
  id               string
  loan_ref         string        # HL-40128
  corpus_case_id   CaseId | null # non-null ⇒ this is a graded eval run
  bundle_version   semver
  batch_id         BatchId | null
  state            RunState
  current_step     1..8
  cost             money
  turns            int
  started_at       timestamp
  cleared_at       timestamp | null
}
```

### RunState

```
queued ──> running ──> cleared
              │  ▲
              │  └──── resumed ────┐
              ▼                    │
            held ──────────────────┘
              │
              └──> crashed
```

| State | Meaning | Exit |
|---|---|---|
| `queued` | Accepted, not started | → running |
| `running` | Executing a step | → held, cleared, crashed |
| `held` | Emitted an Interrupt, awaiting a human | → running on Resolution |
| `cleared` | Final record written | terminal |
| `crashed` | Runtime or bundle failure, no record | terminal |

Rules:
- A run in `held` consumes no inference and accrues no cost.
- `cleared` requires every step marked and the final record code-validated.
- A run may enter `held` more than once. Wait time accrues per interrupt, not per
  run.

## Field

The atomic unit of the record.

```
Field {
  name             string        # DebtToIncomeRatio
  value            scalar
  provenance       Provenance
  step             1..8
  checker_status   enum          # agreed | could_not_derive | not_applicable
}

Provenance =
  | Extracted { document: string, page: int, extractor: "document-reader" }
  | Computed  { formula: string, inputs: FieldName[] }
  | Stated    { by: UserId, at: timestamp, resolution: ResolutionId }
```

INV-1: `provenance` is non-nullable and has exactly these three shapes. A field
whose provenance cannot be constructed is a defect, not a low-confidence value.

`Stated` provenance is how a human correction enters the record and is what makes
the audit chain resolve to a person.

## Interrupt

The core primitive. Full specification in `03-interrupts.md`; the shape only here.

```
Interrupt {
  id               string
  run_id           RunId
  type             InterruptType     # 5 values, closed set
  step             1..8
  question         string            # one sentence, human-readable
  payload          TypedPayload      # varies by type
  evidence         Evidence[]        # everything needed to answer
  impact           ImpactStatement   # what changes, and whether outcome changes
  raised_at        timestamp
  resolution       Resolution | null
}
```

INV-2: `type` is a closed enum. There is no `other`.

## Resolution

```
Resolution {
  interrupt_id     InterruptId
  answer           TypedAnswer       # shape determined by interrupt type
  rationale        string | null     # required for policy_judgment
  resolved_by      UserId
  resolved_at      timestamp
  duration_sec     int
  case_id          CaseId            # every resolution produces a case
}
```

`case_id` is non-nullable. A resolution that does not produce a case is a broken
flywheel and the write is rejected.

## Case

A labelled example in the eval corpus.

```
Case {
  id               string
  corpus           string            # obligations-conflicts | heloc-150 | …
  origin           enum              # production_resolution | blind_review | authored
  input            CaseInput         # folder ref + the state at the stop point
  expected         TypedAnswer       # the human's answer
  labelled_by      UserId
  labelled_at      timestamp
}
```

Cases from `production_resolution` are the strategic asset described in `01 §3`.

## Experiment

```
Experiment {
  id               string
  hypothesis       string            # required, prose, becomes turn 1 of thread
  bundle_version   semver
  corpus           string
  n_runs           int
  grader           enum              # strict | tolerant
  result           ExperimentResult | null
  status           enum              # draft | running | complete | crashed
}

ExperimentResult {
  accuracy         float
  interval         float             # ± at 95%
  fields_graded    int
  cost             money
  verdict          Verdict
}

Verdict = keep | discard | inconclusive | crash | baseline
```

Verdict derivation is specified in `04-evaluation.md` and is computed, never
entered. INV-3.

## Review

A blind verification of a cleared file.

```
Review {
  id               string
  run_id           RunId
  drawn_at         timestamp
  fields           FieldVerdict[]    # agreed | corrected, per field
  reviewer         UserId
  submitted_at     timestamp | null
}
```

The reviewer is not told the file was drawn as a sample. See `04-evaluation.md §4`.

## Decision

The written outcome of a cleared run.

```
Decision {
  run_id           RunId
  outcome          enum              # approve | counteroffer | decline
  line_supportable money
  conditions       string[]
  adverse_reasons  AdverseReason[]   # non-empty ⇒ requires INV-5 approval
  bundle_version   semver            # INV-9
  approved_by      UserId | null     # non-null iff adverse_reasons non-empty
}
```

---

## Contracts between entities

| Contract | Rule | Enforced where |
|---|---|---|
| Resolution → Case | Every resolution writes exactly one case | Write path, non-nullable FK |
| Decision → Bundle | Every decision stamps a live bundle version | Write path |
| Bundle → Experiment | Every live bundle names its promoting experiment | Promotion gate |
| Field → Provenance | Non-nullable, one of three shapes | Record validator |
| Adverse reasons → Approval | Non-empty reasons require a named approver | INV-5 gate |
| Ledger entries | Append-only; corrections supersede | Storage layer, not application |

## Naming

Astro's vocabulary, used consistently in UI, API and conversation:

| Term | Means | Not |
|---|---|---|
| **held** | run stopped, waiting on a human | blocked, stuck, paused |
| **cleared** | record written, no human needed | done, complete, approved |
| **interrupt** | one typed question from a run | request, exception, task |
| **resolution** | a human's answer to an interrupt | correction, override |
| **correction** | a human changing a field in blind review | resolution |
| **attempt / experiment** | one hypothesis tested at n runs | test, trial |
| **bundle** | the versioned agent artifact | model, config, agent |
| **verdict** | the computed outcome of an experiment | result, score |

Resolution and correction are deliberately different words. One unblocks a run;
the other contradicts a run that never asked. They mean different things for
accuracy and must not be merged in any metric.

## Open questions

- Does a `Case` need a difficulty or tier attribute? Reports currently cannot
  split accuracy by complexity, which was already flagged as pending in v1.
- Should `Batch` support heterogeneous bundle versions for canary deployment, or
  is one bundle per batch a permanent constraint?
- Is `Stated` provenance sufficient for examination, or does a correction need
  to retain the superseded value inline rather than only in the ledger?
