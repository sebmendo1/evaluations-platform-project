import type { RichText, ToneName } from "../rich-text";

export const toolGroups: { group: string; tools: string[] }[] = [
  {
    group: "Files and context",
    tools: ["Skill", "read_file", "write_file", "glob_files", "load_artifacts"],
  },
  { group: "Peer agents", tools: ["document_reader", "checker"] },
  { group: "Policy", tools: ["lookup_policy"] },
  {
    group: "Recording",
    tools: [
      "record_field",
      "add_obligation",
      "record_asset",
      "record_income",
      "mark_step",
      "write_final_record",
    ],
  },
  {
    group: "Derived figures",
    tools: ["compute_qualifying_payment", "compute_dti", "compute_reserves"],
  },
  {
    group: "Income calculators",
    tools: [
      "calculate_w2",
      "calculate_self_employment",
      "calculate_fixed_income",
      "calculate_rental",
      "calculate_investment",
      "calculate_royalty",
      "calculate_farm",
      "calculate_annuitization",
      "calculate_rsu",
    ],
  },
  {
    group: "Adverse action",
    tools: [
      "fetch_adverse_action_table",
      "search_adverse_action",
      "lookup_adverse_action",
    ],
  },
];

export const toolCount = toolGroups.reduce((sum, g) => sum + g.tools.length, 0);

export type Skill = { slug: string; blurb: string };

export const skills: Skill[] = [
  {
    slug: "step-1-file-intake",
    blurb:
      "The manifest and staleness checklist, applicability gate, and cross-document conflict sweep.",
  },
  {
    slug: "step-2-credit-read",
    blurb:
      "Working the credit report against written policy: trusted-score placement, housing history, derogatory handling.",
  },
  {
    slug: "step-3-income-orchestration",
    blurb:
      "Classify each income source, route it to the right documents and computation, and verify continuance.",
  },
  {
    slug: "step-4-obligations-dti",
    blurb:
      "Assemble the debt picture from each debt’s true source and construct the qualifying payment.",
  },
  {
    slug: "step-5-consumed-collateral",
    blurb:
      "Collateral is consumed, not derived. Property value, LTV and CLTV, lien position from structured sources.",
  },
  {
    slug: "step-6-insurance-flood",
    blurb: "The flood determination read and the insurance conditions.",
  },
  {
    slug: "step-7-title-review",
    blurb:
      "Title commitment read: vesting, exceptions, and lien position confirmation.",
  },
  {
    slug: "step-8-decide-document",
    blurb:
      "Derive the supportable line, choose the outcome, draft conditions and reasons.",
  },
  {
    slug: "adverse-action-reasons",
    blurb:
      "On a counteroffer or decline, pull the Chase adverse-action reasons and match every reason to a recorded finding.",
  },
  {
    slug: "fair-lending",
    blurb:
      "Prohibited-basis characteristics never enter reasoning; documented continuance analysis only.",
  },
  {
    slug: "fraud-tells",
    blurb:
      "The HELOC fraud-tell pattern library — income, credit history, title, and process-gaming signals.",
  },
  {
    slug: "policy-card",
    blurb: "How to read and apply the policy card grid; never improvise a threshold.",
  },
  {
    slug: "record-format",
    blurb:
      "The completed-record exemplar — good worksheet entries, step statuses, and final record shape.",
  },
  {
    slug: "writing-referrals",
    blurb: "How to write a referral that routes a finding out of the review.",
  },
];

/** Skill added in 0.12.0 — absent from every earlier bundle. */
export const addedSkillSlug = "step-7-title-review";
export const editedSkillSlug = "step-4-obligations-dti";
export const grantedCheckerTool = "obligation_lines";

export type BundleVersion = {
  v: string;
  model: string;
  effort: string;
  runtime: string;
  repository: string;
  signedBy: string;
  status: { text: string; tone: ToneName; note?: string };
  skillSlugs: string[];
  checkerTools: string[];
  pillLabel: string;
  /** Card versions this bundle pins. One of the six diffable dimensions in 05 §2. */
  cardPins: Record<string, string>;
  /** The experiment that authorised it (INV-9). Null means never promoted. */
  promotedBy: string | null;
};

