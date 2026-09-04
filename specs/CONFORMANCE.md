# Conformance

Living record of which acceptance criteria in `01`–`09` the notebook currently
meets. Updated when a criterion moves from unmet to met, or the other way.
Partial means the surface exists and the criterion is visible, but a listed
exception applies.

| Criterion | Status | Evidence | Exception |
| --- | --- | --- | --- |
| AC-01.1 | met | `src/app/page.tsx` — four work-queues, one per role | — |
| AC-01.2 | met | Role switcher in `src/components/shell/role-switcher.tsx`; default reviewer | — |
| AC-01.3 | met | `/settings` — environment switcher | — |
| AC-01.4 | met | Interrupt queue is the default reviewer working surface | — |
| AC-01.5 | met | `/verify` as its own surface | — |
| AC-01.6 | met | `/attempts` — attempt ledger with cost | — |
| AC-01.7 | met | `/governance` — bundle lineage | — |
| AC-01.8 | met | `/reports` | — |
| AC-01.9 | met | Ask Astro (`src/components/ask/chat.tsx`) | — |
| AC-01.10 | unmet | PDF / printed memo | no print stylesheet yet |
| AC-02.1 | met | `src/lib/domain/interrupt.ts` — closed union, no `other` | — |
| AC-02.2 | met | `src/lib/domain/provenance.ts` | — |
| AC-02.3 | met | `src/lib/domain/verdict.ts` | — |
| AC-02.4 | met | `src/lib/domain/promotion.ts` | — |
| AC-02.5 | met | Ledger is append-only in `src/lib/store.ts` | — |
| AC-02.6 | met | INV-7: `src/lib/ask/respond.ts` refuses protected-characteristic prompts | — |
| AC-03.1 | met | Resolver does not offer a typed `other` | — |
| AC-03.2 | met | Mandatory interrupt cannot be dismissed from the resolver | — |
| AC-03.3 | met | `src/lib/domain/resolution.ts` — named `resolvedBy` | — |
| AC-03.4 | met | Held queue, filterable by type | — |
| AC-03.5 | met | INV-2 encoded in `INTERRUPT_TYPES` | — |
| AC-04.1 | met | `src/app/experiments/new/page.tsx` — control vs treatment, n, power | — |
| AC-04.2 | met | `src/lib/domain/verdict.ts` — overlap → `inconclusive` | — |
| AC-04.3 | met | Promotion form refuses autonomy-up / accuracy-down | — |
| AC-04.4 | met | Sampled-accuracy callout on `/reports` | — |
| AC-04.5 | met | `src/lib/domain/promotion.ts` | — |
| AC-05.1 | met | `/governance` — bundle → experiment | — |
| AC-05.2 | met | Decision stamp on `/decisions/[loanRef]` | — |
| AC-05.3 | met | Attempt chain on `/attempts/[attemptSlug]` | — |
| AC-05.4 | met | Corrections append; they do not overwrite | — |
| AC-05.5 | met | INV-9 on the decision surface | — |
| AC-06.1 | met | `src/lib/metrics.ts` — every reported id is in the dictionary | — |
| AC-06.2 | met | Metric component refuses unknown ids | — |
| AC-06.3 | met | Resolution time split by interrupt type | — |
| AC-06.4 | met | `/reports` never pools resolution time | — |
| AC-06.5 | met | Production accuracy labelled *sampled* | — |
| AC-07.1 | met | `src/app/page.tsx` — four queues | — |
| AC-07.2 | met | `/verify` | — |
| AC-07.3 | met | `/experiments/new` | — |
| AC-07.4 | met | `/governance` | — |
| AC-07.5 | met | Ask Astro | — |
| AC-07.6 | unmet | Print stylesheet for the memo | deferred, same as AC-01.10 |
| AC-08.1 | met | `src/app/globals.css` — Source Serif 4 + Source Code Pro | 
| AC-08.2 | met | Every `<Chart>` has a `takeaway` | — |
| AC-08.3 | met | *sampled* italic on `/reports` | — |
| AC-08.4 | met | `prefers-reduced-motion: reduce` → `0ms` in `globals.css` | — |
| AC-08.5 | met | Tables use `font-variant-numeric: tabular-nums` | — |
| AC-08.6 | met | Header has environment chip, no search/avatar/waffle | — |
| AC-08.7 | met | Chips are bordered, not filled | — |
| AC-08.8 | met | Guard test `tests/08-visual-language.test.ts` | — |
| AC-09.1 | met | Octagon in `src/components/shell/brand-mark.tsx` | — |
| AC-09.2 | met | Fallback stack in `globals.css` | — |
| AC-09.3 | met | Contrast values recorded in this spec | — |
| AC-09.4 | met | Mark stays `--ink` in production | — |
| AC-09.5 | unmet | woff2 self-host | still loading from fonts.google.com; self-host is the gap |
