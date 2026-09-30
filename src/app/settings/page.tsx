import Link from "next/link";

import { RoleChoice } from "@/components/shell/role-choice";
import { ThemeChoice } from "@/components/shell/theme-toggle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SAMPLE_RATE } from "@/lib/domain/constants";
import { policyCards } from "@/lib/domain/policy-cards";

export const metadata = {
  title: "Settings",
};

/**
 * Most of what looks like a setting here is owned by someone else. 01 §5 assigns
 * the sample rate to Compliance and the thresholds to Credit Policy, so those
 * render read-only with their owner named rather than as controls this screen can
 * pretend to change.
 */
export default function SettingsPage() {
  return (
    <>
      <div className="crumb">
        <Link href="/">Overview</Link> › settings
      </div>
      <h1>Settings</h1>
      <p className="lede">
        Appearance and the role you are acting as. Everything else on this page is
        owned by another function and shown so you can see who to ask.
      </p>

      <div className="sec">
        <div className="sechead">
          <h2>Appearance</h2>
          <span className="h">stored on this device</span>
        </div>
        <ThemeChoice />
        <p className="impact">
          Light is the brand expression and the default. Dark is supported because this
          is an internal product surface rather than a marketing one.
        </p>
      </div>

      <div className="sec">
        <div className="sechead">
          <h2>Acting role</h2>
          <span className="h">changes what you can resolve</span>
        </div>
        <RoleChoice />
        <p className="impact">
          Policy judgments and adverse-action escalations route to a senior reviewer
          only. Switch to <span className="mono">reviewer</span> and those two interrupt
          types become unresolvable, with the reason stated on the file rather than the
          buttons quietly disappearing.
        </p>
        <p className="takeaway" style={{ borderLeftColor: "var(--p-hold)" }}>
          In a real deployment this is not a preference. Routing is enforced on the
          server and derived from your identity — a switcher exists here only so the
          rule is visible in a prototype with no backend.
        </p>
      </div>

      <div className="sec">
        <div className="sechead">
          <h2>Owned elsewhere</h2>
          <span className="h">read-only</span>
        </div>
        <div className="wrap">
          <Table className="tbl">
            <caption className="sr-only">
              Settings owned by another function, with their owner
            </caption>
            <TableHeader>
              <TableRow>
                <TableHead>setting</TableHead>
                <TableHead>value</TableHead>
                <TableHead>owner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Blind sample rate</TableCell>
                <TableCell className="m">{Math.round(SAMPLE_RATE * 100)}% of clean files</TableCell>
                <TableCell>Compliance</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Autonomy guardrail</TableCell>
                <TableCell className="m">on</TableCell>
                <TableCell>enforced in code, not configurable</TableCell>
              </TableRow>
              {policyCards.map((card) => (
                <TableRow key={card.id}>
                  <TableCell>
                    Policy card <span className="mono">{card.id}</span>
                  </TableCell>
                  <TableCell>
                    {card.rule}
                    {card.illustrative ? (
                      <span className="tag" style={{ marginLeft: "6px" }}>
                        unsourced
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell>Credit Policy</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="impact">
          The autonomy guardrail has no switch because it is not a preference — a bundle
          whose autonomy rises while sampled accuracy falls cannot be promoted, and that
          is enforced at the promotion path rather than by a setting someone could turn
          off. Cards marked unsourced carry placeholder numbers pending Credit Policy and
          must not be read as policy.
        </p>
      </div>
    </>
  );
}
