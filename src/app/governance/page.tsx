import Link from "next/link";

import { Rollback } from "@/components/governance/rollback";
import { SectionAnchors } from "@/components/governance/section-anchors";
import { Rich } from "@/components/rich-text";
import { sampleDecisionRefs } from "@/lib/data/decisions";
import {
  addedSkillSlug,
  auditChain,
  compareFrom,
  compareTo,
  defaultVersion,
  diffBundles,
  editedSkillSlug,
  getVersion,
  governanceSections,
  grantedCheckerTool,
  missingSteps,
  policyCards,
  skills,
  stepCoverage,
  toolCount,
  toolGroups,
  bundleVersions,
} from "@/lib/data/governance";
import { step } from "@/lib/data/procedure";
import { toneClass } from "@/lib/rich-text";

export const metadata = {
  title: "Governance",
};

export default async function GovernancePage({
  searchParams,
}: {
  searchParams: Promise<{ v?: string; compare?: string }>;
}) {
  const query = await searchParams;
  const compare = query.compare === "1";
  const version = getVersion(compare ? compareTo : (query.v ?? defaultVersion));
  const previous = getVersion(compareFrom);

  const activeSkills = skills.filter((skill) =>
    version.skillSlugs.includes(skill.slug),
  );
  const skillCount = compare
    ? `${activeSkills.length}, was ${previous.skillSlugs.length}`
    : String(activeSkills.length);

  const coverage = stepCoverage(version);
  const gaps = missingSteps(version);
  const diff = diffBundles(previous, getVersion(compareTo));

  return (
    <div className="gwrap">
      <div className="crumb">
        <Link href="/">Overview</Link> › governance
      </div>
      <div className="kicker">
        <h1>HELOC File Review</h1>
        <span className="eyebrow">bundle · underwriting</span>
      </div>

      <div className="vswitch">
        {bundleVersions.map((bundle) => (
          <Link
            key={bundle.v}
            className={!compare && version.v === bundle.v ? "vpill on" : "vpill"}
            href={`/governance?v=${bundle.v}`}
          >
            {bundle.v}
          </Link>
        ))}
        <span style={{ width: "8px" }} />
        <Link
          className={compare ? "vpill on" : "vpill"}
          href={compare ? `/governance?v=${compareTo}` : "/governance?compare=1"}
        >
          {compare ? `Comparing ${compareFrom} → ${compareTo}` : "Compare versions"}
        </Link>
        <Link
          className="vpill"
          href={`/governance/promote?v=${version.v}`}
          style={{ marginLeft: "auto" }}
        >
          Promotion gate
        </Link>
      </div>

      <SectionAnchors sections={governanceSections} compare={compare} />

      {compare ? (
        <>
          <div className="changes">
            <div className="t">
              {diff.filter((row) => row.changed).length} of the six diffable dimensions
              moved between {compareFrom} and {compareTo}. This bundle produced 96.4%
              ±1.2 against a 92.4% ±2.0 baseline and was promoted to production at 12:03
              by the attempt{" "}
              <Link href={`/attempts/${version.promotedBy}`} style={{ color: "inherit" }}>
                {version.promotedBy}
              </Link>
              .
            </div>
          </div>

          {/* 05 §2 · all six dimensions, so a reviewer never has to read two
              documents side by side to answer "what changed and why". */}
          <div className="difftable">
            {diff.map((row) => (
              <div
                className={row.changed ? "diff-row changed" : "diff-row"}
                key={row.dimension}
              >
                <span className="diff-dim">{row.dimension}</span>
                <span className="diff-from">{row.from}</span>
                <span className="diff-to">
                  {row.changed ? row.to : <span className="v-none">unchanged</span>}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : null}

      <div className="gsec" id="g-meta">
        <h2>Bundle</h2>
        <div className="wrap" style={{ marginTop: "10px" }}>
          <table className="tbl">
            <caption className="sr-only">Bundle metadata</caption>
            <tbody>
              <tr>
                <td>Version</td>
                <td className="m">
                  {compare ? (
                    <>
                      {compareFrom} <span className="v-none">→</span>{" "}
                      <span className="v-keep">{compareTo}</span>
                    </>
                  ) : (
                    version.v
                  )}
                </td>
              </tr>
              <tr>
                <td>Runtime</td>
                <td className="m">{version.runtime}</td>
              </tr>
              <tr>
                <td>Default model</td>
                <td className="m">
                  {version.model}
                  {compare && version.model === previous.model ? (
                    <span className="v-none"> unchanged</span>
                  ) : null}
                </td>
              </tr>
              <tr>
                <td>Reasoning effort</td>
                <td className="m">{version.effort}</td>
              </tr>
              <tr>
                <td>Repository</td>
                <td className="m">{version.repository}</td>
              </tr>
              <tr>
                <td>Signed by</td>
                <td className="m">{version.signedBy}</td>
              </tr>
              <tr>
                <td>Status</td>
                <td>
                  <span className={toneClass[version.status.tone]}>
                    {version.status.text}
                  </span>
                  {version.status.note ? ` · ${version.status.note}` : null}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="gsec" id="g-topo">
        <h2>Topology</h2>
        <div className="topo">
          <div className="tnode">
            <div className="n">underwriter</div>
            <div className="c">
              root · {toolCount} tools · inherits default model
            </div>
          </div>
          <div className="stem" />
          <div className="tkids">
            <div className="tnode">
              <div className="n">document-reader</div>
              <div className="c">peer · 2 tools</div>
            </div>
            <div className={compare ? "tnode dadd" : "tnode"}>
              <div className="n">checker</div>
              <div className="c">
                peer ·{" "}
                {compare ? (
                  <span className="v-keep">
                    {version.checkerTools.length} tools, was{" "}
                    {previous.checkerTools.length}
                  </span>
                ) : (
                  `${version.checkerTools.length} tool${version.checkerTools.length === 1 ? "" : "s"}`
                )}
              </div>
            </div>
          </div>
        </div>
        <p className="impact">
          The root delegates document extraction to a peer that returns typed values with
          page citations and never raw text, and step-boundary verification to a peer that
          sees only the worksheet. Neither peer can see what the other sees — that isolation
          is what makes the checker’s agreement meaningful.
        </p>
      </div>

      <div className="gsec" id="g-agents">
        <h2>
          Agents <span className="pill">3</span>
        </h2>
        <div className="gcard">
          <div className="gh">
            <span className="gn">underwriter</span>
            <span className="pill">root</span>
            <span className="pill">inherits default model</span>
          </div>
          <p>
            Executes the locked eight-step procedure on one loan folder against one policy
            card and produces the code-validated final record. Delegates document extraction
            to document-reader and step-boundary verification to checker.
          </p>
        </div>
        <div className="gcard">
          <div className="gh">
            <span className="gn">document-reader</span>
            <span className="pill">peer</span>
          </div>
          <p>
            Reads one loan document in a fresh context and returns typed extractions with
            page citations — never the document text. Used for document-heavy steps so the
            primary context stays small.
          </p>
          <div className="tgroup">
            <div className="tg">tools</div>
            <div className="tchips">
              <span className="tchip">read_file</span>
              <span className="tchip">load_artifacts</span>
            </div>
          </div>
        </div>
        <div className={compare ? "gcard dadd" : "gcard"}>
          <div className="gh">
            <span className="gn">checker</span>
            <span className="pill">peer</span>
          </div>
          <p>
            Independent step-boundary checker. Sees only the worksheet and state files and
            the acceptance criteria it is given — never the loan documents or the transcript.
            Re-derives key numbers from recorded entries and flags anything a stranger could
            not re-derive.
          </p>
          <div className="tgroup">
            <div className="tg">tools</div>
            <div className="tchips">
              {version.checkerTools.map((tool) => (
                <span
                  className={
                    compare && tool === grantedCheckerTool ? "tchip add" : "tchip"
                  }
                  key={tool}
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
          {compare ? (
            <p style={{ color: "var(--p-keep)" }}>
              Granted {grantedCheckerTool} in {compareTo}. Without it the checker could not
              re-derive the qualifying payment, which is what “calculation mismatch” meant on
              eight of 150 fields.
            </p>
          ) : null}
        </div>
      </div>

      <div className="gsec" id="g-tools">
        <h2>
          Tools <span className="pill">{toolCount}</span>
        </h2>
        <p className="impact">
          Grouped by what they do. Nine of the {toolCount} are income calculators — one per
          income type — which is why the raw count looks alarming and isn’t.
        </p>
        {toolGroups.map((group) => (
          <div className="tgroup" key={group.group}>
            <div className="tg">
              {group.group}{" "}
              <span style={{ color: "var(--p-ink-3)" }}>· {group.tools.length}</span>
            </div>
            <div className="tchips">
              {group.tools.map((tool) => (
                <span className="tchip" key={tool}>
                  {tool}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="gsec" id="g-skills">
        <h2>
          Skills <span className="pill">{skillCount}</span>
          {gaps.length > 0 ? (
            <span
              className="pill"
              style={{ color: "var(--p-discard)", borderColor: "var(--p-discard)" }}
            >
              {gaps.length} step uncovered
            </span>
          ) : null}
        </h2>
        <p className="impact">
          The step skills map one-to-one onto the locked procedure. If a step has no
          skill, the run has no instructions for it — so the mapping is rendered in full,
          including the gaps.
        </p>

        {/* 05 §1 · render the gap rather than omitting it. Filtering the missing
            skill out of the list hid the exact defect a reviewer is looking for. */}
        <div className="coverage">
          {coverage.map((entry) => (
            <div
              className={entry.present ? "cov-row" : "cov-row gap"}
              key={entry.step}
            >
              <span className="cov-n">Step {entry.step}</span>
              <span className="cov-name">{step(entry.step).name}</span>
              <span className="cov-skill">
                {entry.present ? entry.slug : "no skill — the run has no instructions"}
              </span>
            </div>
          ))}
        </div>

        {gaps.length > 0 ? (
          <p className="takeaway" style={{ borderLeftColor: "var(--p-discard)" }}>
            {gaps.length === 1
              ? `Step ${gaps[0].step} has no skill in ${version.v}, so title was never read on any file this bundle decided.`
              : `${gaps.length} steps have no skill in ${version.v}.`}{" "}
            A bundle in this state cannot reach <span className="mono">live</span> under
            the promotion gate, and this is the latent defect behind the failed{" "}
            <span className="mono">0.11.1</span> build.
          </p>
        ) : null}
        {activeSkills.map((skill) => {
          const added = compare && skill.slug === addedSkillSlug;
          return (
            <div className={added ? "gcard dadd" : "gcard"} key={skill.slug}>
              <div className="gh">
                <span className="gn">
                  {added ? <span className="dmark v-keep">+</span> : null}
                  {skill.slug}
                </span>
                {added ? (
                  <span
                    className="pill"
                    style={{ color: "var(--p-keep)", borderColor: "var(--p-keep)" }}
                  >
                    new in {compareTo}
                  </span>
                ) : null}
              </div>
              <p>{skill.blurb}</p>
              {compare && skill.slug === editedSkillSlug ? (
                <p style={{ color: "var(--p-keep)" }}>
                  <span className="dmark v-keep">~</span>
                  Edited: the checker is now handed the raw obligation lines alongside the
                  recorded entries.
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="gsec" id="g-policy">
        <h2>Policy cards</h2>
        <div className="wrap" style={{ marginTop: "10px" }}>
          <table className="tbl">
            <caption className="sr-only">Policy cards and their state</caption>
            <tbody>
              {policyCards.map((card) => (
                <tr key={card.card}>
                  <td className="m">{card.card}</td>
                  <td>{card.rule}</td>
                  <td className={toneClass[card.tone]}>{card.state}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="impact">
          Thresholds live in policy cards, never in skill text. A skill that improvises a
          threshold is a defect regardless of whether the number is right.
        </p>
      </div>

      {version.status.tone === "keep" ? (
        <Rollback live={version.v} priorVersion={compareFrom} decisionsStamped={1004} />
      ) : null}

      <div className="gsec" id="g-audit">
        <h2>Audit chain</h2>
        <div className="wrap" style={{ marginTop: "10px" }}>
          <div style={{ padding: "14px" }} className="audit">
            {auditChain.map((line, index) => (
              <div key={index}>
                {line.depth > 0 ? (
                  <span>{"\u00a0".repeat(line.depth * 3)}└ </span>
                ) : null}
                <Rich parts={line.parts} />
              </div>
            ))}
          </div>
        </div>
        <p className="impact">
          Every decision resolves down to a page in a document and up to the experiment
          that authorised the bundle which produced it. This chain is the reason the
          platform can be reviewed by someone who was not in the room.
        </p>
        {/* 05 §6 · it must resolve from any decision, not from one example. */}
        <div className="actions">
          {sampleDecisionRefs.map((ref) => (
            <Link className="btn sm" href={`/decisions/${ref}`} key={ref}>
              Open {ref}
            </Link>
          ))}
        </div>
        <p className="impact">
          Any cleared file resolves this way — the chains above are three of 1,004, and
          every cleared row in a batch links to its own.
        </p>
      </div>
    </div>
  );
}
