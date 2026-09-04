# 03 · Interrupts

The core primitive. If only one spec is implemented correctly, it is this one.

Status: draft for review · Depends on: `02-domain-model.md`

---

## Why typed

The naive design is: the agent says it is stuck, a human chats with it. That
fails three ways.

1. **Slow.** Free text requires the reviewer to reconstruct the situation.
2. **Unroutable.** A conflicting extraction can go to any reviewer; a policy
   judgment cannot. Without a type there is no routing.
3. **Unreusable.** Prose cannot be replayed as an eval case. The flywheel in
   `01 §3` dies, which removes the compounding value of the whole platform.

So: five types, closed set, each with a payload schema, a resolution UI, and a
case shape. INV-2.

## The 30-second rule

**An interrupt must be resolvable in under 30 seconds without opening the loan
folder.**

This is a hard design constraint, not a target. It follows from `01 §2`: human
minutes are the dominant cost, and a reviewer who must read documents is doing
the job the agent was supposed to do. If a type routinely breaches it, the
payload is under-specified and that is a spec defect.

The agent already holds everything needed. `document-reader` returns typed
extractions with page citations, so the evidence for a conflict is in hand
before the interrupt is raised. Rendering it is free.

Measured floor: `policy_judgment` runs about four minutes and always will,
because it is genuine deliberation. It is exempt from the 30-second rule and is
the only exempt type.

---

## Common shape

```
Interrupt {
  type       InterruptType
  question   string          # ONE sentence, ends in a question mark
  payload    TypedPayload
  evidence   Evidence[]
  impact     ImpactStatement
}

Evidence {
  label      string          # "credit report"
  page       int
  excerpt    string          # extracted value, never document text
  extractor  "document-reader"
}

ImpactStatement {
  field      FieldName
  before     scalar | null
  after      scalar[]        # one per candidate answer
  outcome_changes  boolean   # does the loan decision change?
  narrative  string          # one sentence
}
```

`impact.outcome_changes` is the triage signal. Most conflicts do not change the
outcome; telling the reviewer so is what keeps the queue moving. It must be
computed, never estimated in prose.

---

## Type 1 · `conflicting_extraction`

Two or more sources give different values for one field.

**Frequency:** 36% of interrupts. **Median resolution:** 41s. **Routing:** any reviewer.

```
payload: {
  field:      FieldName
  candidates: [{ value: scalar, source: Evidence }]   # 2..n
}
answer: { chosen_source: EvidenceRef } | { value: scalar, note: string }
```

**UI:** one row per candidate — value in monospace at display size, source and
page beneath, a single action. Plus a "neither" row that accepts a typed value.
No dropdowns.

```
GIVEN a run at step 4 with two monthly payments for one tradeline
WHEN the agent cannot determine the true source from policy
THEN it emits conflicting_extraction with both candidates and their page refs
AND the impact statement states the DTI under each and whether the outcome moves
AND the run enters `held` and accrues no further cost
```

```
GIVEN a reviewer selects a candidate
THEN the field is written with Stated provenance naming the reviewer
AND a Case is created in the `obligations-conflicts` corpus
AND the run resumes at the same step, not from the beginning
```

---

## Type 2 · `missing_document`

A document required by the step is absent from the folder.

**Frequency:** 19%. **Median resolution:** 2m 30s. **Routing:** any reviewer.

```
payload: {
  document_type: string
  required_by:   { step: int, reason: string }
  alternatives:  string[]     # what else could satisfy the requirement
}
answer: { uploaded: DocumentRef } | { unavailable: UnavailableReason }

UnavailableReason = not_provided | employer_refused | not_applicable | superseded
```

**UI:** an upload target, plus a reason select. The reason is a closed enum
because each value routes the step differently — `not_applicable` sends income
to the self-employment path, `superseded` does not.

Longer median than type 1 because the reviewer may have to go find the document.
That is legitimate work, not interrupt overhead.

```
GIVEN a required document is absent
THEN the payload names what the step needed it for and what would substitute
AND selecting `not_applicable` reroutes the step rather than failing the run
```

---

## Type 3 · `policy_judgment`

The situation falls outside what the policy card covers.

**Frequency:** 12%. **Median resolution:** 4m 10s. **Routing:** senior reviewer only.
**Exempt from the 30-second rule.**

```
payload: {
  card:       PolicyCardRef
  clause:     string          # the governing text, quoted
  gap:        string          # why the clause does not decide this
  options:    [{ label, consequence }]
}
answer: {
  ruling:            OptionRef
  rationale:         string           # REQUIRED
  propose_amendment: boolean
}
```

**UI:** the card clause quoted verbatim, the options with their consequences, a
required rationale field, and a checkbox to propose a card amendment.

`rationale` is required because this answer becomes the record. `propose_amendment`
is the mechanism by which the queue improves the policy rather than merely
absorbing its gaps — an amendment routes to Credit Policy for review.

```
GIVEN a policy judgment is resolved
THEN the rationale is written to the record as part of the decision
AND IF propose_amendment is set THEN a card amendment is queued for Credit Policy
AND the case is added to the corpus with the ruling as expected output
```

```
GIVEN a reviewer without the senior role opens a policy_judgment
THEN the resolution actions are unavailable and the reason is stated
```

---

## Type 4 · `mandatory_escalation`