const allSkillSlugs = skills.map((skill) => skill.slug);
const preStep7Slugs = allSkillSlugs.filter((slug) => slug !== addedSkillSlug);

export const bundleVersions: BundleVersion[] = [
  {
    v: "0.12.0",
    model: "opus-5",
    effort: "xhigh",
    runtime: "smart-sdk v3",
    repository: "/repo/agents/underwriting",
    signedBy: "s.mendo · Sep 3, 12:03",
    status: { text: "live in production", tone: "keep", note: "batch-0903-am" },
    skillSlugs: allSkillSlugs,
    checkerTools: ["read_file", grantedCheckerTool],
    pillLabel: "live",
    cardPins: {
      "dti-thresholds": "2026.02",
      collateral: "2026.02",
      "adverse-action": "2026.01",
      reserves: "2025.11",
    },
    promotedBy: "add-title-review",
  },
  {
    v: "0.11.0",
    model: "opus-5",
    effort: "xhigh",
    runtime: "smart-sdk v3",
    repository: "/repo/agents/underwriting",
    signedBy: "s.mendo · Sep 2, 09:40",
    status: { text: "retired", tone: "none", note: "superseded by 0.12.0" },
    skillSlugs: preStep7Slugs,
    checkerTools: ["read_file"],
    pillLabel: "retired",
    cardPins: {
      "dti-thresholds": "2026.02",
      collateral: "2026.01",
      "adverse-action": "2026.01",
      reserves: "2025.11",
    },
    promotedBy: null,
  },
  {
    v: "0.9.2",
    model: "opus-4.8",
    effort: "high",
    runtime: "smart-sdk v3",
    repository: "/repo/agents/underwriting",
    signedBy: "s.mendo · Aug 12, 16:20",
    status: { text: "baseline", tone: "none", note: "first graded bundle" },
    skillSlugs: preStep7Slugs,
    checkerTools: ["read_file"],
    pillLabel: "baseline",
    cardPins: {
      "dti-thresholds": "2026.02",
      collateral: "2026.01",
      "adverse-action": "2026.01",
      reserves: "2025.11",
    },
    promotedBy: null,
  },
];

/** Which of the eight procedure steps each step skill implements. */
export const skillForStep: Record<number, string> = {
  1: "step-1-file-intake",
  2: "step-2-credit-read",
  3: "step-3-income-orchestration",
  4: "step-4-obligations-dti",
  5: "step-5-consumed-collateral",
  6: "step-6-insurance-flood",
  7: "step-7-title-review",
  8: "step-8-decide-document",
};

/**
 * 05 §1 — "GIVEN a bundle where a procedure step has no corresponding skill THEN
 * Governance renders the gap explicitly rather than omitting it AND the bundle
 * cannot reach status `live`."
 *
 * This is the defect the specs say caused the 0.11.1 crash and sat latent from the
 * baseline. Filtering the skill out of the list hid exactly the thing a reviewer
 * needs to see.
 */
export function stepCoverage(bundle: BundleVersion) {
  return Object.entries(skillForStep).map(([n, slug]) => ({
    step: Number(n),
    slug,
    present: bundle.skillSlugs.includes(slug),
  }));
}

export function missingSteps(bundle: BundleVersion) {
  return stepCoverage(bundle).filter((entry) => !entry.present);
}

/** The six diffable dimensions in 05 §2. */
export type DiffRow = {
  dimension: string;
  from: string;
  to: string;
  changed: boolean;
};

