# 00 · Constitution

The non-negotiables. Every other spec inherits these. A feature that violates an
invariant here is rejected at spec review, not at code review.

Status: draft for review · Owner: Sebastian Mendo · Last revised: Sep 3, 2026

---

## What Astro is

Astro is the control plane for agentic loan-file review. It runs an agent bundle
against loan folders at batch scale, stops when the agent cannot proceed on
evidence, routes that stop to a human, records the human's answer as both a
resolution and a labelled example, and measures whether the next bundle is
actually better.

Astro is not an underwriting agent. The agent is a versioned artifact that Astro
runs, measures, governs and deploys. Keeping that boundary sharp is what lets the
same platform run a second product line later without a rewrite.

## What Astro is not

- Not a decisioning engine. It executes a locked procedure; the policy lives in
  policy cards owned by Credit Policy.
- Not a document management system. It reads from the folder of record.
- Not a chatbot with a dashboard attached. Conversation is an interface to
  objects the platform already holds.

---

## Invariants

Numbered so specs can cite them. `INV-3` in an acceptance criterion means this
list.

**INV-1 · Every recorded field resolves to a source.**
A field is either extracted (document + page) or computed (named formula +
input field ids). No third category. A field with neither is a defect, not a
low-confidence value.

**INV-2 · Interrupts are typed.**
The agent may not emit a free-text request for help. It emits one of the
interrupt types in `03-interrupts.md` with a populated payload. An untypeable
situation is a gap in the type system, escalated as such.

**INV-3 · A verdict requires interval separation.**
An experiment may be marked `keep` or `discard` only if its confidence interval
does not overlap the baseline's. Overlap yields `inconclusive`. No exceptions,
no manual override, no "directionally positive."

**INV-4 · Autonomy may never rise at the cost of sampled accuracy.**
A bundle whose autonomy improves while sampled accuracy declines cannot be
promoted, regardless of graded accuracy. Removing an interrupt is only a gain if
the agent was right to stop asking.

**INV-5 · Mandatory escalations never auto-clear.**
Adverse action, and any other class Credit Policy designates, requires a named
human approval before the record is written. No confidence threshold, no
timeout, no bulk approve.

**INV-6 · The ledger is append-only.**
Experiments, batches, corrections and promotions are written once. Corrections
supersede; they do not overwrite. A crashed run and a discarded bundle stay in
the record permanently.

**INV-7 · Protected characteristics never enter reasoning.**
No prohibited-basis characteristic may appear in any agent context, worksheet
entry, reason string or adverse-action reason. Continuance analysis is
documented on its own terms.

**INV-8 · Thresholds live in policy cards, never in skill text.**
A skill that names a numeric threshold is a defect even when the number is
correct today. Skills describe procedure; cards hold values.

**INV-9 · Every decision is stamped with the bundle version that produced it,
and every bundle version links to the experiment that promoted it.**
This chain is the audit artifact. It is a feature with a screen, not a log.

**INV-10 · Production has no ground truth.**
Any figure labelled "accuracy" in a production context must be sourced from
blind human review and labelled `sampled`. Graded accuracy from the corpus may
never be displayed as a production measurement.

---

## Decision rules

When two goals conflict, resolve in this order:

1. **Correctness of the record** over everything.
2. **Traceability** over throughput. An untraceable fast answer is worthless in
   an examination.
3. **Human time** over agent cost. A minute of underwriter time costs far more
   than a dollar of inference; optimise the human side first.
4. **Honest measurement** over favourable measurement. Where a number can be
   presented two ways, present the less flattering one and say why.
5. **Throughput** last. It is the output of the four above, not an input.

## Design rules that follow

- An interrupt must be resolvable in under 30 seconds without opening the loan
  folder. If the reviewer has to read documents, the interrupt payload is
  incomplete. This is a spec bug, not a training issue.
- Anything the platform can re-derive is not stored. Anything a human stated is.
- Every metric on a screen names its provenance in the same visual unit as the
  number.
- The queue is an inbox with a completion state, not a monitor. If a screen has
  no zero state, it is the wrong screen.

## Open questions

- Who owns the interrupt type system — Product, Credit Policy, or jointly? A new
  type changes the reviewer's job and the corpus schema at once.
- Does INV-4 bind at promotion only, or continuously in production? A bundle can
  pass at promotion and drift.
- What is the retention period for the audit chain, and does it exceed the
  retention period of the loan file itself?
