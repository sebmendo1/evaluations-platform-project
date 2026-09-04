/**
 * 05 §6 · "Section navigation is present, sticky, and marks changed sections in
 * compare."
 *
 * This used to live in a right-hand panel. Governance is long-form and read in
 * order, so the nav belongs above the thing it navigates rather than beside it —
 * and the panel it lived in was showing three other tabs of content that already
 * had homes elsewhere.
 *
 * Anchors rather than tabs: these are seven sections of one document, not seven
 * views of one object.
 */
export function SectionAnchors({
  sections,
  compare,
}: {
  sections: { id: string; label: string; changed: boolean }[];
  compare: boolean;
}) {
  return (
    <nav className="anchornav" aria-label="Bundle sections">
      {sections.map((section) => (
        <a className="anchornav-item" href={`#${section.id}`} key={section.id}>
          {section.label}
          {compare && section.changed ? (
            <span className="anchornav-mark">changed</span>
          ) : null}
        </a>
      ))}
    </nav>
  );
}
