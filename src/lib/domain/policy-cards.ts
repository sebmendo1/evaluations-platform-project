/**
 * Spec: 00 · INV-8 — thresholds live in policy cards, never in skill text.
 *
 * This file is the card set. A skill that names a numeric threshold is a defect
 * even when the number is correct today, so every threshold the platform applies
 * has to resolve to an entry here.
 *
 * Values marked `illustrative` follow the `[INPUT]` discipline in 01: the spec
 * names the dimension (LTV and CLTV limits by lien position) without publishing
 * the numbers, so these are placeholders pending Credit Policy and must not be
 * presented as policy.
 */

export type PolicyCard = {
  id: string;
  rule: string;
  thresholds: Record<string, number>;
  /** True when the numbers are placeholders rather than sourced from the card. */
  illustrative: boolean;
  state: string;
  amendmentProposed: boolean;
};

export const policyCards: PolicyCard[] = [
  {
    id: "dti-thresholds",
    rule: "43% standard, 45% with reserves",
    thresholds: { standard: 43, withReserves: 45 },
    illustrative: false,
    state: "unchanged since 0.9.2",
    amendmentProposed: false,
  },
  {
    id: "collateral",
    rule: "LTV and CLTV limits by lien position",
    thresholds: { ltvFirstLien: 80, cltvSecondLien: 85, avmTolerancePct: 5 },
    illustrative: true,
    state: "1 amendment proposed",
    amendmentProposed: true,
  },
  {
    id: "adverse-action",
    rule: "Chase reason table, 2026 revision",
    thresholds: {},
    illustrative: false,
    state: "unchanged",
    amendmentProposed: false,
  },
  {
    id: "reserves",
    rule: "Months required by occupancy and score band",
    thresholds: { monthsPrimary: 2, monthsSecondary: 6 },
    illustrative: true,
    state: "unchanged",
    amendmentProposed: false,
  },
];

export function getCard(id: string): PolicyCard {
  const card = policyCards.find((entry) => entry.id === id);
  if (!card) {
    throw new Error(`INV-8: no policy card named ${id}; a threshold cannot be improvised`);
  }
  return card;
}

export function threshold(cardId: string, key: string): number {
  const card = getCard(cardId);
  const value = card.thresholds[key];
  if (value === undefined) {
    throw new Error(`INV-8: card ${cardId} has no threshold named ${key}`);
  }
  return value;
}

/**
 * INV-8 check used by the promotion gate in 05 §4. A skill body containing a
 * bare percentage or a dollar threshold is a defect regardless of correctness.
 */
const THRESHOLD_PATTERN = /\b\d+(\.\d+)?\s?%|\$\s?\d/;

export function skillTextNamesThreshold(text: string): boolean {
  return THRESHOLD_PATTERN.test(text);
}
