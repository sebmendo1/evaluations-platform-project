/**
 * The promotion gate.
 *
 * Spec: 05 §4 — a bundle moves `evaluated → live` only when all seven conditions
 * hold, and "failures are stated individually. A single 'cannot promote' is not
 * actionable."
 */

import { missingSteps, type BundleVersion } from "../data/governance";
import { skills } from "../data/governance";
import { policyCards, skillTextNamesThreshold } from "./policy-cards";
import { canPromote, type ExperimentResult } from "./verdict";

export type GateCondition = {
  id: string;
  requirement: string;
  /** The spec clause that puts it here. */
  cites: string;
  passed: boolean;
  detail: string;
};

export type GateInput = {
  bundle: BundleVersion;
  result: ExperimentResult | null;
  baseline: ExperimentResult | null;
  autonomyDelta: number;
  sampledAccuracyDelta: number;
  modelRiskReviewedAt: string | null;
  signedBy: string | null;
};

export function evaluateGate(input: GateInput): GateCondition[] {
  const promotion = canPromote({
    result: input.result,
    baseline: input.baseline,
    autonomyDelta: input.autonomyDelta,
    sampledAccuracyDelta: input.sampledAccuracyDelta,
  });

  const gaps = missingSteps(input.bundle);

  const offendingSkills = skills
    .filter((skill) => input.bundle.skillSlugs.includes(skill.slug))
    .filter((skill) => skillTextNamesThreshold(skill.blurb));

  const stalePins = Object.entries(input.bundle.cardPins).filter(
    ([card]) => !policyCards.some((entry) => entry.id === card),
  );

  return [
    {
      id: "verdict",
      requirement: "Verdict is keep",
      cites: "04 §2",
      passed: promotion.verdict === "keep",
      detail:
        promotion.verdict === "keep"
          ? "The interval separates above baseline."
          : `Computed as ${promotion.verdict}. Only keep may be promoted, and there is no override.`,
    },
    {
      id: "inv4",
      requirement: "Autonomy did not rise while sampled accuracy fell",
      cites: "INV-4",
      passed: !promotion.failures.some((f) => f.startsWith("INV-4")),
      detail: promotion.failures.some((f) => f.startsWith("INV-4"))
        ? (promotion.failures.find((f) => f.startsWith("INV-4")) as string)
        : `Autonomy ${input.autonomyDelta >= 0 ? "+" : ""}${input.autonomyDelta.toFixed(1)} pt, sampled accuracy ${input.sampledAccuracyDelta >= 0 ? "+" : ""}${input.sampledAccuracyDelta.toFixed(1)} pt. Removing an interrupt is only a gain if the agent was right to stop asking.`,
    },
    {
      id: "steps",
      requirement: "Every procedure step has a skill",
      cites: "05 §1",
      passed: gaps.length === 0,
      detail:
        gaps.length === 0
          ? "All eight steps are covered."
          : `Step ${gaps.map((g) => g.step).join(", ")} has no skill, so the run has no instructions for it.`,
    },
    {
      id: "thresholds",
      requirement: "No skill text names a numeric threshold",
      cites: "INV-8",
      passed: offendingSkills.length === 0,
      detail:
        offendingSkills.length === 0
          ? "Thresholds resolve to policy cards, not to skill bodies."
          : `${offendingSkills.map((s) => s.slug).join(", ")} names a threshold. A skill that improvises a number is a defect even when the number is right today.`,
    },
    {
      id: "cards",
      requirement: "Referenced policy card versions exist and are current",
      cites: "05 §4",
      passed: stalePins.length === 0,
      detail:
        stalePins.length === 0
          ? `${Object.keys(input.bundle.cardPins).length} cards pinned, all resolving.`
          : `${stalePins.map(([c]) => c).join(", ")} does not resolve to a card.`,
    },
    {
      id: "signed",
      requirement: "Signed by a named bundle owner",
      cites: "05 §4",
      passed: Boolean(input.signedBy),
      detail: input.signedBy
        ? `Signed ${input.signedBy}.`
        : "Unsigned. A bundle nobody put their name to cannot go live.",
    },
    {
      id: "model-risk",
      requirement: "Model Risk review recorded",
      cites: "05 §4, 01 §7",
      passed: Boolean(input.modelRiskReviewedAt),
      detail: input.modelRiskReviewedAt
        ? `Reviewed ${input.modelRiskReviewedAt}.`
        : "No review on record. Independent validation is a role rather than a feature — Astro's job is to make the artifact reviewable and to record that someone did.",
    },
  ];
}

export function gatePasses(conditions: GateCondition[]): boolean {
  return conditions.every((condition) => condition.passed);
}
