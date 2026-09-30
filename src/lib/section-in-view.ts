/**
 * 05 §1 / §6 · which bundle section owns the current scroll position.
 *
 * A section is current once its top has crossed the marker line, until the next
 * section does. At the bottom of the document the last section wins even if its
 * heading never reaches the marker — a short trailing section would otherwise
 * never select.
 */

/** Viewport Y at which a section heading counts as in view. */
export const SECTION_IN_VIEW_MARKER_PX = 96;

export function sectionInView(
  sections: readonly { id: string; top: number }[],
  marker: number,
  atEnd = false,
): string | undefined {
  if (sections.length === 0) return undefined;
  if (atEnd) return sections[sections.length - 1]?.id;
  let current = sections[0]?.id;
  for (const section of sections) {
    if (section.top <= marker) current = section.id;
  }
  return current;
}
