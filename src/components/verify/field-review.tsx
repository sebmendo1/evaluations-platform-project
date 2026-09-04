"use client";

import { useState } from "react";

import { EmptyState } from "@/components/empty-state";
import type { VerifyField } from "@/lib/data/verify";

type Status = "pending" | "agreed" | "corrected";
type Entry = { status: Status; value: string };

const OPEN_SUBJECTS = ["HL-40012", "HL-39988"];

/** The one field the run got wrong confidently — pre-marked so the sample has a
 *  correction in it from the start, as in the concept. */
const KNOWN_CORRECTION = "$38,050";

function initialState(fields: VerifyField[], seeded: boolean) {
  const entries: Record<string, Entry> = {};
  fields.forEach((field, index) => {
    if (!seeded) {
      entries[field.name] = { status: "pending", value: "" };
      return;
    }
    if (index < 2) {
      entries[field.name] = { status: "agreed", value: "" };
      return;
    }
    if (field.status === "flag") {
      entries[field.name] = { status: "corrected", value: KNOWN_CORRECTION };
      return;
    }
    entries[field.name] = { status: "pending", value: "" };
  });
  return entries;
}

export function FieldReview({ fields, subject }: { fields: VerifyField[]; subject: string }) {
  const [subjectIndex, setSubjectIndex] = useState(
    Math.max(0, OPEN_SUBJECTS.indexOf(subject)),
  );
  const [entries, setEntries] = useState(() => initialState(fields, true));
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [drawn, setDrawn] = useState(1);
  const currentSubject = OPEN_SUBJECTS[subjectIndex];
  const exhausted = drawn >= OPEN_SUBJECTS.length && submitted !== null;
  const reviewed = Object.values(entries).filter((entry) => entry.status !== "pending").length;
  const corrections = Object.values(entries).filter(
    (entry) => entry.status === "corrected",
  ).length;

  function set(name: string, next: Entry) {
    setEntries((current) => ({ ...current, [name]: next }));
    setSubmitted(null);
    setError(null);
  }

  function submit() {
    if (reviewed < fields.length) {
      setError(
        `${fields.length - reviewed} of ${fields.length} fields still need a call before this review can be submitted.`,
      );
      return;
    }
    const missing = Object.entries(entries).find(
      ([, entry]) => entry.status === "corrected" && !entry.value.trim(),
    );
    if (missing) {
      setError(`Enter the true value for ${missing[0]} before submitting.`);
      return;
    }
    setError(null);
    setNote(null);
    setSubmitted(
      `${currentSubject} submitted · ${fields.length} fields · ${corrections} correction${corrections === 1 ? "" : "s"}`,
    );
  }

  function drawAnother() {
    const next = (subjectIndex + 1) % OPEN_SUBJECTS.length;
    setSubjectIndex(next);
    setDrawn((count) => count + 1);
    setEntries(initialState(fields, false));
    setSubmitted(null);
    setError(null);
    setNote(
      `Drew ${OPEN_SUBJECTS[next]} at random from the 93 clean files. The reviewer is not told which files are sampled.`,
    );
  }

  // 00 §Design rules · the queue is an inbox with a completion state. Both open
  // reviews submitted means there is nothing to draw until the sampler runs again.
  if (exhausted) {
    return (
      <EmptyState
        tone="keep"
        icon={
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4}>
            <path d="M3 8.5 6.5 12 13 4.5" />
          </svg>
        }
        heading="Both open reviews submitted"
        action={
          <button className="btn" type="button" onClick={() => setDrawn(1)}>
            Draw again anyway
          </button>
        }
      >
        The sampler draws 5% of clean files, so the next one arrives with the next batch
        rather than on demand. Corrections filed here go to the corpus, which is what
        makes the next eval run have to get them right.
      </EmptyState>
    );
  }

  return (
    <>
      <div className="sechead">
        <h2 className="mono">{currentSubject}</h2>
        <span className="h">
          {fields.length} fields · reviewed {reviewed} of {fields.length}
        </span>
      </div>

      <div className="wrap">
        {fields.map((field) => {
          const entry = entries[field.name];
          const rowClass =
            entry.status === "agreed"
              ? "frow done"
              : entry.status === "corrected"
                ? "frow flag"
                : "frow";

          return (
            <div className={rowClass} key={field.name}>
              <span className="fn">{field.name}</span>
              <span className="fv">{field.value}</span>
              <span className="fs">{field.source}</span>

              {entry.status === "agreed" ? (
                <span className="v-keep" style={{ fontSize: "12px", marginLeft: "auto" }}>
                  agreed
                </span>
              ) : null}

              {entry.status === "corrected" ? (
                <span className="fa">
                  <input
                    aria-label={`True value for ${field.name}`}
                    className="mono"
                    value={entry.value}
                    placeholder="true value"
                    onChange={(event) =>
                      set(field.name, { status: "corrected", value: event.target.value })
                    }
                    style={{
                      font: "inherit",
                      fontSize: "12px",
                      width: "110px",
                      padding: "2px 6px",
                      borderRadius: "5px",
                      border: "1px solid var(--p-discard)",
                      background: "var(--p-paper)",
                      color: "var(--p-ink)",
                    }}
                  />
                  <button onClick={() => set(field.name, { status: "pending", value: "" })}>
                    Undo
                  </button>
                </span>
              ) : null}

              {entry.status === "pending" ? (
                <span className="fa">
                  <button onClick={() => set(field.name, { status: "agreed", value: "" })}>
                    Agree
                  </button>
                  <button onClick={() => set(field.name, { status: "corrected", value: "" })}>
                    Correct
                  </button>
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <p className="impact">
        InvestmentAccounts came back $41,300 against a statement showing $38,050 — the run
        read a prior-quarter page. Nothing flagged it, and the file cleared with no
        interrupt. That’s the one correction in this sample.
      </p>

      {error ? (
        <p className="impact" style={{ color: "var(--p-discard)" }} role="alert">
          {error}
        </p>
      ) : null}

      {note ? (
        <p className="impact" role="status">
          {note}
        </p>
      ) : null}

      {submitted ? (
        <div
          className="verdictline"
          role="status"
          style={{ background: "var(--p-keep-bg)", color: "var(--p-keep)" }}
        >
          {submitted}
        </div>
      ) : null}

      <div className="actions">
        <button className="btn pri" type="button" onClick={submit}>
          Submit review
        </button>
        <button
          className="btn"
          type="button"
          onClick={() =>
            setNote(
              corrections > 0
                ? `${corrections} correction${corrections === 1 ? "" : "s"} queued for the graded corpus, so the next eval run has to get ${corrections === 1 ? "it" : "them"} right.`
                : "No corrections in this review, so there is nothing to send to the corpus.",
            )
          }
        >
          Send correction to corpus
        </button>
        <button className="btn" type="button" onClick={drawAnother}>
          Draw another file
        </button>
      </div>
    </>
  );
}
