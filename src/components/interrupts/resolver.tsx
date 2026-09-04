"use client";

import { useState } from "react";

import { useActingRole } from "@/components/shell/role-choice";
import {
  canResolve,
  requiresSenior,
  unsourcedAdverseReasons,
  type Interrupt,
} from "@/lib/domain/interrupt";
import { createResolution } from "@/lib/domain/resolution";
import { getRole } from "@/lib/domain/roles";
import { recordResolution, useIsResolved } from "@/lib/store/resolved";

import { Blocked, EvidenceList, Impact, OptionRow, Problem, Resolved } from "./parts";

type Draft = { answer: string; rationale?: string; amend?: boolean };

/**
 * One resolver, dispatching on the interrupt's type. Each branch renders the
 * payload 03 defines for that type; none of them renders a generic block list.
 *
 * The senior-only gate comes from 03 §Routing and states its reason rather than
 * hiding the controls, per the GIVEN block in 03 §Type 3.
 */
export function InterruptResolver({ interrupt }: { interrupt: Interrupt }) {
  const role = useActingRole();
  const profile = getRole(role);
  const already = useIsResolved(interrupt.id);

  const [chosen, setChosen] = useState<string | null>(null);
  const [rationale, setRationale] = useState("");
  const [unavailable, setUnavailable] = useState("");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [amend, setAmend] = useState(true);
  const [problem, setProblem] = useState<string | null>(null);

  const allowed = canResolve(interrupt.type, role);
  const locked = already !== undefined || !allowed;

  function commit(draft: Draft, outcome: string) {
    try {
      const { resolution, case: labelled } = createResolution({
        interruptId: interrupt.id,
        interruptType: interrupt.type,
        loanRef: interrupt.loanRef,
        step: interrupt.step,
        answer: draft.answer,
        rationale: draft.rationale ?? null,
        resolvedBy: profile.person,
        durationSec: interrupt.waitedSeconds,
      });
      recordResolution({ resolution, case: labelled, outcome });
      setProblem(null);
    } catch (error) {
      // The guarded write path refused. Surfacing the reason is the point.
      setProblem(error instanceof Error ? error.message : String(error));
    }
  }

  if (!allowed) {
    return (
      <>
        <EvidenceList evidence={interrupt.evidence} />
        <Impact impact={interrupt.impact} />
        <Blocked
          reason={`${interrupt.type.replace(/_/g, " ")} routes to a senior reviewer. You are acting as ${profile.label.toLowerCase()} (${profile.person}), so the resolution actions are unavailable. Change role in Settings to see them.`}
        />
      </>
    );
  }

  return (
    <>
      <EvidenceList evidence={interrupt.evidence} />

      {interrupt.payload.type === "conflicting_extraction" ? (
        <div className="opts">
          {interrupt.payload.candidates.map((candidate) => (
            <OptionRow
              key={candidate.value}
              value={candidate.value}
              source={`${candidate.source.label} · pg ${candidate.source.page}`}
              cta="Use this"
              selected={chosen === candidate.value}
              disabled={locked}
              onPick={() => {
                setChosen(candidate.value);
                commit(
                  { answer: candidate.value },
                  `recorded ${candidate.value} for ${interrupt.payload.type === "conflicting_extraction" ? interrupt.payload.field : ""} · file resumed at step ${interrupt.step}`,
                );
              }}
            />
          ))}
        </div>
      ) : null}

      {interrupt.payload.type === "low_confidence" ? (
        <>
          <div className="recdiff" style={{ maxWidth: "560px" }}>
            <div>
              <span className="k">recorded</span>
              <span>
                {interrupt.payload.recorded}{" "}
                <span style={{ color: "var(--p-ink-3)" }}>— underwriter</span>
              </span>
            </div>
            <div>
              <span className="k">re-derived</span>
              <span>
                {interrupt.payload.rederived}{" "}
                <span style={{ color: "var(--p-ink-3)" }}>— checker</span>
              </span>
            </div>
            <div>
              <span className="k">difference</span>
              <span className="v-dis">{interrupt.payload.difference}</span>
            </div>
            {interrupt.payload.likelyCause ? (
              <div>
                <span className="k">likely cause</span>
                <span>{interrupt.payload.likelyCause}</span>
              </div>
            ) : null}
          </div>
          <div className="opts">
            <OptionRow
              value={interrupt.payload.rederived}
              source="take the checker’s figure"
              cta="Use this"
              selected={chosen === interrupt.payload.rederived}
              disabled={locked}
              onPick={() => {
                const value =
                  interrupt.payload.type === "low_confidence"
                    ? interrupt.payload.rederived
                    : "";
                setChosen(value);
                commit({ answer: value }, `recorded ${value} · file resumed`);
              }}
            />
            <OptionRow
              value={interrupt.payload.recorded}
              source="keep the recorded figure"
              cta="Use this"
              selected={chosen === interrupt.payload.recorded}
              disabled={locked}
              onPick={() => {
                const value =
                  interrupt.payload.type === "low_confidence"
                    ? interrupt.payload.recorded
                    : "";
                setChosen(value);
                commit({ answer: value }, `recorded ${value} · file resumed`);
              }}
            />
          </div>
        </>
      ) : null}

      {interrupt.payload.type === "missing_document" ? (
        <>
          <p className="impact">
            Step {interrupt.payload.requiredBy.step} needs it because{" "}
            {interrupt.payload.requiredBy.reason}. Any of these would satisfy the
            requirement instead: {interrupt.payload.alternatives.join("; ")}.
          </p>
          <label className="drop" style={{ display: "block", cursor: "pointer" }}>
            {attachment
              ? `${attachment} — ready to attach`
              : `Drop the ${interrupt.payload.documentType} here, or browse`}
            <input
              type="file"
              className="sr-only"
              disabled={locked}
              onChange={(event) => {
                const picked = event.target.files?.[0];
                if (picked) setAttachment(picked.name);
              }}
            />
          </label>
          <div className="field" style={{ maxWidth: "420px" }}>
            <label htmlFor="unavailable">Or mark unavailable</label>
            <select
              id="unavailable"
              value={unavailable}
              disabled={locked}
              onChange={(event) => setUnavailable(event.target.value)}
            >
              <option value="">Choose a reason</option>
              <option value="not_provided">Borrower has not provided</option>
              <option value="employer_refused">Employer will not release</option>
              <option value="not_applicable">Not applicable — no wage income</option>
              <option value="superseded">Superseded by a later document</option>
            </select>
          </div>
          <div className="actions">
            <button
              className="btn pri"
              type="button"
              disabled={locked}
              onClick={() => {
                if (!attachment && !unavailable) {
                  setProblem(
                    "Attach the document or choose why it is unavailable — the step routes differently for each reason.",
                  );
                  return;
                }
                const answer = attachment ?? unavailable;
                commit(
                  { answer },
                  attachment
                    ? `${attachment} attached · income re-verified · file resumed`
                    : `marked ${unavailable.replace(/_/g, " ")} · step rerouted · file resumed`,
                );
              }}
            >
              Save and resume
            </button>
          </div>
        </>
      ) : null}

      {interrupt.payload.type === "policy_judgment" ? (
        <>
          <div className="quote">{interrupt.payload.clause}</div>
          <p className="impact">{interrupt.payload.gap}</p>
          <div className="opts">
            {interrupt.payload.options.map((option) => (
              <OptionRow
                key={option.label}
                value={option.label}
                source={option.consequence}
                cta="Rule this way"
                selected={chosen === option.label}
                disabled={locked}
                onPick={() => setChosen(option.label)}
              />
            ))}
          </div>
          <div className="field" style={{ maxWidth: "520px" }}>
            <label htmlFor="rationale">Reasoning — this becomes the record</label>
            <textarea
              id="rationale"
              value={rationale}
              disabled={locked}
              placeholder="An 8% gap is within tolerance for this county given three comparable sales…"
              onChange={(event) => setRationale(event.target.value)}
            />
          </div>
          <label className="checkline">
            <input
              type="checkbox"
              checked={amend}
              disabled={locked}
              onChange={(event) => setAmend(event.target.checked)}
            />
            <span>
              Propose an amendment to the collateral policy card so the next file does
              not stop here
            </span>
          </label>
          <div className="actions">
            <button
              className="btn pri"
              type="button"
              disabled={locked}
              onClick={() => {
                if (!chosen) {
                  setProblem("Choose how to rule before recording it.");
                  return;
                }
                commit(
                  { answer: chosen, rationale },
                  `ruling recorded · ${chosen}${amend ? " · amendment proposed to Credit Policy" : ""}`,
                );
              }}
            >
              Record ruling
            </button>
          </div>
        </>
      ) : null}

      {interrupt.payload.type === "mandatory_escalation" ? (
        <>
          <div className="recdiff" style={{ maxWidth: "560px" }}>
            <div>
              <span className="k">outcome</span>
              <span>{interrupt.payload.drafted.outcome}</span>
            </div>
            <div>
              <span className="k">requested</span>
              <span>{interrupt.payload.drafted.lineRequested}</span>
            </div>
            <div>
              <span className="k">supportable</span>
              <span>{interrupt.payload.drafted.lineSupportable}</span>
            </div>
          </div>

          <div className="reasons">
            <div className="reasons-h">
              Each reason must trace to a recorded finding (INV-5)
            </div>
            {interrupt.payload.reasonTable.map((reason) => (
              <div className="reasons-row" key={reason.reason}>
                <span>{reason.reason}</span>
                {reason.finding ? (
                  <span className="v-keep mono">{reason.finding}</span>
                ) : (
                  <span className="v-dis">unsourced</span>
                )}
              </div>
            ))}
            <div className="reasons-row">
              <span>Fair-lending scan</span>
              <span className="v-keep">
                {interrupt.payload.fairLending.flags.length === 0
                  ? "passed · no prohibited basis in the reasoning"
                  : `${interrupt.payload.fairLending.flags.length} flags`}
              </span>
            </div>
          </div>

          <div className="actions">
            <button
              className="btn pri"
              type="button"
              disabled={locked}
              onClick={() => {
                if (interrupt.payload.type !== "mandatory_escalation") return;
                const unsourced = unsourcedAdverseReasons(interrupt.payload);
                if (unsourced.length > 0) {
                  setProblem(
                    `“${unsourced[0]}” does not trace to a recorded finding. Approval is unavailable until it does.`,
                  );
                  return;
                }
                commit(
                  { answer: "approve" },
                  `counteroffer approved by ${profile.person} · adverse-action notice queued`,
                );
              }}
            >
              Approve and send
            </button>
            <button className="btn" type="button" disabled={locked}>
              Edit reasons
            </button>
            <button
              className="btn dan"
              type="button"
              disabled={locked}
              onClick={() =>
                commit(
                  { answer: "decline" },
                  `declined by ${profile.person} · reasons rewritten for a decline`,
                )
              }
            >
              Decline instead
            </button>
          </div>
        </>
      ) : null}

      <Impact impact={interrupt.impact} />

      {problem ? <Problem text={problem} /> : null}

      {already ? (
        <>
          <Resolved
            text={already.outcome}
            tone={already.resolution.answer === "decline" ? "discard" : "keep"}
          />
          <p className="trace">
            Written as case <span className="mono">{already.case.id}</span> in the{" "}
            <span className="mono">{already.case.corpus}</span> corpus, labelled by{" "}
            <span className="mono">{already.resolution.resolvedBy}</span>. Every
            resolution produces exactly one case — that is the flywheel, and the write
            is rejected without it.
          </p>
        </>
      ) : null}

      {requiresSenior(interrupt.type) ? (
        <p className="trace">
          This type never clears on its own, whatever the confidence. A named human
          approval is recorded on the decision.
        </p>
      ) : null}
    </>
  );
}
