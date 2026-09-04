import Link from "next/link";

import {
  ExperimentForm,
  type RunnerDefaults,
} from "@/components/experiments/experiment-form";
import { runnerOptions } from "@/lib/data/experiments";

export const metadata = {
  title: "New experiment",
};

const DEFAULT_HYPOTHESIS =
  "Sixteen of twenty obligation conflicts resolved to the lender statement. Add a source-precedence rule to step 4 so the run only asks when the two sources disagree by more than $50.";

function pick(value: string | undefined, allowed: string[]) {
  return value && allowed.includes(value) ? value : allowed[0];
}

export default async function NewExperimentPage({
  searchParams,
}: {
  searchParams: Promise<{
    hypothesis?: string;
    bundle?: string;
    corpus?: string;
    runs?: string;
    grader?: string;
  }>;
}) {
  const query = await searchParams;

  const defaults: RunnerDefaults = {
    hypothesis: query.hypothesis?.trim() || DEFAULT_HYPOTHESIS,
    bundle: pick(query.bundle, runnerOptions.bundles),
    corpus: pick(query.corpus, runnerOptions.corpora),
    runs: /^\d+$/.test(query.runs ?? "") ? (query.runs as string) : "12",
    grader: pick(query.grader, runnerOptions.graders),
  };

  return (
    <>
      <div className="crumb">
        <Link href="/">Overview</Link> ›{" "}
        <Link href="/experiments">experiments</Link> › new attempt
      </div>
      <h1>Run an experiment</h1>
      <p className="lede">
        A hypothesis, a bundle, a corpus, and enough runs to separate from baseline.
      </p>

      <ExperimentForm defaults={defaults} />
    </>
  );
}
