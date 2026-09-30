/**
 * 08 §7 · "Show the work. Long-running agent work exposes a live artefact —
 * worklog, diff, test report, progress count. A bare spinner is never acceptable."
 *
 * So a loading state names what it is fetching and what it will contain, rather
 * than spinning. Nothing here animates: 08 §3 allows no elevation and the
 * reduced-motion rule in globals.css would disable a spinner anyway.
 */
export function LoadingArtefact({
  title,
  lines,
}: {
  title: string;
  lines: string[];
}) {
  return (
    <>
      <h1>{title}</h1>
      <p className="lede">Reading the workspace.</p>
      <div className="worklog">
        {lines.map((line) => (
          <div className="worklog-row" key={line}>
            <span className="worklog-mark mono">·</span>
            <span>{line}</span>
          </div>
        ))}
      </div>
    </>
  );
}
