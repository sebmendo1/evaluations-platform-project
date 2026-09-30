"use client";

import { useEffect, useState, type MouseEvent } from "react";

import {
  SECTION_IN_VIEW_MARKER_PX,
  sectionInView,
} from "@/lib/section-in-view";

/**
 * 05 §1 / §6 · right-hand section navigation that tracks the section in view.
 *
 * Anchors rather than tabs: these are seven sections of one document, not seven
 * views of one object. Selected is the 2px left accent (08 §3). Compare still
 * marks changed sections. This is not the retired four-tab side panel.
 */
export function SectionAnchors({
  sections,
  compare,
}: {
  sections: { id: string; label: string; changed: boolean }[];
  compare: boolean;
}) {
  const [current, setCurrent] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const ids = sections.map((section) => section.id);

    function read() {
      const atEnd =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 24;
      const measured = ids.map((id) => {
        const el = document.getElementById(id);
        return {
          id,
          top: el?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY,
        };
      });
      const next = sectionInView(measured, SECTION_IN_VIEW_MARKER_PX, atEnd);
      if (next) setCurrent(next);
    }

    let frame = 0;
    function onScroll() {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        read();
      });
    }

    const boot = window.requestAnimationFrame(read);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.cancelAnimationFrame(boot);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [sections]);

  function goTo(id: string, event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    setCurrent(id);
    document.getElementById(id)?.scrollIntoView();
    const url = new URL(window.location.href);
    window.history.replaceState(null, "", `${url.pathname}${url.search}#${id}`);
  }

  return (
    <nav className="anchornav" aria-label="Bundle sections">
      {sections.map((section) => (
        <a
          className="anchornav-item"
          href={`#${section.id}`}
          key={section.id}
          aria-current={current === section.id ? "location" : undefined}
          onClick={(event) => goTo(section.id, event)}
        >
          {section.label}
          {compare && section.changed ? (
            <span className="anchornav-mark">changed</span>
          ) : null}
        </a>
      ))}
    </nav>
  );
}
