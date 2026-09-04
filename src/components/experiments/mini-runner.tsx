"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { runnerOptions } from "@/lib/data/experiments";
import { estimateRun } from "@/lib/estimate";

/** The compact runner on the Experiments page. Hands its choices to the full
 *  runner rather than duplicating the submit path. */
export function MiniRunner() {
  const router = useRouter();
  const [bundle, setBundle] = useState(runnerOptions.bundles[0]);
  const [corpus, setCorpus] = useState(runnerOptions.corpora[0]);
  const [runs, setRuns] = useState("12");
  const [grader, setGrader] = useState(runnerOptions.graders[0]);

  const parsed = Number.parseInt(runs, 10);
  const estimate = estimateRun(Number.isNaN(parsed) ? 12 : parsed);

  function open() {
    const query = new URLSearchParams({ bundle, corpus, runs, grader });
    router.push(`/experiments/new?${query.toString()}`);
  }

  return (
    <>
      <div className="grid2" style={{ maxWidth: "76ch" }}>
        <div>
          <div className="field">
            <label htmlFor="mini-bundle">Bundle</label>
            <select
              id="mini-bundle"
              value={bundle}
              onChange={(event) => setBundle(event.target.value)}
            >
              {runnerOptions.bundles.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="mini-corpus">Corpus</label>
            <select
              id="mini-corpus"
              value={corpus}
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
            <label htmlFor="mini-runs">Runs</label>
            <input
              id="mini-runs"
              inputMode="numeric"
              value={runs}
              onChange={(event) => setRuns(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="mini-grader">Grader</label>
            <select
              id="mini-grader"
              value={grader}
              onChange={(event) => setGrader(event.target.value)}
            >
              {runnerOptions.graders.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <p className="impact">
        Estimated {estimate.cost}. At {Number.isNaN(parsed) ? 12 : parsed} runs the interval
        lands near ±{estimate.err} and{" "}
        {estimate.separates
          ? "can separate from baseline"
          : "would come back inconclusive again"}
        .
      </p>
      <div className="actions">
        <button className="btn pri" type="button" onClick={open}>
          Open full runner
        </button>
      </div>
    </>
  );
}
