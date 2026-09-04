/**
 * Spec: 01 §5 · Operating model
 *
 * Roles exist here so the routing rules in 03 and the named approval in INV-5
 * are demonstrable. Real enforcement belongs on a server; this prototype has
 * none, and the conformance matrix records that as deferred.
 */

export type Role =
  | "reviewer"
  | "senior_reviewer"
  | "bundle_owner"
  | "credit_policy"
  | "model_risk"
  | "compliance";

export type RoleProfile = {
  id: Role;
  label: string;
  person: string;
  initials: string;
  owns: string;
};

export const roles: RoleProfile[] = [
  {
    id: "reviewer",
    label: "Reviewer",
    person: "j.park",
    initials: "JP",
    owns: "Clears the interrupt queue and performs blind reviews",
  },
  {
    id: "senior_reviewer",
    label: "Senior reviewer",
    person: "a.silva",
    initials: "AS",
    owns: "Policy judgments and adverse-action approvals",
  },
  {
    id: "bundle_owner",
    label: "Bundle owner",
    person: "s.mendo",
    initials: "SM",
    owns: "Runs experiments and proposes bundle changes",
  },
  {
    id: "credit_policy",
    label: "Credit Policy",
    person: "r.okafor",
    initials: "RO",
    owns: "Owns the policy cards and approves amendments",
  },
  {
    id: "model_risk",
    label: "Model Risk",
    person: "d.nguyen",
    initials: "DN",
    owns: "Independent validation of the bundle",
  },
  {
    id: "compliance",
    label: "Compliance",
    person: "l.moreau",
    initials: "LM",
    owns: "Fair lending, adverse action, and the sampling rate",
  },
];

export const defaultRole: Role = "senior_reviewer";

export function getRole(id: string | undefined): RoleProfile {
  return roles.find((role) => role.id === id) ?? roles.find((r) => r.id === defaultRole)!;
}

export function isRole(value: string | undefined): value is Role {
  return roles.some((role) => role.id === value);
}

/** Only the bundle owner may sign a bundle, per 05 §4. */
export function canSignBundle(role: Role): boolean {
  return role === "bundle_owner";
}
