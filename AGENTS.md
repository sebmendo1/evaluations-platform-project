<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Astro — working rules

[`specs/`](specs) is the source of truth. The UI follows from it, not the other way
around. Read [`specs/00-constitution.md`](specs/00-constitution.md) before changing
behaviour, and [`specs/README.md`](specs/README.md) for the reading order and the
precedence ladder.

## The four workflow rules

From `07 §How to use these specs`:

1. **A behaviour change starts as a spec edit**, reviewed by the owner named at the
   top of that file — not as a code edit that the spec later catches up with.
2. **Every `GIVEN/WHEN/THEN` becomes a test.** They live in [`tests/`](tests),
   numbered to match the spec they came from, each quoting the criterion.
3. **A metric enters `06-metrics.md` before it enters a screen.** In code that means
   [`src/lib/metrics.ts`](src/lib/metrics.ts): the registry is the gate, and the
   `<Metric>` component will not render an id it does not know.
4. **An invariant in `00` cannot be waived in a feature spec.** If one genuinely
   needs to change, that is a constitution change with its own review.

## The ten invariants

Cite these by number in a comment or a test name when code exists because of one.

- **INV-1** Every recorded field resolves to a source — extracted, computed or
  stated. No fourth shape. See [`src/lib/domain/provenance.ts`](src/lib/domain/provenance.ts).
- **INV-2** Interrupts are typed. Five values, closed set, no `other` and no free
  text. See [`src/lib/domain/interrupt.ts`](src/lib/domain/interrupt.ts).
- **INV-3** A verdict requires interval separation. Overlap yields `inconclusive`,
  with no override. Computed in [`src/lib/domain/verdict.ts`](src/lib/domain/verdict.ts)
  and never stored.
- **INV-4** Autonomy may never rise at the cost of sampled accuracy. Enforced at the
  promotion path in [`src/lib/domain/promotion.ts`](src/lib/domain/promotion.ts).
- **INV-5** Mandatory escalations never auto-clear. A named human approves, or the
  decision is not written.
- **INV-6** The ledger is append-only. Corrections supersede; they do not overwrite.
  A crash and a discard stay in the record permanently.
- **INV-7** Protected characteristics never enter reasoning.
- **INV-8** Thresholds live in policy cards, never in skill text. See
  [`src/lib/domain/policy-cards.ts`](src/lib/domain/policy-cards.ts).
- **INV-9** Every decision is stamped with the bundle that produced it, and every
  bundle links to the experiment that promoted it.
- **INV-10** Production has no ground truth. An accuracy figure in a production
  context must be blind-sampled and labelled `sampled`.

## Vocabulary

`02 · Naming` is binding in code, types and copy. The ones that get confused:

- **held** — a run stopped, waiting on a person. Not blocked, stuck or paused.
- **cleared** — the record is written. A file that stopped once and then finished is
  `cleared` with a non-zero interrupt count; there is no `resolved` state.
- **resolution** — a human answering an interrupt. **correction** — a human
  contradicting a run that never asked. These are different metrics and must not be
  merged.
- **verdict** — the computed outcome of an experiment. Not a score or a result.

## Design

[`specs/08-visual-language.md`](specs/08-visual-language.md), also loadable as a
skill at `.cursor/skills/astro-design/SKILL.md`. Brand tokens are governed by
[`specs/09-chase-brand.md`](specs/09-chase-brand.md).

The rules most easily lost: an interval plot rather than a trend line whenever n is
small; monospace for anything a machine produced, at every size; never bold, 500 is
the ceiling; no shadows anywhere; colour is state, never decoration; every chart
carries a takeaway and every surface reporting a metric says what it does not tell
you.

## Before you finish

```bash
npm test           # the spec criteria
npx tsc --noEmit
npm run lint
npm run build
```

The guard tests in [`tests/08-visual-language.test.ts`](tests/08-visual-language.test.ts)
and [`tests/06-metrics-dictionary.test.ts`](tests/06-metrics-dictionary.test.ts) fail
on a shadow, a font weight above 500, a metric outside the dictionary, a pooled
resolution time, or a chart without a takeaway. They are there so those rules do not
depend on anyone remembering them.

[`specs/CONFORMANCE.md`](specs/CONFORMANCE.md) records which acceptance criteria are
met, which are partial, and which are deferred with a reason. Update it when you move
one.
