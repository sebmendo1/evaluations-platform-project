# 05 · Governance and audit

How a bundle is reviewed, versioned, promoted, and defended to someone who was
not in the room.

Status: draft for review · Depends on: `02-domain-model.md`, `04-evaluation.md`

---

## Position

The bundle is the model artifact for model-risk purposes. Astro's job is not to
validate it — that is an independent function — but to make it **reviewable**:
legible, diffable, and traceable to the evidence that authorised it.

The test for this spec: a Model Risk reviewer who has never seen the product can
open Governance, understand what the agent does, see what changed since the last
version, and find the experiment that justified the change, without asking
anyone a question.

---

## 1. Bundle review surface

Sections, in reading order. Each is independently addressable and appears in the
right-hand section navigation.

| Section | Contains | Why a reviewer needs it |
|---|---|---|
| Bundle | Version, runtime, model, effort, repo, signer, status | Identity and provenance |
| Topology | Root and peers, with context policy | The isolation argument |
| Agents | Per-agent description, role, tools, context policy | What each component may see |
| Tools | 29 tools **grouped by function** | Capability surface |
| Skills | 14 skills mapped to procedure steps | The procedure itself |
| Policy cards | Referenced cards and their versions | Where thresholds live |
| Audit chain | One decision traced end to end | The examination artifact |

### Tools must be grouped

An undifferentiated wall of 29 tool names reads as alarming and communicates
nothing. Grouped, it reads correctly: nine of the twenty-nine are income
calculators, one per income type. Groups: files and context, peer agents, policy,
recording, derived figures, income calculators, adverse action.

### Skills must map to steps

The procedure has eight steps. Eight step skills plus six cross-cutting ones. If
a step has no skill, the run has no instructions for it — which is exactly the
defect that caused the 0.11.1 crash and had been latent since 0.9.2.

```
GIVEN a bundle where a procedure step has no corresponding skill
THEN Governance renders the gap explicitly rather than omitting it
AND the bundle cannot reach status `live`
```

---

## 2. Version switching and comparison

```
GIVEN a reviewer selects a different version
THEN the entire surface renders that version's contents
AND the selected version is stated persistently, not only in a dropdown
```

```
GIVEN a reviewer enters compare mode between two versions
THEN a change summary states the count and nature of changes
AND each changed section is marked in the section navigation
AND additions, removals and edits are marked inline in the body
AND the experiment that promoted the newer version is named with its evidence
```

The comparison is the highest-value view in Governance. "What changed and why"
is the question every reviewer arrives with, and answering it without a diff
means reading two documents side by side.

Diff granularity required: agent tool grants, skill added/removed/edited, policy
card version pins, model, runtime, reasoning effort.

---

## 3. The audit chain

The chain resolves **down** to evidence and **up** to authorisation:

```
Decision
 └ Field
    ├ source: document + page          (down: what it read)
    ├ verified by: checker             (down: who re-derived it)
    └ corrected by: user + timestamp   (down: who overrode it)
 └ Bundle version                       (up: what produced it)
    └ promoted by: Experiment           (up: what authorised it)
       └ evidence: accuracy, interval, n
```

INV-9. This is a screen, not a log file.

```
GIVEN any decision in the system
WHEN a reviewer opens its audit chain
THEN every field resolves to a page in a document or to a named formula and its inputs
AND the bundle version resolves to the experiment that promoted it
AND every human touch is named with a timestamp
```

**Coverage metric:** percentage of fields carrying a citation. Currently 99.4%,
with computed fields as the stated exception. Any decline in this number is a
correctness incident, not a reporting issue.

---

## 4. Promotion gate

A bundle moves `evaluated → live` only when all hold:

- [ ] Verdict is `keep` (`04 §2`)
- [ ] INV-4 gate passes — autonomy did not rise while sampled accuracy fell
- [ ] Every procedure step has a skill
- [ ] No skill text contains a numeric threshold (INV-8)
- [ ] Referenced policy card versions exist and are current
- [ ] Signed by a named bundle owner
- [ ] Model Risk review recorded, per their cadence

Failures are stated individually. A single "cannot promote" is not actionable.

## 5. Rollback

```
GIVEN a live bundle is rolled back
THEN the prior version returns to `live` and the rolled-back version becomes `retired`
AND decisions already stamped with the retired version are NOT altered (INV-6)
AND the rollback is written to the ledger with a reason
```

Retired is not deleted. A discarded or rolled-back bundle stays in Governance
permanently, because the decisions it produced are still in the book.

## 6. Acceptance criteria

- [ ] Section navigation is present, sticky, and marks changed sections in compare
- [ ] Compare mode diffs all six diffable dimensions listed in §2
- [ ] Tools render grouped; the flat list is not reachable
- [ ] Skill-to-step mapping is explicit, including gaps
- [ ] Audit chain resolves from any decision, in one screen
- [ ] Promotion gate enumerates every failing condition
- [ ] Citation coverage is displayed and alerts on decline

## 7. Open questions

- Does Model Risk require a formal challenger-model process, and does Astro host
  it or merely record it?
- Should policy card amendments proposed from `policy_judgment` interrupts appear
  in Governance, or only in Credit Policy's own tooling?
- What is the review cadence for a live bundle that has not changed — annual,
  or triggered by drift in sampled accuracy?