export function diffBundles(from: BundleVersion, to: BundleVersion): DiffRow[] {
  const rows: DiffRow[] = [
    { dimension: "Model", from: from.model, to: to.model, changed: from.model !== to.model },
    {
      dimension: "Runtime",
      from: from.runtime,
      to: to.runtime,
      changed: from.runtime !== to.runtime,
    },
    {
      dimension: "Reasoning effort",
      from: from.effort,
      to: to.effort,
      changed: from.effort !== to.effort,
    },
    {
      dimension: "Checker tool grants",
      from: from.checkerTools.join(", "),
      to: to.checkerTools.join(", "),
      changed: from.checkerTools.join() !== to.checkerTools.join(),
    },
  ];

  const added = to.skillSlugs.filter((slug) => !from.skillSlugs.includes(slug));
  const removed = from.skillSlugs.filter((slug) => !to.skillSlugs.includes(slug));
  rows.push({
    dimension: "Skills",
    from: `${from.skillSlugs.length} skills`,
    to: `${to.skillSlugs.length} skills${added.length ? ` · added ${added.join(", ")}` : ""}${removed.length ? ` · removed ${removed.join(", ")}` : ""}`,
    changed: added.length > 0 || removed.length > 0,
  });

  const pinChanges = Object.keys(to.cardPins).filter(
    (card) => from.cardPins[card] !== to.cardPins[card],
  );
  rows.push({
    dimension: "Policy card pins",
    from: pinChanges.map((c) => `${c} ${from.cardPins[c]}`).join(", ") || "unchanged",
    to: pinChanges.map((c) => `${c} ${to.cardPins[c]}`).join(", ") || "unchanged",
    changed: pinChanges.length > 0,
  });

  return rows;
}

export const defaultVersion = "0.12.0";
export const compareFrom = "0.11.0";
export const compareTo = "0.12.0";

export function getVersion(v: string | undefined): BundleVersion {
  return (
    bundleVersions.find((bundle) => bundle.v === v) ?? bundleVersions[0]
  );
}

export const governanceSections: { id: string; label: string; changed: boolean }[] = [
  { id: "g-meta", label: "Bundle", changed: false },
  { id: "g-topo", label: "Topology", changed: true },
  { id: "g-agents", label: "Agents", changed: true },
  { id: "g-tools", label: "Tools", changed: true },
  { id: "g-skills", label: "Skills", changed: true },
  { id: "g-policy", label: "Policy cards", changed: false },
  { id: "g-audit", label: "Audit chain", changed: false },
];

export const policyCards = [
  {
    card: "dti-thresholds",
    rule: "43% standard, 45% with reserves",
    state: "unchanged since 0.9.2",
    tone: "none" as ToneName,
  },
  {
    card: "collateral",
    rule: "LTV and CLTV limits by lien position",
    state: "1 amendment proposed",
    tone: "hold" as ToneName,
  },
  {
    card: "adverse-action",
    rule: "Chase reason table, 2026 revision",
    state: "unchanged",
    tone: "none" as ToneName,
  },
  {
    card: "reserves",
    rule: "Months required by occupancy and score band",
    state: "unchanged",
    tone: "none" as ToneName,
  },
];

export const auditChain: { depth: number; parts: RichText }[] = [
  {
    depth: 0,
    parts: ["decision ", { strong: "HL-40086 · Approve $95,000" }],
  },
  { depth: 1, parts: ["field ", { strong: "DebtToIncomeRatio 38.9%" }] },
  {
    depth: 2,
    parts: ["source ", { strong: "credit report pg 3" }, " · document-reader"],
  },
  {
    depth: 2,
    parts: ["verified by ", { strong: "checker" }, " · re-derived, agreed"],
  },
  {
    depth: 2,
    parts: ["corrected by ", { strong: "j.park" }, " · Sep 3, 12:09 · blind review"],
  },
  { depth: 1, parts: ["bundle ", { strong: "0.12.0" }, " · signed s.mendo"] },
  {
    depth: 2,
    parts: ["promoted by attempt ", { strong: "add step-7 title review" }],
  },
  { depth: 2, parts: ["evidence ", { strong: "96.4% ±1.2, n 12" }] },
];
