"use client";

import { useState } from "react";

import { runnerOptions } from "@/lib/data/experiments";
import { BASELINE_ERR, BASELINE_MEAN, estimateRun } from "@/lib/estimate";

export type RunnerDefaults = {
  hypothesis: string;
  bundle: string;
  corpus: string;
  runs: string;
  grader: string;
};

export function ExperimentForm({ defaults }: { defaults: RunnerDefaults }) {
  const [hypothesis, setHypothesis] = useState(defaults.hypothesis);
  const [bundle, setBundle] = useState(defaults.bundle);
  const [corpus, setCorpus] = useState(defaults.corpus);
  const [runs, setRuns] = useState(defaults.runs);
  const [grader, setGrader] = useState(defaults.grader);
  const [guardrail, setGuardrail] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [queued, setQueued] = useState<string | null>(null);
  const [draft, setDraft] = useState(false);

  const parsed = Number.parseInt(runs, 10);
  const validRuns = !Number.isNaN(parsed) && parsed > 0;
  const estimate = estimateRun(validRuns ? parsed : 12);
  const locked = queued !== null;

  function run() {
    if (!hypothesis.trim()) {
      setError("A hypothesis is required — it becomes the first turn of the thread.");
      return;
    }
    if (!validRuns) {
      setError("Runs must be a whole number above zero.");
      return;
    }
    setError(null);
    setDraft(false);
    setQueued(
      `queued · ${parsed} runs of ${corpus.split(" — ")[0]} on ${bundle.split(" — ")[0]} · ${estimate.cost} estimated${guardrail ? " · autonomy guardrail on" : ""}`,
    );
  }

  function saveDraft() {
    if (!hypothesis.trim()) {
      setError("A hypothesis is required before this can be saved.");
      return;
    }
    setError(null);
    setDraft(true);
  }

  return (
    <>
      <div className="field" style={{ maxWidth: "74ch" }}>
        <label htmlFor="hypothesis">
          Hypothesis — this becomes the first turn of the thread
        </label>
        <textarea
          id="hypothesis"
          style={{ minHeight: "76px" }}
          value={hypothesis}
          disabled={locked}
          onChange={(event) => setHypothesis(event.target.value)}
        />
      </div>

      <div className="grid2" style={{ maxWidth: "74ch" }}>
        <div>
          <div className="field">
            <label htmlFor="bundle">Bundle</label>
            <select
              id="bundle"
              value={bundle}
              disabled={locked}
              onChange={(event) => setBundle(event.target.value)}
            >
              {runnerOptions.bundles.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="corpus">Corpus</label>
            <select
              id="corpus"
              value={corpus}
              disabled={locked}
              onChange={(event) => setCorpus(event.target.value)}
            >
              {runnerOptions.corpora.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <div className="field">
            <label htmlFor="runs">Runs</label>
            <input
              id="runs"
              inputMode="numeric"
              value={runs}
              disabled={locked}
              onChange={(event) => setRuns(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="grader">Grader</label>
            <select
              id="grader"
              value={grader}
              disabled={locked}
              onChange={(event) => setGrader(event.target.value)}
            >
              {runnerOptions.graders.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="callout c-acc" style={{ maxWidth: "74ch" }}>
        <div className="type">before you spend anything</div>
        <div className="q" style={{ fontSize: "13.5px" }}>
          Estimated {estimate.cost} and about {estimate.minutes} minutes. At{" "}
          {validRuns ? parsed : 12} runs the interval lands near ±{estimate.err} points —{" "}
          {estimate.separates
            ? `tight enough to separate from the ${BASELINE_MEAN}% baseline.`
            : `too wide to separate from the ${BASELINE_MEAN}% ±${BASELINE_ERR} baseline, so it would come back inconclusive.`}{" "}
          {validRuns && parsed > 5
            ? "At 5 runs it would land near ±1.9 and tell you nothing."
            : null}
        </div>
      </div>

      <label className="checkline" style={{ maxWidth: "74ch" }}>
        <input
          type="checkbox"
          checked={guardrail}
          disabled={locked}
          onChange={(event) => setGuardrail(event.target.checked)}
        />
        <span>
          Block a <span className="mono" style={{ margin: "0 4px" }}>keep</span> verdict if
          autonomy rises while sampled accuracy falls
        </span>
      </label>
      <p className="impact">
        Those two pull against each other. Every interrupt removed to raise autonomy is a
        case where the run now guesses instead of asking.
      </p>

      {error ? (
        <p className="impact" style={{ color: "var(--p-discard)" }} role="alert">
          {error}
        </p>
      ) : null}

      {draft ? (
        <p className="impact" role="status">
          Saved as a draft. Drafts sit in the rail until they are run — nothing reaches the
          ledger without runs behind it.
        </p>
      ) : null}

      {queued ? (
        <div
          className="verdictline"
          role="status"
          style={{ background: "var(--p-accent-bg)", color: "var(--p-accent)" }}
        >
          {queued}
        </div>
      ) : null}

      <div className="actions">
        <button className="btn pri" type="button" disabled={locked} onClick={run}>
          Run experiment
        </button>
        <button className="btn" type="button" disabled={locked} onClick={saveDraft}>
          Save as draft
        </button>
      </div>
    </>
  );
}