Policy requires a human regardless of confidence. Today: adverse action.

**Frequency:** 8%. **Median resolution:** 3m 20s. **Routing:** senior reviewer only.

```
payload: {
  reason:        enum        # adverse_action | other Credit-Policy-designated
  drafted:       Decision
  reason_table:  AdverseReason[]      # each matched to a recorded finding
  fair_lending:  { scanned: true, flags: [] }
}
answer: { approve: true } | { edit: Decision } | { override: Decision, rationale: string }
```

**This type never auto-clears** (INV-5). No confidence threshold, no timeout, no
bulk approve. The UI must not offer a multi-select.

**UI:** the drafted decision as a field table, each adverse-action reason with the
finding it traces to, the fair-lending scan result, and three distinct actions.

```
GIVEN a run reaches step 8 with a counteroffer or decline
THEN it ALWAYS emits mandatory_escalation, regardless of confidence
AND the record is NOT written until a named human approves
AND the approval is stored on the Decision as approved_by
```

```
GIVEN an adverse reason cannot be matched to a recorded finding
THEN the interrupt states which reason is unsourced
AND approval is unavailable until it is resolved
```

---

## Type 5 · `low_confidence`

The checker could not re-derive a recorded value.

**Frequency:** 24%. **Median resolution:** 1m 12s. **Routing:** any reviewer.

```
payload: {
  field:       FieldName
  recorded:    scalar         # what the underwriter wrote
  rederived:   scalar         # what the checker computed
  difference:  scalar
  likely_cause: string | null # the checker's hypothesis, if it has one
}
answer: { take: "recorded" | "rederived" } | { value: scalar }
```

This type is a direct product of the checker's context isolation
(`02 · Agent.context_policy`). Because the checker never sees the documents, its
disagreement is evidence rather than an echo.

**UI:** the two figures side by side with the difference and the likely cause,
then two actions and a manual entry.

```
GIVEN the checker's re-derivation differs from the recorded value beyond tolerance
THEN low_confidence is emitted naming both figures and the difference
AND the likely cause is included when the checker can identify one
```

---

## What has no type

Deliberately absent, with reasons:

- **`agent_uncertain`.** Uncertainty is not a question. If the agent cannot say
  what it needs, the step's skill is under-specified.
- **`other`.** An untypeable situation is a gap in this spec. It escalates to the
  bundle owner as a spec defect and blocks the run; it does not become a text box.
- **`needs_review`.** Ambiguous, unroutable, and would become the default.

Adding a sixth type is a spec change requiring: a payload schema, a resolution
UI, a routing rule, a case shape, and a corpus. Not a config value.

---

## Routing

| Type | Any reviewer | Senior only |
|---|---|---|
| `conflicting_extraction` | ✓ | |
| `missing_document` | ✓ | |
| `low_confidence` | ✓ | |
| `policy_judgment` | | ✓ |
| `mandatory_escalation` | | ✓ |

Queue order is wait time within a routing class, not priority score. A priority
score would need tuning, would be gamed, and wait time is already the thing that
matters.

## Non-functional

| Requirement | Value |
|---|---|
| Interrupt render time | < 500ms from selection |
| Resume latency after resolution | < 3s to `running` |
| Payload completeness | 100% of interrupts carry evidence and impact |
| Cost while held | zero |
| Concurrent held runs | no platform limit; the limit is reviewer capacity |

## Metrics owned by this spec

- Interrupt volume by type, per period
- Median and p90 resolution time by type
- Interrupts per file (`1 − autonomy_rate` expressed per-file)
- Rate of interrupts breaching the 30-second rule, by type — **this is the
  spec's own health metric.** A rising rate means payloads are degrading.
- Reopen rate: resolutions later contradicted by blind review

## Acceptance criteria

- [ ] All five types emit with complete payloads in the reference bundle
- [ ] No code path can construct an interrupt without evidence and impact
- [ ] `outcome_changes` is computed from the policy card, never authored
- [ ] Senior-only types are unresolvable by other roles, enforced server-side
- [ ] Every resolution writes exactly one case; the write fails otherwise
- [ ] A held run accrues zero cost, verified in the cost ledger
- [ ] Median resolution time for the three non-exempt types is under 90 seconds
      at pilot, trending to the 30-second target

## Open questions

- **This spec contradicts itself on the 90-second gate.** The acceptance criteria
  require "median resolution time for the three non-exempt types under 90 seconds",
  but `§Type 2` records `missing_document` at 2m 30s and defends it as "legitimate
  work, not interrupt overhead" — because the reviewer may have to go and find the
  document. Both cannot hold. Either `missing_document` joins `policy_judgment` as
  exempt, or the criterion applies to the two types that are genuinely payload-bound
  (`conflicting_extraction` and `low_confidence`, at 41s and 1m 12s today, both of
  which pass). The measured data should not be adjusted to satisfy the checkbox.
- Should `conflicting_extraction` support a learned precedence rule that resolves
  automatically below a difference threshold? This is the 0.12.1 hypothesis. It
  raises autonomy and is exactly the change INV-4 exists to police.
- Does `missing_document` need an SLA that escalates to the borrower-facing team
  rather than sitting in the queue?
- Should reviewers be able to hand an interrupt to a colleague, and does that
  count as a resolution for timing purposes?
